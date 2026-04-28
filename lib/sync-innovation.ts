/**
 * Sincronización de productos Innovation Line → Supabase
 *
 * Flujo:
 *  1. GetAllProducts (paginado, limit=1500) para obtener catálogo completo con stock.
 *  2. Por cada producto:
 *     a. Upsert categoría
 *     b. Upsert producto principal con imagen principal (ImagenP)
 *     c. Upsert variantes (colores/tonos) con su imagen y stock individual
 *     d. Upsert product_images (imagen principal + imágenes de variantes)
 *  3. Respetar horario de operación (09-10, 13-14, 17-18 CDMX).
 */

import { createSupabaseServerClient } from './supabase'
import {
  getAllProductsFromInnovation,
  isWithinInnovationHours,
  type InnovationProduct,
  type InnovationVariante,
} from './innovation-api'

// ============================================
// TIPOS
// ============================================

export interface InnovationSyncResult {
  success: boolean
  categoriesCreated: number
  categoriesUpdated: number
  productsCreated: number
  productsUpdated: number
  variationsCreated: number
  variationsUpdated: number
  imagesCreated: number
  errors: string[]
}

// ============================================
// HELPERS
// ============================================

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

async function upsertCategory(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  categoryName: string
): Promise<string | null> {
  if (!categoryName) return null
  try {
    const slug = generateSlug(categoryName)

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      await supabase
        .from('categories')
        .update({ name: categoryName, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      return existing.id
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: categoryName, slug, is_active: true, parent_id: null })
      .select('id')
      .single()

    if (error) {
      console.error(`[Innovation] Error creando categoría "${categoryName}":`, error)
      return null
    }
    return data?.id ?? null
  } catch (err) {
    console.error(`[Innovation] upsertCategory "${categoryName}":`, err)
    return null
  }
}

async function upsertProduct(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  product: InnovationProduct,
  categoryId: string | null
): Promise<{ productId: string | null; isNew: boolean }> {
  const sku = `IL-${product.Codigo}`
  const slug = `${generateSlug(product.Nombre)}-${product.Codigo}`.substring(0, 100)

  // Stock total: sumar variantes (fuente más confiable) o usar el campo Stock del producto
  const stockTotal =
    product.Variantes.length > 0
      ? product.Variantes.reduce((s, v) => s + (parseInt(v.Stock, 10) || 0), 0)
      : parseInt(product.Stock, 10) || 0

  // Precio: Innovation Line no provee precio en GetAllProducts; se deja 0 y se actualiza al sincronizar
  // (el precio real está en GetProducto que requiere una llamada individual — fuera del scope del sync masivo)
  const attributes = {
    proveedor: 'innovation',
    codigo_proveedor: product.Codigo,
    colores: [...new Set(product.Variantes.map((v) => v.Tono).filter(Boolean))],
  }

  const productData = {
    sku,
    name: product.Nombre,
    slug,
    description: product.Nombre ?? null,
    short_description: product.Nombre ? product.Nombre.substring(0, 200) : null,
    category_id: categoryId,
    price: 0,
    min_price: 0,
    max_price: null,
    stock_quantity: stockTotal,
    min_quantity: 1,
    multiple_of: 1,
    attributes,
    image_url: product.ImagenP || null,
    is_active: stockTotal > 0,
    is_featured: false,
    is_bestseller: false,
    updated_at: new Date().toISOString(),
  }

  try {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existing.id)

      if (error) {
        console.error(`[Innovation] Error actualizando producto ${sku}:`, error)
        return { productId: null, isNew: false }
      }
      return { productId: existing.id, isNew: false }
    }

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select('id')
      .single()

    if (error) {
      console.error(`[Innovation] Error creando producto ${sku}:`, error)
      return { productId: null, isNew: false }
    }
    return { productId: data?.id ?? null, isNew: true }
  } catch (err) {
    console.error(`[Innovation] upsertProduct ${sku}:`, err)
    return { productId: null, isNew: false }
  }
}

async function upsertVariations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  product: InnovationProduct
): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  for (const variante of product.Variantes) {
    try {
      const codigoVariante = variante['Codigo Variante']
      if (!codigoVariante) continue

      const variationSku = `IL-${codigoVariante}`
      const variationName = `${product.Nombre} - ${variante.Tono || codigoVariante}`
      const stock = parseInt(variante.Stock, 10) || 0

      const variationData = {
        product_id: productId,
        name: variationName,
        sku: variationSku,
        price: 0,
        stock_quantity: stock,
        attributes: {
          color: variante.Tono || '',
          codigo_variante: codigoVariante,
        },
        image_url: variante.Imagen || null,
        is_active: stock > 0,
        updated_at: new Date().toISOString(),
      }

      const { data: existing } = await supabase
        .from('product_variations')
        .select('id')
        .eq('product_id', productId)
        .eq('sku', variationSku)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('product_variations')
          .update(variationData)
          .eq('id', existing.id)

        if (!error) updated++
      } else {
        const { error } = await supabase
          .from('product_variations')
          .insert(variationData)

        if (!error) created++
      }
    } catch (err) {
      console.error(`[Innovation] Error procesando variante ${variante['Codigo Variante']}:`, err)
    }
  }

  return { created, updated }
}

