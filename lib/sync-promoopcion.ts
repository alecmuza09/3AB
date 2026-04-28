/**
 * Sincronización de productos PromoOpción → Supabase
 *
 * Flujo:
 *  1. getExistencias (V2) → Map<item_code, stock>
 *  2. getCatalogo (V2)    → array de ítems
 *  3. merge stock en cada ítem
 *  4. groupByParent       → agrupar variantes bajo producto padre
 *  5. Por cada grupo:
 *     a. upsertCategory (family)
 *     b. upsertProduct   (parent_code como base, stock total = suma variantes)
 *     c. upsertVariations (una por item_code, color, stock individual)
 *     d. upsertProductImages
 *
 * Los precios se dejan en 0 — PromoOpción no los expone en la API.
 */

import { createSupabaseServerClient } from './supabase'
import {
  getCatalogoFromPromoOpcion,
  getExistenciasFromPromoOpcion,
  mergeStockIntoCatalogo,
  groupByParent,
  type PromoOpcionItem,
} from './promoopcion-api'

// ============================================
// TIPOS
// ============================================

export interface PromoOpcionSyncResult {
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
      console.error(`[PromoOpción] Error creando categoría "${categoryName}":`, error)
      return null
    }
    return data?.id ?? null
  } catch (err) {
    console.error(`[PromoOpción] upsertCategory "${categoryName}":`, err)
    return null
  }
}

async function upsertProduct(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  parentCode: string,
  variants: PromoOpcionItem[],
  categoryId: string | null
): Promise<{ productId: string | null; isNew: boolean }> {
  const base = variants[0]
  const sku = `PO-${parentCode}`
  const slug = `${generateSlug(base.name || parentCode)}-${parentCode}`.substring(0, 100)

  const stockTotal = variants.reduce((sum, v) => sum + v.stock, 0)

  // Colores únicos
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))]

  // Imagen principal: primer ítem con imagen
  const mainImage = variants.find((v) => v.img)?.img || null

  const attributes = {
    proveedor: 'promoopcion',
    codigo_proveedor: parentCode,
    family: base.family || '',
    material: base.material || '',
    size: base.size || '',
    printing: base.printing || '',
    printing_area: base.printing_area || '',
    colors,
    batteries: base.batteries === '1',
  }

  const productData = {
    sku,
    name: base.name || parentCode,
    slug,
    description: base.description || null,
    short_description: base.description ? base.description.substring(0, 200) : null,
    category_id: categoryId,
    price: 0,
    min_price: 0,
    max_price: null,
    stock_quantity: stockTotal,
    min_quantity: 1,
    multiple_of: 1,
    weight: base.gw ? parseFloat(base.gw) || null : null,
    dimensions: {
      height: base.height || null,
      width: base.width || null,
      length: base.length || null,
    },
    attributes,
    image_url: mainImage,
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
        console.error(`[PromoOpción] Error actualizando producto ${sku}:`, error)
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
      console.error(`[PromoOpción] Error creando producto ${sku}:`, error)
      return { productId: null, isNew: false }
    }
    return { productId: data?.id ?? null, isNew: true }
  } catch (err) {
    console.error(`[PromoOpción] upsertProduct ${sku}:`, err)
    return { productId: null, isNew: false }
  }
}

async function upsertVariations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  variants: PromoOpcionItem[]
): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  for (const v of variants) {
    try {
      const variationSku = `PO-${v.item_code}`
      const variationName = `${v.name} - ${v.color || v.item_code}`

      const variationData = {
        product_id: productId,
        name: variationName,
        sku: variationSku,
        price: 0,
        stock_quantity: v.stock,
        attributes: {
          color: v.color || '',
          item_code: v.item_code,
          capacity: v.capacity || '',
          material: v.material || '',
        },
        image_url: v.img || null,
        is_active: v.stock > 0,
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
      console.error(`[PromoOpción] Error procesando variante ${v.item_code}:`, err)
    }
  }

  return { created, updated }
}

