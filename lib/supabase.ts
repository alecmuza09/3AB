import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

// Cliente de Supabase para el cliente (browser)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan las variables de entorno de Supabase. Por favor, verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas en tu archivo .env.local'
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

// Cliente de Supabase para el servidor (con service role key)
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Faltan las variables de entorno de Supabase para el servidor. Por favor, verifica que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas en tu archivo .env.local'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Cliente singleton para uso en componentes del cliente
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // En el servidor, no usar el cliente del navegador
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }

  return supabaseClient
}