async function upsertProductImages(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  product: InnovationProduct
): Promise<number> {
  let count = 0
  try {
    await supabase.from('product_images').delete().eq('product_id', productId)

    // Imagen principal del producto
    if (product.ImagenP) {
      const { error } = await supabase.from('product_images').insert({
        product_id: productId,
        image_url: product.ImagenP,
        alt_text: product.Nombre,
        order_index: 0,
        is_primary: true,
      })
      if (!error) count++
    }

    // Imágenes de variantes
    for (let i = 0; i < product.Variantes.length; i++) {
      const variante = product.Variantes[i]
      if (!variante.Imagen) continue

      const codigoVariante = variante['Codigo Variante']

      // Obtener el ID de la variación para linkearla
      let variationId: string | null = null
      if (codigoVariante) {
        const { data: varRow } = await supabase
          .from('product_variations')
          .select('id')
          .eq('product_id', productId)
          .eq('sku', `IL-${codigoVariante}`)
          .single()
        variationId = varRow?.id ?? null
      }

      const { error } = await supabase.from('product_images').insert({
        product_id: productId,
        variation_id: variationId,
        image_url: variante.Imagen,
        alt_text: `${product.Nombre} - ${variante.Tono || codigoVariante}`,
        order_index: 1 + i,
        is_primary: false,
      })
      if (!error) count++
    }
  } catch (err) {
    console.error(`[Innovation] Error sincronizando imágenes para ${productId}:`, err)
  }
  return count
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Sincroniza todos los productos de Innovation Line a Supabase.
 * Respeta el horario de operación de la API (09-10, 13-14, 17-18 CDMX).
 */
export async function syncProductsFromInnovation(): Promise<InnovationSyncResult> {
  const result: InnovationSyncResult = {
    success: true,
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    variationsCreated: 0,
    variationsUpdated: 0,
    imagesCreated: 0,
    errors: [],
  }

  // Advertir si estamos fuera de las ventanas recomendadas, pero intentar de todas formas
  if (!isWithinInnovationHours()) {
    console.warn('[Innovation] Fuera de ventana horaria recomendada (09-10, 13-14, 17-18 CDMX). Intentando de todas formas...')
  }

  try {
    const supabase = createSupabaseServerClient()

    console.log('[Innovation] Obteniendo productos (paginado)...')
    let products: InnovationProduct[] = []
    try {
      products = await getAllProductsFromInnovation()
    } catch (apiError) {
      const msg = apiError instanceof Error ? apiError.message : 'Error desconocido al llamar la API'
      result.errors.push(msg)
      result.success = false
      return result
    }

    if (products.length === 0) {
      result.errors.push('No se obtuvieron productos de Innovation Line')
      result.success = false
      return result
    }

    console.log(`[Innovation] ${products.length} productos recibidos`)

    // Caché de categorías para evitar consultas repetidas
    const categoryCache = new Map<string, string>()

    for (const product of products) {
      try {
        // Categoría
        let categoryId: string | null = null
        const catName = (product.Categoria || 'Innovation Line').trim()

        if (categoryCache.has(catName)) {
          categoryId = categoryCache.get(catName)!
        } else {
          categoryId = await upsertCategory(supabase, catName)
          if (categoryId) {
            categoryCache.set(catName, categoryId)
            result.categoriesCreated++
          }
        }

        // Producto
        const { productId, isNew } = await upsertProduct(supabase, product, categoryId)
        if (!productId) {
          result.errors.push(`No se pudo crear/actualizar producto ${product.Codigo}`)
          continue
        }

        if (isNew) result.productsCreated++
        else result.productsUpdated++

        // Variantes
        if (product.Variantes.length > 0) {
          const vars = await upsertVariations(supabase, productId, product)
          result.variationsCreated += vars.created
          result.variationsUpdated += vars.updated
        }

        // Imágenes
        const imgCount = await upsertProductImages(supabase, productId, product)
        result.imagesCreated += imgCount
      } catch (err) {
        const msg = `Error procesando ${product.Codigo}: ${err instanceof Error ? err.message : 'desconocido'}`
        console.error(`[Innovation] ${msg}`)
        result.errors.push(msg)
      }
    }

    console.log('[Innovation] Sincronización completada:', result)
  } catch (err) {
    const msg = `Error general: ${err instanceof Error ? err.message : 'desconocido'}`
    console.error(`[Innovation] ${msg}`)
    result.errors.push(msg)
    result.success = false
  }

  return result
}
