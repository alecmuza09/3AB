'use client'

import { createSupabaseClient } from './supabase'
import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

/**
 * Hook para obtener el cliente de Supabase en componentes del cliente
 * 
 * @example
 * ```tsx
 * const supabase = useSupabase()
 * const { data } = await supabase.from('products').select('*')
 * ```
 */
export function useSupabase(): SupabaseClient<Database> | null {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsReady(true)
      return
    }

    try {
      const client = createSupabaseClient()
      setSupabase(client)
    } catch (error) {
      console.error('Error al inicializar Supabase:', error)
    } finally {
      setIsReady(true)
    }
  }, [])

  // Retornar null si aún no está listo o si hay un error
  if (!isReady || !supabase) {
    return null
  }

  return supabase
}

