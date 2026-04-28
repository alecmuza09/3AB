/**
 * Integración con Webservice 3.0 de Innovation Line
 *
 * Autenticación:
 *   Header: auth-token = INNOVATION_AUTH_TOKEN
 *   Query:  User = INNOVATION_USER, Clave = INNOVATION_CLAVE
 *
 * Horario de operación (CDMX, UTC-6):
 *   09:00-10:00  |  13:00-14:00  |  17:00-18:00
 *
 * Notas:
 *  - Las URLs de imagen que empiezan con "//" requieren prefijo "https:".
 *  - Stock viene como string numérico → usar parseInt().
 *  - La paginación empieza en page=1.
 *  - No se almacenan imágenes; se usan directamente las URLs del CDN.
 */

import { innovationConfig } from './integrations-config'

// ============================================
// TIPOS
// ============================================

export interface InnovationVariante {
  'Codigo Variante': string
  Tono: string
  Imagen: string
  Stock: string
}

export interface InnovationProduct {
  Nombre: string
  Codigo: string
  Categoria: string
  ImagenP: string
  Variantes: InnovationVariante[]
  Stock: string
}

export interface InnovationSubcategoria {
  Nombre: string
}

export interface InnovationCategoria {
  Categoria: string
  URLImage: string
  SubCategorias: InnovationSubcategoria[]
}

export interface InnovationCatalogo {
  Nombre: string
  Fippbook: string
}

export interface InnovationTono {
  Nombre: string
  RGB: string
}

// ============================================
// HELPERS
// ============================================

/** Normaliza URL de imagen: agrega "https:" si comienza con "//" */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  const s = String(url).trim()
  if (s.startsWith('//')) return `https:${s}`
  return s
}

/** Verifica si la API de Innovation está dentro del horario permitido (CDMX UTC-6) */
export function isWithinInnovationHours(): boolean {
  const now = new Date()
  // Convertir a hora CDMX (UTC-6)
  const cdmxOffset = -6 * 60
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const cdmxMinutes = ((utcMinutes + cdmxOffset) + 24 * 60) % (24 * 60)
  const h = Math.floor(cdmxMinutes / 60)
  const m = cdmxMinutes % 60
  const t = h * 60 + m

  // Ventanas: 09:00-10:00, 13:00-14:00, 17:00-18:00
  return (t >= 540 && t < 600) || (t >= 780 && t < 840) || (t >= 1020 && t < 1080)
}

// ============================================
// CLIENTE HTTP BASE
// ============================================

async function callInnovationApi<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  if (!innovationConfig.isEnabled()) {
    throw new Error('Innovation Line no está configurado. Verifica INNOVATION_AUTH_TOKEN, INNOVATION_USER y INNOVATION_CLAVE.')
  }

  const qs = new URLSearchParams({
    User: innovationConfig.user,
    Clave: innovationConfig.clave,
    ...params,
  })

  const url = `${endpoint}?${qs.toString()}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), innovationConfig.timeout)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'auth-token': innovationConfig.authToken,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 401) {
      const body = await response.text().catch(() => '')
      throw new Error(`Token inválido o ausente (401). Verifica INNOVATION_AUTH_TOKEN.\nRespuesta: ${body.substring(0, 200)}`)
    }
    if (response.status === 403) {
      const body = await response.text().catch(() => '')
      // Detectar respuesta específica de "fuera de horario" que devuelve Innovation Line
      try {
        const parsed = JSON.parse(body)
        const resp = parsed?.respuesta_llave?.response
        if (resp?.Activo === false && resp?.Status === 'Fuera de horario') {
          throw new Error('FUERA_DE_HORARIO')
        }
        if (parsed?.error) {
          throw new Error(`Innovation Line: ${parsed.error}`)
        }
      } catch (parseErr) {
        if ((parseErr as Error).message === 'FUERA_DE_HORARIO' || (parseErr as Error).message.startsWith('Innovation Line:')) {
          throw parseErr
        }
      }
      throw new Error(`Sin permiso al recurso (403). Credenciales: User/Clave correctos pero acceso denegado.\nRespuesta: ${body.substring(0, 200)}`)
    }
    if (response.status === 404) throw new Error(`Ruta incorrecta (404): ${endpoint}`)
    if (response.status === 405) throw new Error('Método HTTP incorrecto (405).')
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    // Algunas respuestas vienen con HTTP 200 pero con un body de error embebido.
    // Validamos esos casos para que no se propaguen como datos válidos.
    const data = (await response.json()) as any
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const respCheck = data?.respuesta_llave?.response
      const correctDatos = respCheck?.Correct_Datos
      const activo = respCheck?.Activo
      const statusInner = respCheck?.Status

      // Diferenciar credenciales inválidas vs fuera de horario:
      // - Correct_Datos === false  →  CREDENCIALES INVÁLIDAS
      // - Correct_Datos === true   →  credenciales OK (cualquier otro fallo es horario / activación)
      if (correctDatos === false) {
        throw new Error('CREDENCIALES_INVALIDAS')
      }
      if (activo === false || statusInner === 'Fuera de horario') {
        throw new Error('FUERA_DE_HORARIO')
      }
      if (data.error && typeof data.error === 'string') {
        const msg = data.error.toLowerCase()
        if (msg.includes('credenciales') || msg.includes('invalidas')) {
          throw new Error('CREDENCIALES_INVALIDAS')
        }
        if (msg.includes('no activo') || msg.includes('fuera de horario') || msg.includes('horario')) {
          throw new Error('FUERA_DE_HORARIO')
        }
        throw new Error(`Innovation Line: ${data.error}`)
      }
    }

    return data as T
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Timeout al llamar Innovation Line (${innovationConfig.timeout}ms): ${endpoint}`)
    }
    throw error
  }
}

