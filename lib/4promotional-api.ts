/**
 * Integración con API de Inventario de 4Promotional
 * 
 * Este archivo contiene las funciones para obtener productos
 * desde la API de inventario de 4Promotional.
 */

import { inventarioApiConfig } from './integrations-config'
import { WooCommerceProduct, ProductVariation } from './woocommerce-products'

// ============================================
// TIPOS DE DATOS DE LA API
// ============================================

export interface InventarioApiImage {
  tipo_imagen: 'imagen' | 'imagen_extra' | 'imagen_color'
  url_imagen: string
}

export interface InventarioApiProduct {
  id_articulo: string
  desc_promo: number
  color: string
  descripcion: string
  inventario: number
  precio: number
  medida_producto_alto: number
  medida_producto_ancho: number
  area_impresion: string
  metodos_impresion: string
  categoria: string
  sub_categoria: string
  web: 'SI' | 'NO'
  producto_promocion: 'SI' | 'NO'
  producto_nuevo: 'SI' | 'NO'
  precio_unico: 'SI' | 'NO'
  web_color: 'SI' | 'NO'
  nombre_articulo: string
  alto_caja?: number
  ancho_caja?: number
  largo_caja?: number
  peso_caja?: string
  piezas_caja?: number
  origen_mercancia?: 'N' | 'I'
  capacidad?: string
  profundidad_articulo?: number
  imagenes: InventarioApiImage[]
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtiene todos los productos del inventario desde la API
 */
export async function getAllProductsFromInventarioApi(): Promise<InventarioApiProduct[]> {
  try {
    if (!inventarioApiConfig.isEnabled()) {
      console.warn('API de inventario no está configurada')
      return []
    }

    const url = `${inventarioApiConfig.baseUrl}/inventario`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), inventarioApiConfig.timeout)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(inventarioApiConfig.apiKey && { 'Authorization': `Bearer ${inventarioApiConfig.apiKey}` }),
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Timeout al obtener productos del inventario')
    } else {
      console.error('Error al obtener productos del inventario:', error)
    }
    return []
  }
}

/**
 * Obtiene un producto específico por ID desde la API
 */
export async function getProductByIdFromInventarioApi(idArticulo: string): Promise<InventarioApiProduct | null> {
  try {
    const products = await getAllProductsFromInventarioApi()
    const product = products.find(p => p.id_articulo === idArticulo)
    return product || null
  } catch (error) {
    console.error('Error al obtener producto por ID:', error)
    return null
  }
}

/**
 * Obtiene productos filtrados por categoría
 */
export async function getProductsByCategoryFromInventarioApi(categoria: string): Promise<InventarioApiProduct[]> {
  try {
    const products = await getAllProductsFromInventarioApi()
    return products.filter(p => 
      p.categoria.toLowerCase() === categoria.toLowerCase() ||
      p.sub_categoria.toLowerCase() === categoria.toLowerCase()
    )
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error)
    return []
  }
}

/**
 * Obtiene solo productos visibles en web
 */
export async function getVisibleProductsFromInventarioApi(): Promise<InventarioApiProduct[]> {
  try {
    const products = await getAllProductsFromInventarioApi()
    return products.filter(p => p.web === 'SI')
  } catch (error) {
    console.error('Error al obtener productos visibles:', error)
    return []
  }
}

/**
 * Obtiene productos en promoción
 */
export async function getPromotionalProductsFromInventarioApi(): Promise<InventarioApiProduct[]> {
  try {
    const products = await getAllProductsFromInventarioApi()
    return products.filter(p => p.producto_promocion === 'SI' && p.web === 'SI')
  } catch (error) {
    console.error('Error al obtener productos promocionales:', error)
    return []
  }
}

/**
 * Obtiene productos nuevos
 */
export async function getNewProductsFromInventarioApi(): Promise<InventarioApiProduct[]> {
  try {
    const products = await getAllProductsFromInventarioApi()
    return products.filter(p => p.producto_nuevo === 'SI' && p.web === 'SI')
  } catch (error) {
    console.error('Error al obtener productos nuevos:', error)
    return []
  }
}

