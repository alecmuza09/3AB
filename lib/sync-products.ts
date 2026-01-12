/**
 * Sincronización de Productos desde API de Inventario a Supabase
 * 
 * Este archivo contiene las funciones para importar productos
 * desde la API de 4Promotional a la base de datos de Supabase.
 */

import { createSupabaseServerClient } from './supabase'
import {
  getAllProductsFromInventarioApi,
  groupInventarioProductsByArticle,
  type InventarioApiProduct,
} from './4promotional-api'

// ============================================
// TIPOS
// ============================================

export interface SyncResult {
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
// FUNCIONES HELPER
// ============================================

/**
 * Genera un slug único a partir de un texto
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
    .substring(0, 100) // Limitar longitud
}

/**
 * Crea o actualiza una categoría en Supabase
 */
async function upsertCategory(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  categoryName: string,
  parentId?: string
): Promise<string | null> {
  try {
    const slug = generateSlug(categoryName)

    // Buscar si ya existe
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      // Actualizar si existe
      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryName,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        console.error(`Error actualizando categoría ${categoryName}:`, error)
        return null
      }

      return existing.id
    } else {
      // Crear nueva categoría
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryName,
          slug: slug,
          is_active: true,
          parent_id: parentId || null,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`Error creando categoría ${categoryName}:`, error)
        return null
      }

      return data?.id || null
    }
  } catch (error) {
    console.error(`Error en upsertCategory para ${categoryName}:`, error)
    return null
  }
}

/**
 * Crea o actualiza un producto en Supabase
 */
async function upsertProduct(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  apiProducts: InventarioApiProduct[],
  categoryId: string | null
): Promise<{ productId: string | null; isNew: boolean }> {
  if (apiProducts.length === 0) {
    return { productId: null, isNew: false }
  }

  const baseProduct = apiProducts[0]
  const productId = baseProduct.id_articulo
  const slug = generateSlug(baseProduct.nombre_articulo)

  try {
    // Calcular precios
    const precios = apiProducts.map(p => {
      const descuento = p.desc_promo > 0 ? p.precio * (1 - p.desc_promo / 100) : p.precio
      return descuento
    })
    const minPrice = Math.min(...precios)
    const maxPrice = Math.max(...precios)
    const basePrice = minPrice

    // Calcular stock total
    const stockTotal = apiProducts.reduce((sum, p) => sum + p.inventario, 0)

    // Parsear métodos de impresión
    const metodosImpresion = baseProduct.metodos_impresion
      .split('-')
      .map(m => m.trim())
      .filter(m => m.length > 0)

    // Obtener todos los colores únicos
    const colores = [...new Set(apiProducts.map(p => p.color))]

    // Preparar atributos
    const attributes = {
      material: 'Dato no disponible',
      printing_technique: metodosImpresion,
      capacity: baseProduct.capacidad || null,
      colors: colores,
      area_impresion: baseProduct.area_impresion,
      medidas: `${baseProduct.medida_producto_alto} x ${baseProduct.medida_producto_ancho} cm`,
      proveedor: '4promotional',
      origen_mercancia: baseProduct.origen_mercancia || null,
    }

    // Preparar dimensiones
    const dimensions = {
      length: baseProduct.medida_producto_alto,
      width: baseProduct.medida_producto_ancho,
      height: baseProduct.profundidad_articulo || null,
    }

    // Obtener imagen principal
    const mainImage = baseProduct.imagenes.find(img => img.tipo_imagen === 'imagen')
    const imageUrl = mainImage?.url_imagen || null

    // Buscar si el producto ya existe (por SKU)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', productId)
      .single()

    const productData = {
      sku: productId,
      name: baseProduct.nombre_articulo,
      slug: `${slug}-${productId}`.substring(0, 100),
      description: baseProduct.descripcion || null,
      short_description: baseProduct.descripcion
        ? baseProduct.descripcion.substring(0, 200)
        : null,
      category_id: categoryId,
      price: basePrice,
      min_price: minPrice,
      max_price: maxPrice > minPrice ? maxPrice : null,
      stock_quantity: stockTotal,
      min_quantity: 1,
      multiple_of: 1,
      weight: baseProduct.peso_caja ? parseFloat(baseProduct.peso_caja) : null,
      dimensions: dimensions,
      attributes: attributes,
      image_url: imageUrl, // Agregar imagen principal al producto
      is_active: baseProduct.web === 'SI',
      is_featured: baseProduct.producto_promocion === 'SI',
      is_bestseller: baseProduct.producto_nuevo === 'SI',
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      // Actualizar producto existente
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existing.id)

      if (error) {
        console.error(`Error actualizando producto ${productId}:`, error)
        return { productId: null, isNew: false }
      }

      return { productId: existing.id, isNew: false }
    } else {
      // Crear nuevo producto
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single()

      if (error) {
        console.error(`Error creando producto ${productId}:`, error)
        return { productId: null, isNew: false }
      }

      return { productId: data?.id || null, isNew: true }
    }
  } catch (error) {
    console.error(`Error en upsertProduct para ${productId}:`, error)
    return { productId: null, isNew: false }
  }
}

