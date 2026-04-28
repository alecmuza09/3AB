/**
 * Integración con Webservice PromoOpción — Versión 2 (REST/JSON)
 *
 * Base URL:  https://www.contenidopromo.com/wsds/mx/
 * Método:    POST
 * Headers:   user: <USER>   |   x-api-key: <API_KEY>
 * Body:      demo=1 (desarrollo/sin límite)  |  demo=0 (productivo/límite por hora)
 *
 * Flujo recomendado:
 *   1. getExistencias() → Map<item_code, stock>
 *   2. getCatalogo()    → array normalizado de ítems
 *   3. mergeStockIntoCatalogo() → enriquecer ítems con stock
 *   4. groupByParent()  → agrupar variantes bajo su producto padre
 *
 * Notas:
 *  - Los precios NO están disponibles en la API (política comercial).
 *  - item_code = código hijo (variante con color específico)
 *  - parent_code = código padre (producto genérico sin color)
 *  - Las imágenes se sirven desde https://www.contenidopromo.com/Images/Items/
 *    usando la URL directa del campo `img`. No se descargan localmente.
 *  - La V1 SOAP existe pero solo se usará si se necesitan datos adicionales
 *    (fichaTecnica, colores individuales). V2 es suficiente para el sync masivo.
 */

import { promoopcionConfig } from './integrations-config'

// ============================================
// TIPOS
// ============================================

export interface PromoOpcionItem {
  item_code: string
  parent_code: string
  family: string
  name: string
  description: string
  color: string
  colors: string
  size: string
  material: string
  capacity: string
  batteries: string
  printing: string
  printing_area: string
  nw: string
  gw: string
  height: string
  width: string
  length: string
  count_box: string
  img: string
  stock: number
}

export type CatalogoRaw = Record<string, Omit<PromoOpcionItem, 'stock'>>
export type ExistenciasRaw = Record<string, number>

// ============================================
// CLIENTE HTTP BASE
// ============================================

async function callPromoOpcionV2<T>(
  path: string,
  extraBody: Record<string, string> = {}
): Promise<T> {
  if (!promoopcionConfig.isEnabled()) {
    throw new Error(
      'PromoOpción no está configurado. Verifica PROMOOPCION_USER y PROMOOPCION_API_KEY.'
    )
  }

  const demoMode = promoopcionConfig.demo ? '1' : '0'
  const bodyParams = new URLSearchParams({ demo: demoMode, ...extraBody })

  // Normalizar base URL y construir URL sin barra duplicada al final del path
  const baseUrl = promoopcionConfig.baseUrl.endsWith('/')
    ? promoopcionConfig.baseUrl
    : promoopcionConfig.baseUrl + '/'
  // Quitar barra final del path para evitar doble barra o problemas con algunos servidores
  const cleanPath = path.replace(/\/$/, '')
  const url = `${baseUrl}${cleanPath}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), promoopcionConfig.timeout)

  const makeRequest = async (targetUrl: string) =>
    fetch(targetUrl, {
      method: 'POST',
      headers: {
        'user': promoopcionConfig.user,
        'x-api-key': promoopcionConfig.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': '3ABranding/1.0',
      },
      body: bodyParams.toString(),
      signal: controller.signal,
    })

  try {
    let response = await makeRequest(url)

    // Si da 404, intentar con barra final (algunos servidores requieren uno u otro)
    if (response.status === 404) {
      response = await makeRequest(url + '/')
    }

    clearTimeout(timeoutId)

    if (response.status === 401) {
      const body = await response.text().catch(() => '')
      throw new Error(`Credenciales inválidas (401). Verifica PROMOOPCION_USER y PROMOOPCION_API_KEY.\nRespuesta: ${body.substring(0, 200)}`)
    }
    if (response.status === 403) {
      const body = await response.text().catch(() => '')
      throw new Error(`Sin permiso al recurso (403).\nRespuesta: ${body.substring(0, 200)}`)
    }
    if (response.status === 404) {
      const body = await response.text().catch(() => '')
      throw new Error(`Endpoint no encontrado (404): ${url}\nRespuesta del servidor: ${body.substring(0, 300)}`)
    }
    if (response.status === 429) throw new Error('Límite de consultas excedido (429). Activa PROMOOPCION_DEMO=1 para pruebas sin límite.')
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${response.statusText}\nRespuesta: ${body.substring(0, 200)}`)
    }

    return (await response.json()) as T
  } catch (err) {
    clearTimeout(timeoutId)
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Timeout al llamar PromoOpción (${promoopcionConfig.timeout}ms): ${url}`)
    }
    throw err
  }
}

// ============================================
// ENDPOINTS
// ============================================

/**
 * Obtiene el catálogo completo (V2).
 * La respuesta es un objeto { item_code: { ...campos } }.
 * Se convierte a array para facilitar el procesamiento.
 */
export async function getCatalogoFromPromoOpcion(): Promise<PromoOpcionItem[]> {
  const raw = await callPromoOpcionV2<CatalogoRaw>('catalogo/')

  return Object.entries(raw).map(([key, item]) => ({
    item_code:     item.item_code     || key,
    parent_code:   item.parent_code   || key,
    family:        item.family        || '',
    name:          item.name          || '',
    description:   item.description   || '',
    color:         item.color         || '',
    colors:        item.colors        || '',
    size:          item.size          || '',
    material:      item.material      || '',
    capacity:      item.capacity      || '',
    batteries:     item.batteries     || '0',
    printing:      item.printing      || '',
    printing_area: item.printing_area || '',
    nw:            item.nw            || '',
    gw:            item.gw            || '',
    height:        item.height        || '',
    width:         item.width         || '',
    length:        item.length        || '',
    count_box:     item.count_box     || '',
    img:           item.img           || '',
    stock:         0,
  }))
}

/**
 * Obtiene el stock actual de todos los ítems (V2).
 * Se actualiza cada 30 minutos en el servidor de PromoOpción.
 * Devuelve un Map para cruce O(1) con el catálogo.
 */
export async function getExistenciasFromPromoOpcion(): Promise<Map<string, number>> {
  const raw = await callPromoOpcionV2<ExistenciasRaw>('existencias/')
  const map = new Map<string, number>()
  for (const [code, stock] of Object.entries(raw)) {
    map.set(code, typeof stock === 'number' ? stock : parseInt(String(stock), 10) || 0)
  }
  return map
}

/**
 * Obtiene las URLs de los paquetes ZIP de imágenes descargables (V2).
 * No es necesario para el sync; útil para descarga bulk offline.
 */
export async function getImagenesFromPromoOpcion(): Promise<{
  url_item: string
  url_parent: string
  url_vector: string
}> {
  return callPromoOpcionV2('imagenes/')
}

// ============================================
// HELPERS
// ============================================

/**
 * Combina el catálogo con las existencias usando item_code como llave.
 * Los ítems sin stock registrado quedan con stock = 0.
 */
export function mergeStockIntoCatalogo(
  items: PromoOpcionItem[],
  existencias: Map<string, number>
): PromoOpcionItem[] {
  return items.map((item) => ({
    ...item,
    stock: existencias.get(item.item_code) ?? 0,
  }))
}

/**
 * Agrupa los ítems del catálogo por parent_code.
 * Cada grupo representa un producto padre con sus variantes (colores).
 */
export function groupByParent(
  items: PromoOpcionItem[]
): Map<string, PromoOpcionItem[]> {
  const groups = new Map<string, PromoOpcionItem[]>()
  for (const item of items) {
    const key = item.parent_code || item.item_code
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  return groups
}