// ============================================
// FUNCIONES DE MAPEO
// ============================================

/**
 * Convierte un producto de la API de inventario al formato WooCommerce
 */
export function mapInventarioProductToWooCommerce(
  apiProduct: InventarioApiProduct
): WooCommerceProduct {
  // Obtener la imagen principal
  const mainImage = apiProduct.imagenes.find(img => img.tipo_imagen === 'imagen')
  const imageUrl = mainImage?.url_imagen || ''

  // Parsear métodos de impresión
  const metodosImpresion = apiProduct.metodos_impresion
    .split('-')
    .map(m => m.trim())
    .filter(m => m.length > 0)

  // Calcular precio con descuento si aplica
  const precioFinal = apiProduct.desc_promo > 0
    ? apiProduct.precio * (1 - apiProduct.desc_promo / 100)
    : apiProduct.precio

  // Crear variación del producto (ya que cada entrada en la API es una variación por color)
  const variation: ProductVariation = {
    id: `${apiProduct.id_articulo}-${apiProduct.color}`,
    sku: `${apiProduct.id_articulo} ${apiProduct.color}`,
    name: `${apiProduct.nombre_articulo} - ${apiProduct.color}`,
    price: precioFinal,
    stock: apiProduct.inventario,
    color: apiProduct.color,
    attributes: {
      Color: apiProduct.color,
      'Área de Impresión': apiProduct.area_impresion,
      'Métodos de Impresión': metodosImpresion.join(', '),
      ...(apiProduct.capacidad && { Capacidad: apiProduct.capacidad }),
    },
  }

  // Obtener imagen de color si existe
  const colorImage = apiProduct.imagenes.find(img => img.tipo_imagen === 'imagen_color')
  if (colorImage) {
    variation.image = colorImage.url_imagen
  }

  return {
    id: apiProduct.id_articulo,
    sku: apiProduct.id_articulo,
    name: apiProduct.nombre_articulo,
    type: 'variable',
    category: apiProduct.categoria,
    categories: [apiProduct.categoria, apiProduct.sub_categoria].filter(Boolean),
    description: apiProduct.descripcion,
    price: precioFinal,
    stock: apiProduct.inventario,
    visibility: apiProduct.web === 'SI' ? 'visible' : 'hidden',
    published: apiProduct.web === 'SI',
    weight: apiProduct.peso_caja ? parseFloat(apiProduct.peso_caja) : undefined,
    dimensions: {
      length: apiProduct.medida_producto_alto,
      width: apiProduct.medida_producto_ancho,
      height: apiProduct.profundidad_articulo,
    },
    attributes: {
      medidas: `${apiProduct.medida_producto_alto} x ${apiProduct.medida_producto_ancho} cm`,
      areaImpresion: apiProduct.area_impresion,
      tecnicaImpresion: metodosImpresion,
      capacidad: apiProduct.capacidad || undefined,
      color: [apiProduct.color],
      proveedor: '4promotional',
    },
    variations: [variation],
    image: imageUrl,
    minQuantity: 1,
    multipleOf: 1,
  }
}

/**
 * Agrupa productos de la API por id_articulo y crea variaciones por color
 */