// ============================================
// ENDPOINTS
// ============================================

/**
 * Obtiene todos los productos con stock, paginando automáticamente.
 * Usa GetAllProducts (limit=1500 por página).
 */
export async function getAllProductsFromInnovation(): Promise<InnovationProduct[]> {
  const all: InnovationProduct[] = []
  let page = 1
  let totalPages = 1
  const limit = 1500

  do {
    const raw = await callInnovationApi<any>(
      'https://4vumtdis3m.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAllProductos',
      { page: String(page), limit: String(limit) }
    )

    // La respuesta puede ser un array directo o un objeto con una propiedad de productos
    const products: any[] = Array.isArray(raw)
      ? raw
      : (raw?.productos ?? raw?.Productos ?? raw?.data ?? [])

    if (typeof raw?.paginas_totales === 'number') {
      totalPages = raw.paginas_totales
    } else if (typeof raw?.paginas_totales === 'string') {
      totalPages = parseInt(raw.paginas_totales, 10) || 1
    }

    for (const p of products) {
      all.push({
        Nombre: p.Nombre ?? '',
        Codigo: p.Codigo ?? '',
        Categoria: p.Categoria ?? '',
        ImagenP: normalizeImageUrl(p.ImagenP),
        Stock: String(p.Stock ?? '0'),
        Variantes: (p.Variantes ?? []).map((v: any) => ({
          'Codigo Variante': v['Codigo Variante'] ?? v.CodigoVariante ?? '',
          Tono: v.Tono ?? '',
          Imagen: normalizeImageUrl(v.Imagen),
          Stock: String(v.Stock ?? '0'),
        })),
      })
    }

    page++
  } while (page <= totalPages)

  return all
}

/**
 * Obtiene el listado ligero de todos los productos (sin variantes ni stock detallado).
 * Útil para validar conexión o cargar el catálogo inicial rápido.
 */
export async function getAllProductsLightFromInnovation(): Promise<{ Nombre: string; Codigo: string; Categoria: string }[]> {
  const raw = await callInnovationApi<any>(
    'https://1x4nyx8c80.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAll_ProducLight'
  )
  const products: any[] = Array.isArray(raw) ? raw : (raw?.productos ?? raw?.data ?? [])
  return products.map((p) => ({
    Nombre: p.Nombre ?? '',
    Codigo: p.Codigo ?? '',
    Categoria: p.Categoria ?? '',
  }))
}

/** Obtiene todas las categorías del catálogo. */
export async function getAllCategoriasFromInnovation(): Promise<InnovationCategoria[]> {
  const raw = await callInnovationApi<any>(
    'https://l8g7ouqzdh.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAllCategorias'
  )
  const items: any[] = Array.isArray(raw) ? raw : (raw?.categorias ?? raw?.data ?? [])
  return items.map((c) => ({
    Categoria: c.Categoria ?? '',
    URLImage: normalizeImageUrl(c.URLImage),
    SubCategorias: (c.SubCategorias ?? []).map((s: any) =>
      typeof s === 'string' ? { Nombre: s } : { Nombre: s.Nombre ?? '' }
    ),
  }))
}

/** Obtiene todos los catálogos digitales (Flippingbook). */
export async function getAllCatalogosFromInnovation(): Promise<InnovationCatalogo[]> {
  const raw = await callInnovationApi<any>(
    'https://ehn5iq6p66.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAllCatalogos'
  )
  const items: any[] = Array.isArray(raw) ? raw : (raw?.catalogos ?? raw?.data ?? [])
  return items.map((c) => ({
    Nombre: c.Nombre ?? '',
    Fippbook: c.Fippbook ?? c.Flippbook ?? '',
  }))
}

/** Obtiene todos los tonos del sistema (útil para filtros de color). */
export async function getAllTonosFromInnovation(): Promise<InnovationTono[]> {
  const raw = await callInnovationApi<any>(
    'https://ak6v62m0k4.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAllTonos'
  )
  const items: any[] = Array.isArray(raw) ? raw : (raw?.tonos ?? raw?.data ?? [])
  return items.map((t) => ({
    Nombre: t.Nombre ?? '',
    RGB: t.RGB ?? '',
  }))
}

/**
 * Valida que las credenciales sean correctas haciendo una llamada ligera.
 * Retorna true si la conexión es exitosa, lanza error si falla.
 */
export async function validateInnovationConnection(): Promise<boolean> {
  await getAllProductsLightFromInnovation()
  return true
}
