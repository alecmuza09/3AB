/**
 * Script para actualizar el stock de todos los productos
 * 
 * Este script actualiza el campo stock_quantity de todos los productos
 * para que tengan stock disponible
 */

import { createSupabaseServerClient } from './supabase'

export async function updateAllProductsStock(stockQuantity: number = 100) {
  try {
    const supabase = createSupabaseServerClient()

    console.log(`Actualizando stock de todos los productos a ${stockQuantity}...`)

    // Obtener todos los productos activos
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('is_active', true)

    if (fetchError) {
      console.error('Error obteniendo productos:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!products || products.length === 0) {
      console.log('No hay productos para actualizar')
      return { success: true, updated: 0 }
    }

    console.log(`Encontrados ${products.length} productos para actualizar`)

    // Actualizar todos los productos de una vez
    const { error: updateError, count } = await supabase
      .from('products')
      .update({ stock_quantity: stockQuantity })
      .eq('is_active', true)
      .select('id', { count: 'exact', head: false })

    if (updateError) {
      console.error('Error actualizando stock:', updateError)
      return { success: false, error: updateError.message }
    }

    console.log(`\nActualización completada:`)
    console.log(`- Productos actualizados: ${products.length}`)
    console.log(`- Stock establecido: ${stockQuantity} unidades por producto`)

    return {
      success: true,
      updated: products.length,
      stockQuantity,
    }
  } catch (error) {
    console.error('Error en updateAllProductsStock:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