export function groupInventarioProductsByArticle(
  apiProducts: InventarioApiProduct[]
): WooCommerceProduct[] {
  // Agrupar productos por id_articulo
  const grouped = new Map<string, InventarioApiProduct[]>()

  for (const product of apiProducts) {
    if (!grouped.has(product.id_articulo)) {
      grouped.set(product.id_articulo, [])
    }
    grouped.get(product.id_articulo)!.push(product)
  }

  // Convertir cada grupo a un producto WooCommerce con variaciones
  const woocommerceProducts: WooCommerceProduct[] = []

  for (const [idArticulo, products] of grouped.entries()) {
    if (products.length === 0) continue

    // Usar el primer producto como base
    const baseProduct = products[0]

    // Obtener la imagen principal
    const mainImage = baseProduct.imagenes.find(img => img.tipo_imagen === 'imagen')
    const imageUrl = mainImage?.url_imagen || ''

    // Parsear métodos de impresión
    const metodosImpresion = baseProduct.metodos_impresion
      .split('-')
      .map(m => m.trim())
      .filter(m => m.length > 0)

    // Calcular precio mínimo y máximo
    const precios = products.map(p => {
      const descuento = p.desc_promo > 0 ? p.precio * (1 - p.desc_promo / 100) : p.precio
      return descuento
    })
    const minPrice = Math.min(...precios)
    const maxPrice = Math.max(...precios)

    // Crear variaciones para cada color
    const variations: ProductVariation[] = products.map(product => {
      const precioFinal = product.desc_promo > 0
        ? product.precio * (1 - product.desc_promo / 100)
        : product.precio

      const colorImage = product.imagenes.find(img => img.tipo_imagen === 'imagen_color')
      
      return {
        id: `${product.id_articulo}-${product.color}`,
        sku: `${product.id_articulo} ${product.color}`,
        name: `${product.nombre_articulo} - ${product.color}`,
        price: precioFinal,
        stock: product.inventario,
        color: product.color,
        attributes: {
          Color: product.color,
          'Área de Impresión': product.area_impresion,
          'Métodos de Impresión': metodosImpresion.join(', '),
          ...(product.capacidad && { Capacidad: product.capacidad }),
        },
        ...(colorImage && { image: colorImage.url_imagen }),
      }
    })

    // Obtener todos los colores únicos
    const colores = [...new Set(products.map(p => p.color))]

    // Calcular stock total
    const stockTotal = products.reduce((sum, p) => sum + p.inventario, 0)

    const woocommerceProduct: WooCommerceProduct = {
      id: idArticulo,
      sku: idArticulo,
      name: baseProduct.nombre_articulo,
      type: 'variable',
      category: baseProduct.categoria,
      categories: [baseProduct.categoria, baseProduct.sub_categoria].filter(Boolean),
      description: baseProduct.descripcion,
      price: minPrice,
      minPrice: minPrice,
      maxPrice: maxPrice,
      stock: stockTotal,
      visibility: baseProduct.web === 'SI' ? 'visible' : 'hidden',
      published: baseProduct.web === 'SI',
      weight: baseProduct.peso_caja ? parseFloat(baseProduct.peso_caja) : undefined,
      dimensions: {
        length: baseProduct.medida_producto_alto,
        width: baseProduct.medida_producto_ancho,
        height: baseProduct.profundidad_articulo,
      },
      attributes: {
        medidas: `${baseProduct.medida_producto_alto} x ${baseProduct.medida_producto_ancho} cm`,
        areaImpresion: baseProduct.area_impresion,
        tecnicaImpresion: metodosImpresion,
        capacidad: baseProduct.capacidad || undefined,
        color: colores,
        proveedor: '4promotional',
      },
      variations,
      image: imageUrl,
      minQuantity: 1,
      multipleOf: 1,
    }

    woocommerceProducts.push(woocommerceProduct)
  }

  return woocommerceProducts
}

/**
 * Obtiene todos los productos de la API y los convierte al formato WooCommerce
 */
export async function getAllWooCommerceProductsFromInventarioApi(): Promise<WooCommerceProduct[]> {
  try {
    const apiProducts = await getAllProductsFromInventarioApi()
    return groupInventarioProductsByArticle(apiProducts)
  } catch (error) {
    console.error('Error al obtener productos WooCommerce desde inventario:', error)
    return []
  }
}

/**
 * Obtiene productos visibles de la API y los convierte al formato WooCommerce
 */
export async function getVisibleWooCommerceProductsFromInventarioApi(): Promise<WooCommerceProduct[]> {
  try {
    const apiProducts = await getVisibleProductsFromInventarioApi()
    return groupInventarioProductsByArticle(apiProducts)
  } catch (error) {
    console.error('Error al obtener productos visibles desde inventario:', error)
    return []
  }
}
