/**
 * POST /api/sync-products/process-chunk
 * Recibe un chunk de productos crudos de 4Promotional y los upsertea en Supabase.
 * Cada chunk debe procesarse en menos de 10s.
 * Tamaño recomendado de chunk: 30-50 entradas crudas (≈ 6-10 productos agrupados).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { InventarioApiProduct } from '@/lib/4promotional-api'

interface ChunkRequest {
  products: InventarioApiProduct[]
  /** Mapa de categoría → id ya existente, para evitar re-crear categorías en cada chunk */
  categoryMap?: Record<string, string>
}

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
  name: string,
  parentId?: string
): Promise<string | null> {
  const slug = generateSlug(name)
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    await supabase
      .from('categories')
      .update({ name, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    return existing.id
  }

  const { data } = await supabase
    .from('categories')
    .insert({ name, slug, is_active: true, parent_id: parentId || null })
    .select('id')
    .single()

  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChunkRequest
    const { products, categoryMap = {} } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: 'No products in chunk' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const result = {
      success: true,
      categoriesCreated: 0,
      productsCreated: 0,
      productsUpdated: 0,
      variationsCreated: 0,
      variationsUpdated: 0,
      imagesCreated: 0,
      errors: [] as string[],
      categoryMap: { ...categoryMap },
    }

    // Agrupar productos del chunk por id_articulo
    const grouped = new Map<string, InventarioApiProduct[]>()
    for (const p of products) {
      if (!grouped.has(p.id_articulo)) grouped.set(p.id_articulo, [])
      grouped.get(p.id_articulo)!.push(p)
    }

    for (const [idArticulo, productList] of grouped.entries()) {
      try {
        const baseProduct = productList[0]

        // Categoría principal (cacheada por nombre)
        let categoryId: string | null = null
        if (baseProduct.categoria) {
          if (!result.categoryMap[baseProduct.categoria]) {
            const id = await upsertCategory(supabase, baseProduct.categoria)
            if (id) {
              result.categoryMap[baseProduct.categoria] = id
              result.categoriesCreated++
            }
          }
          categoryId = result.categoryMap[baseProduct.categoria] || null
        }

        if (
          baseProduct.sub_categoria &&
          baseProduct.sub_categoria !== baseProduct.categoria
        ) {
          const key = `${baseProduct.categoria}_${baseProduct.sub_categoria}`
          if (!result.categoryMap[key]) {
            const id = await upsertCategory(
              supabase,
              baseProduct.sub_categoria,
              categoryId || undefined
            )
            if (id) {
              result.categoryMap[key] = id
              result.categoriesCreated++
              categoryId = id
            }
          } else {
            categoryId = result.categoryMap[key] || categoryId
          }
        }

        // Calcular precios y stock
        const precios = productList.map((p) =>
          p.desc_promo > 0 ? p.precio * (1 - p.desc_promo / 100) : p.precio
        )
        const minPrice = Math.min(...precios)
        const maxPrice = Math.max(...precios)
        const stockTotal = productList.reduce((sum, p) => sum + p.inventario, 0)

        const metodosImpresion = baseProduct.metodos_impresion
          .split('-')
          .map((m) => m.trim())
          .filter(Boolean)
        const colores = [...new Set(productList.map((p) => p.color))]

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

        const dimensions = {
          length: baseProduct.medida_producto_alto,
          width: baseProduct.medida_producto_ancho,
          height: baseProduct.profundidad_articulo || null,
        }

        const mainImage = baseProduct.imagenes.find((img) => img.tipo_imagen === 'imagen')
        const imageUrl = mainImage?.url_imagen || null

        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('sku', idArticulo)
          .single()

        const productData = {
          sku: idArticulo,
          name: baseProduct.nombre_articulo,
          slug: `${generateSlug(baseProduct.nombre_articulo)}-${idArticulo}`.substring(0, 100),
          description: baseProduct.descripcion || null,
          short_description: baseProduct.descripcion?.substring(0, 200) ?? null,
          category_id: categoryId,
          price: minPrice,
          min_price: minPrice,
          max_price: maxPrice > minPrice ? maxPrice : null,
          stock_quantity: stockTotal,
          min_quantity: 1,
          multiple_of: 1,
          weight: baseProduct.peso_caja ? parseFloat(baseProduct.peso_caja) : null,
          dimensions,
          attributes,
          image_url: imageUrl,
          is_active: baseProduct.web === 'SI',
          is_featured: baseProduct.producto_promocion === 'SI',
          is_bestseller: baseProduct.producto_nuevo === 'SI',
          updated_at: new Date().toISOString(),
        }

        let productId: string | null = null
        if (existing) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existing.id)
          if (error) {
            result.errors.push(`Update ${idArticulo}: ${error.message}`)
            continue
          }
          productId = existing.id
          result.productsUpdated++
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select('id')
            .single()
          if (error) {
            result.errors.push(`Insert ${idArticulo}: ${error.message}`)
            continue
          }
          productId = data?.id ?? null
          result.productsCreated++
        }

        if (!productId) continue

        // Variaciones (en paralelo dentro del producto)
        for (const apiProduct of productList) {
          const variationSku = `${apiProduct.id_articulo} ${apiProduct.color}`
          const precioFinal =
            apiProduct.desc_promo > 0
              ? apiProduct.precio * (1 - apiProduct.desc_promo / 100)
              : apiProduct.precio
          const colorImage = apiProduct.imagenes.find((img) => img.tipo_imagen === 'imagen_color')

          const { data: existingVar } = await supabase
            .from('product_variations')
            .select('id')
            .eq('product_id', productId)
            .eq('sku', variationSku)
            .single()

          const varData = {
            product_id: productId,
            name: `${apiProduct.nombre_articulo} - ${apiProduct.color}`,
            sku: variationSku,
            price: precioFinal,
            stock_quantity: apiProduct.inventario,
            attributes: {
              color: apiProduct.color,
              area_impresion: apiProduct.area_impresion,
              capacidad: apiProduct.capacidad || null,
            },
            image_url: colorImage?.url_imagen ?? null,
            is_active: apiProduct.web === 'SI' && apiProduct.web_color === 'SI',
            updated_at: new Date().toISOString(),
          }

          if (existingVar) {
            await supabase.from('product_variations').update(varData).eq('id', existingVar.id)
            result.variationsUpdated++
          } else {
            await supabase.from('product_variations').insert(varData)
            result.variationsCreated++
          }
        }

        // Imágenes (borrar y re-insertar)
        await supabase.from('product_images').delete().eq('product_id', productId)

        const extraImage = baseProduct.imagenes.find((img) => img.tipo_imagen === 'imagen_extra')
        if (mainImage) {
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: mainImage.url_imagen,
            alt_text: baseProduct.nombre_articulo,
            order_index: 0,
            is_primary: true,
          })
          result.imagesCreated++
        }
        if (extraImage) {
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: extraImage.url_imagen,
            alt_text: `${baseProduct.nombre_articulo} - Vista adicional`,
            order_index: 1,
            is_primary: false,
          })
          result.imagesCreated++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        result.errors.push(`${idArticulo}: ${msg}`)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
