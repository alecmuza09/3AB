/**
 * Ejemplos de uso de Supabase en 3A Branding
 * 
 * Este archivo muestra cómo usar Supabase en diferentes contextos:
 * - Componentes del cliente (Client Components)
 * - Server Components y Server Actions
 * - API Routes
 */

// ============================================
// EJEMPLO 1: Uso en Client Component
// ============================================
/*
'use client'

import { useSupabase } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export function ProductsList() {
  const supabase = useSupabase()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
*/

// ============================================
// EJEMPLO 2: Uso en Server Component
// ============================================
/*
import { createSupabaseServerClient } from '@/lib/supabase'

export async function ServerProductsList() {
  const supabase = createSupabaseServerClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return <div>Error al cargar productos</div>
  }

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
*/

// ============================================
// EJEMPLO 3: Uso en Server Action
// ============================================
/*
'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = createSupabaseServerClient()
  
  const name = formData.get('name') as string
  const price = formData.get('price') as string

  const { data, error } = await supabase
    .from('products')
    .insert([
      { name, price: parseFloat(price) }
    ])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/productos')
  return { success: true, data }
}
*/

// ============================================
// EJEMPLO 4: Autenticación
// ============================================
/*
'use client'

import { useSupabase } from '@/lib/supabase-client'
import { useState } from 'react'

export function LoginForm() {
  const supabase = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    console.log('Usuario autenticado:', data.user)
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  )
}
*/

// ============================================
// EJEMPLO 5: Subscripciones en tiempo real
// ============================================
/*
'use client'

import { useSupabase } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export function RealtimeProducts() {
  const supabase = useSupabase()
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Obtener productos iniciales
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        if (data) setProducts(data)
      })

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Cambio detectado:', payload)
          // Actualizar la lista de productos
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
*/
