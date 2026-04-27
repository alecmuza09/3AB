/**
 * Cliente Supabase para uso exclusivamente server-side.
 * Usa SUPABASE_SERVICE_ROLE_KEY.
 * Importar solo desde API routes, server components o funciones de sincronización.
 * NUNCA importar en componentes cliente ('use client').
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Faltan las variables de entorno de Supabase para el servidor. Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
