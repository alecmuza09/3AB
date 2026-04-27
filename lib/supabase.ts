/**
 * Funciones de Supabase seguras para el browser.
 * Solo usa claves NEXT_PUBLIC_. NUNCA importar createSupabaseServerClient aquí.
 * Para el cliente servidor usa @/lib/supabase-server.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

// Cliente de Supabase para el browser (usa solo claves NEXT_PUBLIC_)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan las variables de entorno de Supabase. Verifica NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// Cliente singleton para uso en componentes del cliente
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createSupabaseClient()
    } catch (e) {
      console.warn('Supabase client no disponible:', (e as Error).message)
      return null
    }
  }

  return supabaseClient
}

// Compatibilidad: re-exportar createSupabaseServerClient para archivos server-side
// que ya importan desde aquí. Los client components NUNCA deben llamar esta función.
export { createSupabaseServerClient } from './supabase-server'