async function upsertProductImages(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  variants: PromoOpcionItem[]
): Promise<number> {
  let count = 0
  try {
    await supabase.from('product_images').delete().eq('product_id', productId)

    let orderIndex = 0

    for (const v of variants) {
      if (!v.img) continue

      // Obtener ID de variación para linkear imagen
      let variationId: string | null = null
      const { data: varRow } = await supabase
        .from('product_variations')
        .select('id')
        .eq('product_id', productId)
        .eq('sku', `PO-${v.item_code}`)
        .single()
      variationId = varRow?.id ?? null

      const { error } = await supabase.from('product_images').insert({
        product_id: productId,
        variation_id: variationId,
        image_url: v.img,
        alt_text: `${v.name}${v.color ? ` - ${v.color}` : ''}`,
        order_index: orderIndex,
        is_primary: orderIndex === 0,
      })

      if (!error) {
        count++
        orderIndex++
      }
    }
  } catch (err) {
    console.error(`[PromoOpción] Error sincronizando imágenes para ${productId}:`, err)
  }
  return count
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Sincroniza todos los productos de PromoOpción a Supabase.
 *
 * Estrategia:
 *  1. Obtiene existencias primero (más ligero) y construye un Map en memoria.
 *  2. Obtiene el catálogo completo y fusiona el stock.
 *  3. Agrupa por parent_code y upsert en Supabase.
 */
export async function syncProductsFromPromoOpcion(): Promise<PromoOpcionSyncResult> {
  const result: PromoOpcionSyncResult = {
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

  try {
    const supabase = createSupabaseServerClient()

    // 1. Existencias
    console.log('[PromoOpción] Obteniendo existencias...')
    let existencias: Map<string, number>
    try {
      existencias = await getExistenciasFromPromoOpcion()
      console.log(`[PromoOpción] ${existencias.size} existencias recibidas`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      result.errors.push(`Error al obtener existencias: ${msg}`)
      result.success = false
      return result
    }

    // 2. Catálogo
    console.log('[PromoOpción] Obteniendo catálogo...')
    let items: PromoOpcionItem[]
    try {
      items = await getCatalogoFromPromoOpcion()
      console.log(`[PromoOpción] ${items.length} ítems en catálogo`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      result.errors.push(`Error al obtener catálogo: ${msg}`)
      result.success = false
      return result
    }

    if (items.length === 0) {
      result.errors.push('El catálogo de PromoOpción vino vacío')
      result.success = false
      return result
    }

    // 3. Merge stock
    const enriched = mergeStockIntoCatalogo(items, existencias)

    // 4. Agrupar por padre
    const groups = groupByParent(enriched)
    console.log(`[PromoOpción] ${groups.size} productos padre a sincronizar`)

    // Caché de categorías
    const categoryCache = new Map<string, string>()

    // 5. Upsert
    for (const [parentCode, variants] of groups.entries()) {
      try {
        const base = variants[0]
        const catName = (base.family || 'PromoOpción').trim()

        let categoryId: string | null = null
        if (categoryCache.has(catName)) {
          categoryId = categoryCache.get(catName)!
        } else {
          categoryId = await upsertCategory(supabase, catName)
          if (categoryId) {
            categoryCache.set(catName, categoryId)
            result.categoriesCreated++
          }
        }

        const { productId, isNew } = await upsertProduct(supabase, parentCode, variants, categoryId)
        if (!productId) {
          result.errors.push(`No se pudo crear/actualizar producto ${parentCode}`)
          continue
        }

        if (isNew) result.productsCreated++
        else result.productsUpdated++

        const vars = await upsertVariations(supabase, productId, variants)
        result.variationsCreated += vars.created
        result.variationsUpdated += vars.updated

        const imgCount = await upsertProductImages(supabase, productId, variants)
        result.imagesCreated += imgCount
      } catch (err) {
        const msg = `Error procesando ${parentCode}: ${err instanceof Error ? err.message : 'desconocido'}`
        console.error(`[PromoOpción] ${msg}`)
        result.errors.push(msg)
      }
    }

    console.log('[PromoOpción] Sincronización completada:', result)
  } catch (err) {
    const msg = `Error general: ${err instanceof Error ? err.message : 'desconocido'}`
    console.error(`[PromoOpción] ${msg}`)
    result.errors.push(msg)
    result.success = false
  }

  return result
}
