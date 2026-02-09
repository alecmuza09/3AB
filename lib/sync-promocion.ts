/**
 * Sincronización de productos desde 3A Promoción (GraphQL) a Supabase
 */

import { createSupabaseServerClient } from './supabase'
import {
  getProductsFromPromocionApi,
  type PromocionProduct,
} from './promocion-api'

// ============================================
// TIPOS
// ============================================

export interface SyncPromocionResult {
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
  categoryName: string,
  parentId?: string
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
        .update({
          name: categoryName,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      return existing.id
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        slug,
        is_active: true,
        parent_id: parentId || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Error creando categoría ${categoryName}:`, error)
      return null
    }
    return data?.id ?? null
  } catch (error) {
    console.error(`Error en upsertCategory para ${categoryName}:`, error)
    return null
  }
}

async function upsertProduct(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  product: PromocionProduct,
  categoryId: string | null
): Promise<{ productId: string | null; isNew: boolean }> {
  const slug = `${generateSlug(product.name)}-${product.sku}`.substring(0, 100)
  const attributes = {
    ...product.attributes,
    colors: product.colors,
    proveedor: '3a-promocion',
  }

  const productData = {
    sku: product.sku,
    name: product.name,
    slug,
    description: product.description,
    short_description: product.description ? product.description.substring(0, 200) : null,
    category_id: categoryId,
    price: product.price,
    min_price: product.price,
    max_price: null,
    stock_quantity: product.stock,
    min_quantity: 1,
    multiple_of: 1,
    weight: null,
    dimensions: null,
    attributes,
    image_url: product.imageUrl,
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    updated_at: new Date().toISOString(),
  }

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('sku', product.sku)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', existing.id)
    if (error) {
      console.error(`Error actualizando producto ${product.sku}:`, error)
      return { productId: null, isNew: false }
    }
    return { productId: existing.id, isNew: false }
  }

  const { data: inserted, error } = await supabase
    .from('products')
    .insert(productData)
    .select('id')
    .single()

  if (error) {
    console.error(`Error creando producto ${product.sku}:`, error)
    return { productId: null, isNew: false }
  }
  return { productId: inserted?.id ?? null, isNew: true }
}

async function upsertProductImages(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  product: PromocionProduct
): Promise<number> {
  const urls = product.imageUrl ? [product.imageUrl, ...product.images.filter((u) => u !== product.imageUrl)] : product.images
  if (urls.length === 0) return 0

  await supabase.from('product_images').delete().eq('product_id', productId)

  let count = 0
  for (let i = 0; i < urls.length; i++) {
    const { error } = await supabase.from('product_images').insert({
      product_id: productId,
      image_url: urls[i],
      alt_text: product.name,
      order_index: i,
      is_primary: i === 0,
    })
    if (!error) count++
  }
  return count
}

// ============================================
// SINCRONIZACIÓN
// ============================================

export async function syncProductsFromPromocionApi(): Promise<SyncPromocionResult> {
  const result: SyncPromocionResult = {
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
    const categoryMap = new Map<string, string>()

    const products = await getProductsFromPromocionApi()
    if (products.length === 0) {
      result.errors.push('No se obtuvieron productos de la API de 3A Promoción. Verifica la query GraphQL o credenciales.')
      result.success = false
      return result
    }

    for (const product of products) {
      try {
        let categoryId: string | null = null
        const catKey = product.subCategory || product.category

        if (catKey) {
          if (!categoryMap.has(catKey)) {
            const id = await upsertCategory(supabase, catKey)
            if (id) {
              categoryMap.set(catKey, id)
              result.categoriesCreated++
            }
          } else {
            result.categoriesUpdated++
          }
          categoryId = categoryMap.get(catKey) ?? null
        }

        const { productId, isNew } = await upsertProduct(supabase, product, categoryId)
        if (!productId) {
          result.errors.push(`No se pudo crear/actualizar producto ${product.sku}`)
          continue
        }

        if (isNew) result.productsCreated++
        else result.productsUpdated++

        const imgCount = await upsertProductImages(supabase, productId, product)
        result.imagesCreated += imgCount
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        result.errors.push(`Producto ${product.sku}: ${msg}`)
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    result.errors.push(msg)
    result.success = false
  }

  return result
}
