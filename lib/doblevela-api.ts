/**
 * Integración con el servicio SOAP de Doblevela
 *
 * Operaciones disponibles:
 *  - GetExistenciaAll  → todos los productos con existencias
 *  - GetExistencia     → existencias de un código específico
 *  - GetrProdImagenes  → imágenes de un producto
 *
 * El inventario disponible es la SUMA de:
 *   Almacén 7 + Almacén 9 + Almacén 15 + Almacén 20 + Almacén 24  (CDMX)
 */

import { doblevelaConfig } from './integrations-config'

// ============================================
// TIPOS DE DATOS
// ============================================

export interface DoblevelaApiResponse {
  intCodigo: number
  strMensaje: string
  Resultado: DoblevelaProductRaw[]
}

/**
 * Estructura que devuelve la API de Doblevela en el array Resultado.
 * Los campos con nombre de almacén son los de inventario.
 */
export interface DoblevelaProductRaw {
  Codigo: string
  Descripcion: string
  Precio: number
  /** Puede venir como número o null/undefined */
  'Disponible Almacén 7'?: number | null
  'Disponible Almacén 9'?: number | null
  'Disponible Almacén 15'?: number | null
  'Disponible Almacén 20'?: number | null
  'Disponible Almacén 24'?: number | null
  /** Otros campos que puedan llegar */
  [key: string]: unknown
}

export interface DoblevelaImageResponse {
  intCodigo: number
  strMensaje: string
  Resultado: DoblevelaImageRaw[]
}

export interface DoblevelaImageRaw {
  Codigo: string
  URL: string
  [key: string]: unknown
}

/** Producto normalizado listo para sincronizar a Supabase */
export interface DoblevelaProduct {
  codigo: string
  descripcion: string
  precio: number
  inventario: number
  imagenes: string[]
}

// ============================================
// ALMACENES QUE SUMAN EL INVENTARIO (CDMX)
// ============================================

const ALMACENES_CDMX = [
  'Disponible Almacén 7',
  'Disponible Almacén 9',
  'Disponible Almacén 15',
  'Disponible Almacén 20',
  'Disponible Almacén 24',
] as const

// ============================================
// LLAMADAS A LA API (HTTP GET, sin SOAP client)
// ============================================

/**
 * Llama a la API de Doblevela vía HTTP GET y parsea la respuesta XML/JSON.
 * El servicio envuelve el JSON en un nodo <string xmlns="...">{JSON}</string>
 * pero cuando se usa HTTP GET devuelve el JSON directamente en el body.
 */
async function callDoblevelaEndpoint<T>(
  operation: string,
  params: Record<string, string>
): Promise<T | null> {
  try {
    const qs = new URLSearchParams({ ...params, Key: doblevelaConfig.apiKey })
    const url = `${doblevelaConfig.serviceUrl}/${operation}?${qs.toString()}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), doblevelaConfig.timeout)

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json, text/xml' },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const text = await response.text()

    // La respuesta puede venir envuelta en <string xmlns="...">JSON</string>
    const jsonStr = extractJsonFromXml(text)

    return JSON.parse(jsonStr) as T
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[Doblevela] Timeout en operación ${operation}`)
    } else {
      console.error(`[Doblevela] Error en ${operation}:`, error)
    }
    return null
  }
}

/**
 * Si el texto viene envuelto en XML (<string>...</string>), extrae el JSON interior.
 */
function extractJsonFromXml(text: string): string {
  const match = text.match(/<string[^>]*>([\s\S]*?)<\/string>/)
  return match ? match[1].trim() : text.trim()
}

// ============================================
// FUNCIONES PÚBLICAS DE LA API
// ============================================

/**
 * Obtiene todos los productos del catálogo con sus existencias.
 */
export async function getAllProductsFromDoblevela(): Promise<DoblevelaProductRaw[]> {
  if (!doblevelaConfig.isEnabled()) {
    console.warn('[Doblevela] Integración no está configurada')
    return []
  }

  const data = await callDoblevelaEndpoint<DoblevelaApiResponse>('GetExistenciaAll', {})

  if (!data) return []

  if (data.intCodigo !== 0) {
    const msg = `[Doblevela] GetExistenciaAll: código ${data.intCodigo} — ${data.strMensaje}`
    console.warn(msg)
    // Lanzar error con el mensaje de la API para que el caller lo capture
    throw new Error(data.strMensaje || `Error código ${data.intCodigo}`)
  }

  return Array.isArray(data.Resultado) ? data.Resultado : []
}

/**
 * Obtiene existencias de un producto por código.
 */
export async function getProductByCodeFromDoblevela(
  codigo: string
): Promise<DoblevelaProductRaw | null> {
  if (!doblevelaConfig.isEnabled()) return null

  const data = await callDoblevelaEndpoint<DoblevelaApiResponse>('GetExistencia', { codigo })

  if (!data || data.intCodigo !== 0) return null

  const results = Array.isArray(data.Resultado) ? data.Resultado : []
  return results[0] ?? null
}

/**
 * Obtiene las imágenes de un producto por código.
 */
export async function getProductImagesFromDoblevela(codigo: string): Promise<string[]> {
  if (!doblevelaConfig.isEnabled()) return []

  const data = await callDoblevelaEndpoint<DoblevelaImageResponse>('GetrProdImagenes', {
    Codigo: codigo,
  })

  if (!data || data.intCodigo !== 0) return []

  const results = Array.isArray(data.Resultado) ? data.Resultado : []
  return results.map((r) => r.URL).filter(Boolean)
}

// ============================================
// CÁLCULO DE INVENTARIO CDMX
// ============================================

/**
 * Suma el inventario de los 5 almacenes CDMX.
 */
export function calcularInventarioCdmx(raw: DoblevelaProductRaw): number {
  return ALMACENES_CDMX.reduce((sum, almacen) => {
    const val = raw[almacen]
    return sum + (typeof val === 'number' && !isNaN(val) ? val : 0)
  }, 0)
}

// ============================================
// TRANSFORMACIÓN AL FORMATO NORMALIZADO
// ============================================

/**
 * Convierte los productos crudos de Doblevela a la forma normalizada,
 * calculando el inventario CDMX y cargando las imágenes.
 */
export async function normalizeDoblevelaProducts(
  rawProducts: DoblevelaProductRaw[]
): Promise<DoblevelaProduct[]> {
  const normalized: DoblevelaProduct[] = []

  for (const raw of rawProducts) {
    const inventario = calcularInventarioCdmx(raw)

    // Cargar imágenes (llamada individual por producto)
    let imagenes: string[] = []
    try {
      imagenes = await getProductImagesFromDoblevela(raw.Codigo)
    } catch {
      // No bloquear si falla la carga de imágenes
    }

    normalized.push({
      codigo: raw.Codigo,
      descripcion: raw.Descripcion,
      precio: typeof raw.Precio === 'number' ? raw.Precio : parseFloat(String(raw.Precio)) || 0,
      inventario,
      imagenes,
    })
  }

  return normalized
}