/**
 * Crea o actualiza variaciones de producto
 */
async function upsertVariations(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  apiProducts: InventarioApiProduct[]
): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  for (const apiProduct of apiProducts) {
    try {
      const variationSku = `${apiProduct.id_articulo} ${apiProduct.color}`
      const variationName = `${apiProduct.nombre_articulo} - ${apiProduct.color}`

      // Calcular precio con descuento
      const precioFinal = apiProduct.desc_promo > 0
        ? apiProduct.precio * (1 - apiProduct.desc_promo / 100)
        : apiProduct.precio

      // Obtener imagen de color
      const colorImage = apiProduct.imagenes.find(img => img.tipo_imagen === 'imagen_color')
      const imageUrl = colorImage?.url_imagen || null

      // Preparar atributos
      const attributes = {
        color: apiProduct.color,
        area_impresion: apiProduct.area_impresion,
        capacidad: apiProduct.capacidad || null,
      }

      // Buscar si la variación ya existe
      const { data: existing } = await supabase
        .from('product_variations')
        .select('id')
        .eq('product_id', productId)
        .eq('sku', variationSku)
        .single()

      const variationData = {
        product_id: productId,
        name: variationName,
        sku: variationSku,
        price: precioFinal,
        stock_quantity: apiProduct.inventario,
        attributes: attributes,
        image_url: imageUrl,
        is_active: apiProduct.web === 'SI' && apiProduct.web_color === 'SI',
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        // Actualizar variación existente
        const { error } = await supabase
          .from('product_variations')
          .update(variationData)
          .eq('id', existing.id)

        if (error) {
          console.error(`Error actualizando variación ${variationSku}:`, error)
          continue
        }

        updated++
      } else {
        // Crear nueva variación
        const { error } = await supabase
          .from('product_variations')
          .insert(variationData)

        if (error) {
          console.error(`Error creando variación ${variationSku}:`, error)
          continue
        }

        created++
      }
    } catch (error) {
      console.error(`Error procesando variación para ${apiProduct.id_articulo}:`, error)
    }
  }

  return { created, updated }
}

/**
 * Crea imágenes de producto
 */
async function upsertProductImages(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  productId: string,
  apiProducts: InventarioApiProduct[]
): Promise<number> {
  let imagesCreated = 0

  try {
    // Eliminar imágenes existentes del producto
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId)

    // Obtener imagen principal del primer producto
    const baseProduct = apiProducts[0]
    const mainImage = baseProduct.imagenes.find(img => img.tipo_imagen === 'imagen')
    const extraImage = baseProduct.imagenes.find(img => img.tipo_imagen === 'imagen_extra')

    // Insertar imagen principal
    if (mainImage) {
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: mainImage.url_imagen,
          alt_text: baseProduct.nombre_articulo,
          order_index: 0,
          is_primary: true,
        })

      if (!error) imagesCreated++
    }

    // Insertar imagen extra si existe
    if (extraImage) {
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: extraImage.url_imagen,
          alt_text: `${baseProduct.nombre_articulo} - Vista adicional`,
          order_index: 1,
          is_primary: false,
        })

      if (!error) imagesCreated++
    }

    // Insertar imágenes de color para cada variación
    for (let i = 0; i < apiProducts.length; i++) {
      const apiProduct = apiProducts[i]
      const colorImage = apiProduct.imagenes.find(img => img.tipo_imagen === 'imagen_color')

      if (colorImage) {
        // Obtener el ID de la variación correspondiente
        const variationSku = `${apiProduct.id_articulo} ${apiProduct.color}`
        const { data: variation } = await supabase
          .from('product_variations')
          .select('id')
          .eq('product_id', productId)
          .eq('sku', variationSku)
          .single()

        if (variation) {
          const { error } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              variation_id: variation.id,
              image_url: colorImage.url_imagen,
              alt_text: `${apiProduct.nombre_articulo} - ${apiProduct.color}`,
              order_index: 2 + i,
              is_primary: false,
            })

          if (!error) imagesCreated++
        }
      }
    }
  } catch (error) {
    console.error(`Error creando imágenes para producto ${productId}:`, error)
  }

  return imagesCreated
}

