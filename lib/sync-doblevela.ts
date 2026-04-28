/**
 * Sincronización de productos Doblevela a Supabase
 *
 * Estrategia:
 *  1. Obtener todos los productos vía GetExistenciaAll
 *  2. Para cada producto, cargar imágenes vía GetrProdImagenes
 *  3. Calcular inventario como suma de almacenes CDMX (7, 9, 15, 20, 24)
 *  4. Upsert en Supabase: categories → products → product_variations → product_images
 */

import { createSupabaseServerClient } from './supabase'
import {
  getAllProductsFromDoblevela,
  getProductImagesFromDoblevela,
  calcularInventarioCdmx,
  type DoblevelaProductRaw,
} from './doblevela-api'

// ============================================
// TIPOS
// ============================================

export interface DoblevelaSyncResult {
  success: boolean
  categoriesCreated: number
  categoriesUpdated: number
  productsCreated: number
  productsUpdated: number
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
      console.error(`[Doblevela] Error creando categoría ${categoryName}:`, error)
      return null
    }

    return data?.id ?? null
  } catch (error) {
    console.error(`[Doblevela] upsertCategory ${categoryName}:`, error)
    return null
  }
}

async function upsertProduct(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  raw: DoblevelaProductRaw,
  imagenes: string[],
  categoryId: string | null
): Promise<{ productId: string | null; isNew: boolean }> {
  const sku = `DV-${raw.Codigo}`
  const slug = `${generateSlug(raw.Descripcion)}-${raw.Codigo}`.substring(0, 100)
  const inventario = calcularInventarioCdmx(raw)
  const precio =
    typeof raw.Precio === 'number' ? raw.Precio : parseFloat(String(raw.Precio)) || 0
  const imageUrl = imagenes[0] ?? null

  const attributes = {
    proveedor: 'doblevela',
    codigo_proveedor: raw.Codigo,
  }

  const productData = {
    sku,
    name: raw.Descripcion,
    slug,
    description: raw.Descripcion ?? null,
    short_description: raw.Descripcion ? String(raw.Descripcion).substring(0, 200) : null,
    category_id: categoryId,
    price: precio,
    min_price: precio,
    max_price: null,
    stock_quantity: inventario,
    min_quantity: 1,
    multiple_of: 1,
    attributes,
    image_url: imageUrl,
    is_active: inventario > 0,
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
        console.error(`[Doblevela] Error actualizando producto ${sku}:`, error)
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
      console.error(`[Doblevela] Error creando producto ${sku}:`, error)
      return { productId: null, isNew: false }
    }

    return { productId: data?.id ?? null, isNew: true }
  } catch (error) {
    console.error(`[Doblevela] upsertProduct ${sku}:`, error)
    return { productId: null, isNew: false }
  }
}

async function upsertProductImages(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  nombre: string,
  imagenes: string[]
): Promise<number> {
  let count = 0

  try {
    await supabase.from('product_images').delete().eq('product_id', productId)

    for (let i = 0; i < imagenes.length; i++) {
      const { error } = await supabase.from('product_images').insert({
        product_id: productId,
        image_url: imagenes[i],
        alt_text: i === 0 ? nombre : `${nombre} - imagen ${i + 1}`,
        order_index: i,
        is_primary: i === 0,
      })
      if (!error) count++
    }
  } catch (error) {
    console.error(`[Doblevela] Error sincronizando imágenes para producto ${productId}:`, error)
  }

  return count
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Sincroniza todos los productos de Doblevela a Supabase.
 * Agrupa los productos bajo la categoría "Doblevela" y usa el SKU prefijado DV-{Codigo}.
 */
export async function syncProductsFromDoblevela(): Promise<DoblevelaSyncResult> {
  const result: DoblevelaSyncResult = {
    success: true,
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    imagesCreated: 0,
    errors: [],
  }

  try {
    const supabase = createSupabaseServerClient()

    console.log('[Doblevela] Obteniendo productos...')
    let rawProducts: DoblevelaProductRaw[] = []
    try {
      rawProducts = await getAllProductsFromDoblevela()
    } catch (apiError) {
      const msg = apiError instanceof Error ? apiError.message : 'Error desconocido'
      result.errors.push(msg)
      result.success = false
      return result
    }

    if (rawProducts.length === 0) {
      result.errors.push('No se obtuvieron productos de Doblevela')
      result.success = false
      return result
    }

    console.log(`[Doblevela] ${rawProducts.length} productos recibidos`)

    // Categoría global para todos los productos Doblevela
    const categoryId = await upsertCategory(supabase, 'Doblevela')
    if (categoryId) {
      result.categoriesCreated++
    }

    for (const raw of rawProducts) {
      try {
        // Cargar imágenes del producto
        let imagenes: string[] = []
        try {
          imagenes = await getProductImagesFromDoblevela(raw.Codigo)
        } catch {
          // No bloquear si falla
        }

        const { productId, isNew } = await upsertProduct(supabase, raw, imagenes, categoryId)

        if (!productId) {
          result.errors.push(`No se pudo crear/actualizar producto ${raw.Codigo}`)
          continue
        }

        if (isNew) {
          result.productsCreated++
        } else {
          result.productsUpdated++
        }

        const imgsCount = await upsertProductImages(supabase, productId, raw.Descripcion, imagenes)
        result.imagesCreated += imgsCount
      } catch (error) {
        const msg = `Error procesando ${raw.Codigo}: ${error instanceof Error ? error.message : 'desconocido'}`
        console.error(`[Doblevela] ${msg}`)
        result.errors.push(msg)
      }
    }

    console.log('[Doblevela] Sincronización completada:', result)
  } catch (error) {
    const msg = `Error general: ${error instanceof Error ? error.message : 'desconocido'}`
    console.error(`[Doblevela] ${msg}`)
    result.errors.push(msg)
    result.success = false
  }

  return result
}
