# 🗄️ Guía de Supabase - 3A Branding

Esta guía te ayudará a configurar y usar Supabase en el proyecto 3A Branding.

## 📋 Configuración Inicial

### 1. Variables de Entorno

Las siguientes variables deben estar configuradas en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://ecamhibpenoruquwftqe.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

### 2. Obtener las Credenciales

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** > **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (¡Mantén esto secreto!)

## 🚀 Uso Básico

### En Componentes del Cliente (Client Components)

```tsx
'use client'

import { useSupabase } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export function ProductsList() {
  const supabase = useSupabase()
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(10)

      if (error) {
        console.error('Error:', error)
        return
      }

      setProducts(data || [])
    }

    fetchProducts()
  }, [supabase])

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### En Server Components

```tsx
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
```

### En Server Actions

```tsx
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
```

## 🔐 Autenticación

### Iniciar Sesión

```tsx
'use client'

import { useSupabase } from '@/lib/supabase-client'

export function LoginForm() {
  const supabase = useSupabase()

  async function handleLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error:', error.message)
      return
    }

    console.log('Usuario autenticado:', data.user)
  }

  // ... resto del componente
}
```

### Registrar Usuario

```tsx
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@ejemplo.com',
  password: 'password123',
})
```

### Cerrar Sesión

```tsx
await supabase.auth.signOut()
```

### Obtener Usuario Actual

```tsx
const { data: { user } } = await supabase.auth.getUser()
```

## 📡 Suscripciones en Tiempo Real

```tsx
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

    // Suscribirse a cambios
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
```

## 📁 Almacenamiento de Archivos

### Subir un Archivo

```tsx
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('product-1.jpg', file)

if (error) {
  console.error('Error:', error)
  return
}

// Obtener URL pública
const { data: urlData } = supabase.storage
  .from('product-images')
  .getPublicUrl('product-1.jpg')

console.log('URL pública:', urlData.publicUrl)
```

### Eliminar un Archivo

```tsx
const { error } = await supabase.storage
  .from('product-images')
  .remove(['product-1.jpg'])
```

## 🔍 Consultas Avanzadas

### Filtros

```tsx
// Filtrar por precio
const { data } = await supabase
  .from('products')
  .select('*')
  .gt('price', 100) // mayor que 100
  .lt('price', 500) // menor que 500
```

### Ordenar

```tsx
const { data } = await supabase
  .from('products')
  .select('*')
  .order('price', { ascending: false })
```

### Paginación

```tsx
const pageSize = 10
const page = 1

const { data } = await supabase
  .from('products')
  .select('*')
  .range((page - 1) * pageSize, page * pageSize - 1)
```

### Relaciones (Joins)

```tsx
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    products (*),
    users (*)
  `)
```

## 🛡️ Row Level Security (RLS)

Supabase usa Row Level Security para proteger tus datos. Asegúrate de configurar políticas RLS en tu dashboard de Supabase.

Ejemplo de política:
```sql
-- Permitir que los usuarios solo vean sus propios pedidos
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)

## ⚠️ Notas Importantes

1. **Nunca expongas tu `SUPABASE_SERVICE_ROLE_KEY` en el cliente**. Solo úsala en Server Components, Server Actions o API Routes.

2. **Usa RLS (Row Level Security)** para proteger tus datos en lugar de confiar solo en el código del cliente.

3. **El cliente del navegador** (`useSupabase`) solo debe usarse en Client Components.

4. **El cliente del servidor** (`createSupabaseServerClient`) debe usarse en Server Components y Server Actions.

