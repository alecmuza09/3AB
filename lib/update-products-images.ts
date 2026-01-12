/**
 * Script para actualizar productos existentes con sus imágenes
 * 
 * Este script actualiza el campo image_url de los productos
 * que no tienen imagen, obteniéndola desde product_images
 */

import { createSupabaseServerClient } from './supabase'

export async function updateProductsWithImages() {
  try {
    const supabase = createSupabaseServerClient()

    console.log('Obteniendo productos sin imagen...')

    // Obtener todos los productos activos
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, sku, name, image_url')
      .eq('is_active', true)

    if (fetchError) {
      console.error('Error obteniendo productos:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Filtrar productos sin imagen (manejar caso donde image_url no existe)
    const productsWithoutImage = (allProducts || []).filter(
      (p: any) => !p.image_url
    )

    if (fetchError) {
      console.error('Error obteniendo productos:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!productsWithoutImage || productsWithoutImage.length === 0) {
      console.log('No hay productos sin imagen')
      return { success: true, updated: 0 }
    }

    console.log(`Encontrados ${productsWithoutImage.length} productos sin imagen`)

    let updated = 0
    let errors = 0

    // Actualizar cada producto
    for (const product of productsWithoutImage) {
      try {
        // Obtener imagen principal desde product_images
        const { data: images, error: imagesError } = await supabase
          .from('product_images')
          .select('image_url, is_primary, order_index')
          .eq('product_id', product.id)
          .order('is_primary', { ascending: false })
          .order('order_index', { ascending: true })
          .limit(1)

        if (imagesError) {
          console.error(`Error obteniendo imágenes para producto ${product.id}:`, imagesError)
          errors++
          continue
        }

        if (images && images.length > 0) {
          // Intentar actualizar producto con la imagen principal
          // Si el campo image_url no existe, simplemente continuamos
          const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: images[0].image_url })
            .eq('id', product.id)

          if (updateError) {
            // Si el error es que la columna no existe, no es un error crítico
            if (updateError.message.includes('does not exist')) {
              console.log(`⚠ Campo image_url no existe en products. Usando product_images directamente.`)
              // No incrementamos errors porque esto es esperado si la columna no existe
            } else {
              console.error(`Error actualizando producto ${product.id}:`, updateError)
              errors++
            }
          } else {
            updated++
            console.log(`✓ Actualizado producto: ${product.name}`)
          }
        }
      } catch (error) {
        console.error(`Error procesando producto ${product.id}:`, error)
        errors++
      }
    }

    console.log(`\nActualización completada:`)
    console.log(`- Productos actualizados: ${updated}`)
    console.log(`- Errores: ${errors}`)

    return {
      success: true,
      updated,
      errors,
      total: productsWithoutImage.length,
    }
  } catch (error) {
    console.error('Error en updateProductsWithImages:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
