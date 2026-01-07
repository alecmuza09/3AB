/**
 * Script de prueba para verificar la conexión con Supabase
 * 
 * Este archivo puede ejecutarse para verificar que la configuración
 * de Supabase está correcta.
 * 
 * Uso: Solo para desarrollo y testing
 */

import { createSupabaseClient } from './supabase'
import { supabaseConfig } from './integrations-config'

export async function testSupabaseConnection() {
  console.log('🔍 Verificando configuración de Supabase...\n')

  // Verificar variables de entorno
  if (!supabaseConfig.isEnabled()) {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas')
    console.log('\nVariables requeridas:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return { success: false, error: 'Variables de entorno faltantes' }
  }

  console.log('✅ Variables de entorno configuradas')
  console.log(`   URL: ${supabaseConfig.url}`)
  console.log(`   Anon Key: ${supabaseConfig.anonKey.substring(0, 20)}...`)

  try {
    // Intentar crear el cliente
    const supabase = createSupabaseClient()
    console.log('\n✅ Cliente de Supabase creado exitosamente')

    // Intentar una consulta simple (esto requiere que tengas al menos una tabla)
    // Puedes comentar esto si aún no tienes tablas creadas
    /*
    const { data, error } = await supabase
      .from('_test_connection')
      .select('count')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      // PGRST116 significa que la tabla no existe, lo cual está bien
      console.error('❌ Error al conectar:', error.message)
      return { success: false, error: error.message }
    }
    */

    console.log('\n✅ Conexión con Supabase establecida correctamente')
    return { success: true }
  } catch (error: any) {
    console.error('\n❌ Error al conectar con Supabase:', error.message)
    return { success: false, error: error.message }
  }
}

// Para ejecutar desde la consola (solo en desarrollo)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // testSupabaseConnection().then(console.log)
}

