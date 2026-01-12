/**
 * Script para marcar todos los productos como disponibles
 * 
 * Este script actualiza el campo is_active de todos los productos
 * para que estén disponibles en el sitio web
 */

import { createSupabaseServerClient } from './supabase'

export async function updateAllProductsAvailability(stockQuantity: number = 100) {
  try {
    const supabase = createSupabaseServerClient()

    console.log('Marcando todos los productos como disponibles...')

    // Obtener todos los productos (activos e inactivos)
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, is_active, stock_quantity')

    if (fetchError) {
      console.error('Error obteniendo productos:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!products || products.length === 0) {
      console.log('No hay productos para actualizar')
      return { success: true, updated: 0 }
    }

    console.log(`Encontrados ${products.length} productos`)

    // Actualizar todos los productos: is_active = true y stock_quantity
    // Actualizar en lotes para evitar problemas con políticas RLS
    let updatedCount = 0
    const batchSize = 100
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const productIds = batch.map(p => p.id)
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          is_active: true,
          stock_quantity: stockQuantity 
        })
        .in('id', productIds)

      if (updateError) {
        console.error(`Error actualizando lote ${Math.floor(i / batchSize) + 1}:`, updateError)
        // Continuar con el siguiente lote
        continue
      }
      
      updatedCount += batch.length
      console.log(`Actualizado lote ${Math.floor(i / batchSize) + 1}: ${batch.length} productos`)
    }

    // También actualizar las variaciones de productos
    const { data: variations, error: variationsFetchError } = await supabase
      .from('product_variations')
      .select('id')

    let variationsUpdated = 0
    if (!variationsFetchError && variations && variations.length > 0) {
      for (let i = 0; i < variations.length; i += batchSize) {
        const batch = variations.slice(i, i + batchSize)
        const variationIds = batch.map(v => v.id)
        
        const { error: variationsError } = await supabase
          .from('product_variations')
          .update({ 
            is_active: true,
            stock_quantity: stockQuantity 
          })
          .in('id', variationIds)

        if (!variationsError) {
          variationsUpdated += batch.length
        } else {
          console.warn(`Error actualizando variaciones lote ${Math.floor(i / batchSize) + 1}:`, variationsError)
        }
      }
      console.log(`- Variaciones actualizadas: ${variationsUpdated}`)
    }

    console.log(`\nActualización completada:`)
    console.log(`- Productos actualizados: ${updatedCount} de ${products.length}`)
    console.log(`- Todos los productos están ahora disponibles (is_active = true)`)
    console.log(`- Stock establecido: ${stockQuantity} unidades por producto`)

    return {
      success: true,
      updated: updatedCount,
      stockQuantity,
    }
  } catch (error) {
    console.error('Error en updateAllProductsAvailability:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