// ============================================
// FUNCIÓN PRINCIPAL DE SINCRONIZACIÓN
// ============================================

/**
 * Sincroniza todos los productos desde la API de inventario a Supabase
 */
export async function syncProductsFromInventarioApi(): Promise<SyncResult> {
  const result: SyncResult = {
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
    // Crear cliente de Supabase
    const supabase = createSupabaseServerClient()

    // Obtener todos los productos de la API
    console.log('Obteniendo productos de la API de inventario...')
    const apiProducts = await getAllProductsFromInventarioApi()

    if (apiProducts.length === 0) {
      result.errors.push('No se obtuvieron productos de la API')
      result.success = false
      return result
    }

    console.log(`Se obtuvieron ${apiProducts.length} productos de la API`)

    // Agrupar productos por id_articulo
    const groupedProducts = new Map<string, InventarioApiProduct[]>()
    for (const product of apiProducts) {
      if (!groupedProducts.has(product.id_articulo)) {
        groupedProducts.set(product.id_articulo, [])
      }
      groupedProducts.get(product.id_articulo)!.push(product)
    }

    console.log(`Se agruparon en ${groupedProducts.size} productos únicos`)

    // Crear mapa de categorías
    const categoryMap = new Map<string, string>()

    // Procesar cada producto agrupado
    for (const [idArticulo, products] of groupedProducts.entries()) {
      try {
        const baseProduct = products[0]

        // Crear/actualizar categoría principal
        let categoryId: string | null = null
        if (baseProduct.categoria) {
          if (!categoryMap.has(baseProduct.categoria)) {
            const catId = await upsertCategory(supabase, baseProduct.categoria)
            if (catId) {
              categoryMap.set(baseProduct.categoria, catId)
              result.categoriesCreated++
            }
          } else {
            result.categoriesUpdated++
          }
          categoryId = categoryMap.get(baseProduct.categoria) || null
        }

        // Crear/actualizar subcategoría si existe
        if (baseProduct.sub_categoria && baseProduct.sub_categoria !== baseProduct.categoria) {
          const subCategoryKey = `${baseProduct.categoria}_${baseProduct.sub_categoria}`
          if (!categoryMap.has(subCategoryKey)) {
            const subCatId = await upsertCategory(
              supabase,
              baseProduct.sub_categoria,
              categoryId || undefined
            )
            if (subCatId) {
              categoryMap.set(subCategoryKey, subCatId)
              result.categoriesCreated++
              // Usar subcategoría como categoría del producto
              categoryId = subCatId
            }
          } else {
            result.categoriesUpdated++
            categoryId = categoryMap.get(subCategoryKey) || categoryId
          }
        }

        // Crear/actualizar producto
        const { productId, isNew } = await upsertProduct(supabase, products, categoryId)

        if (!productId) {
          result.errors.push(`No se pudo crear/actualizar producto ${idArticulo}`)
          continue
        }

        if (isNew) {
          result.productsCreated++
        } else {
          result.productsUpdated++
        }

        // Crear/actualizar variaciones
        const variations = await upsertVariations(supabase, productId, products)
        result.variationsCreated += variations.created
        result.variationsUpdated += variations.updated

        // Crear imágenes
        const imagesCount = await upsertProductImages(supabase, productId, products)
        result.imagesCreated += imagesCount
      } catch (error) {
        const errorMsg = `Error procesando producto ${idArticulo}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        console.error(errorMsg)
        result.errors.push(errorMsg)
      }
    }

    console.log('Sincronización completada:', result)
  } catch (error) {
    const errorMsg = `Error en sincronización: ${error instanceof Error ? error.message : 'Error desconocido'}`
    console.error(errorMsg)
    result.errors.push(errorMsg)
    result.success = false
  }

  return result
}
