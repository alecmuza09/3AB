# 📦 Guía de Uso - API de Inventario 4Promotional

Esta guía explica cómo usar la integración con la API de inventario de 4Promotional.

## 🔧 Configuración

1. **Agrega las variables de entorno** en tu archivo `.env.local`:

```env
INVENTARIO_API_BASE_URL="https://4promotional.net:9090/WsEstrategia"
INVENTARIO_API_KEY=""  # Opcional, si la API requiere autenticación
INVENTARIO_API_TIMEOUT="30000"  # Opcional, timeout en milisegundos
```

2. **Verifica que la integración esté habilitada**:

```typescript
import { inventarioApiConfig } from '@/lib/integrations-config'

if (inventarioApiConfig.isEnabled()) {
  console.log('API de inventario configurada correctamente')
}
```

## 📚 Funciones Disponibles

### Obtener Productos desde la API

#### 1. Obtener todos los productos (formato API)

```typescript
import { getAllProductsFromInventarioApi } from '@/lib/4promotional-api'

const products = await getAllProductsFromInventarioApi()
// Retorna: InventarioApiProduct[]
```

#### 2. Obtener productos visibles en web

```typescript
import { getVisibleProductsFromInventarioApi } from '@/lib/4promotional-api'

const visibleProducts = await getVisibleProductsFromInventarioApi()
// Retorna solo productos con web === 'SI'
```

#### 3. Obtener productos en promoción

```typescript
import { getPromotionalProductsFromInventarioApi } from '@/lib/4promotional-api'

const promotionalProducts = await getPromotionalProductsFromInventarioApi()
// Retorna productos con producto_promocion === 'SI' y web === 'SI'
```

#### 4. Obtener productos nuevos

```typescript
import { getNewProductsFromInventarioApi } from '@/lib/4promotional-api'

const newProducts = await getNewProductsFromInventarioApi()
// Retorna productos con producto_nuevo === 'SI' y web === 'SI'
```

#### 5. Obtener productos por categoría

```typescript
import { getProductsByCategoryFromInventarioApi } from '@/lib/4promotional-api'

const officeProducts = await getProductsByCategoryFromInventarioApi('OFICINA')
// Retorna productos de la categoría especificada
```

#### 6. Obtener un producto por ID

```typescript
import { getProductByIdFromInventarioApi } from '@/lib/4promotional-api'

const product = await getProductByIdFromInventarioApi('AG 001')
// Retorna: InventarioApiProduct | null
```

### Convertir a Formato WooCommerce

#### 1. Obtener todos los productos en formato WooCommerce

```typescript
import { getAllWooCommerceProductsFromInventarioApi } from '@/lib/4promotional-api'

const woocommerceProducts = await getAllWooCommerceProductsFromInventarioApi()
// Retorna: WooCommerceProduct[]
// Los productos están agrupados por id_articulo con variaciones por color
```

#### 2. Obtener productos visibles en formato WooCommerce

```typescript
import { getVisibleWooCommerceProductsFromInventarioApi } from '@/lib/4promotional-api'

const visibleProducts = await getVisibleWooCommerceProductsFromInventarioApi()
// Retorna solo productos visibles en formato WooCommerce
```

#### 3. Convertir un producto individual

```typescript
import { mapInventarioProductToWooCommerce } from '@/lib/4promotional-api'

const apiProduct = await getProductByIdFromInventarioApi('AG 001')
if (apiProduct) {
  const woocommerceProduct = mapInventarioProductToWooCommerce(apiProduct)
}
```

#### 4. Agrupar productos por artículo

```typescript
import { 
  getAllProductsFromInventarioApi,
  groupInventarioProductsByArticle 
} from '@/lib/4promotional-api'

const apiProducts = await getAllProductsFromInventarioApi()
const groupedProducts = groupInventarioProductsByArticle(apiProducts)
// Agrupa productos por id_articulo y crea variaciones por color
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Mostrar productos en una página

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getAllWooCommerceProductsFromInventarioApi } from '@/lib/4promotional-api'
import type { WooCommerceProduct } from '@/lib/woocommerce-products'

export function ProductsList() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllWooCommerceProductsFromInventarioApi()
        setProducts(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <div>Cargando productos...</div>

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Precio: ${product.price}</p>
          <p>Stock: {product.stock}</p>
          {product.variations && (
            <div>
              <p>Colores disponibles:</p>
              <ul>
                {product.variations.map((variation) => (
                  <li key={variation.id}>
                    {variation.color} - Stock: {variation.stock}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Ejemplo 2: Sincronizar productos con Supabase

```typescript
import { getAllWooCommerceProductsFromInventarioApi } from '@/lib/4promotional-api'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function syncProductsToSupabase() {
  try {
    // Obtener productos de la API
    const apiProducts = await getAllWooCommerceProductsFromInventarioApi()
    
    // Obtener cliente de Supabase
    const supabase = createSupabaseServerClient()
    
    // Sincronizar cada producto
    for (const product of apiProducts) {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image_url: product.image,
          is_active: product.published,
          // ... otros campos
        }, {
          onConflict: 'id'
        })
      
      if (error) {
        console.error(`Error sincronizando producto ${product.id}:`, error)
      }
    }
    
    console.log(`Sincronizados ${apiProducts.length} productos`)
  } catch (error) {
    console.error('Error en sincronización:', error)
  }
}
```

### Ejemplo 3: Filtrar productos por categoría y mostrar variaciones

```typescript
import { getProductsByCategoryFromInventarioApi } from '@/lib/4promotional-api'
import { groupInventarioProductsByArticle } from '@/lib/4promotional-api'

export async function getOfficeProducts() {
  // Obtener productos de oficina
  const apiProducts = await getProductsByCategoryFromInventarioApi('OFICINA')
  
  // Agrupar por artículo (crea variaciones por color)
  const groupedProducts = groupInventarioProductsByArticle(apiProducts)
  
  return groupedProducts
}
```

## 🔍 Estructura de Datos

### InventarioApiProduct

```typescript
interface InventarioApiProduct {
  id_articulo: string
  desc_promo: number
  color: string
  descripcion: string
  inventario: number
  precio: number
  medida_producto_alto: number
  medida_producto_ancho: number
  area_impresion: string
  metodos_impresion: string
  categoria: string
  sub_categoria: string
  web: 'SI' | 'NO'
  producto_promocion: 'SI' | 'NO'
  producto_nuevo: 'SI' | 'NO'
  precio_unico: 'SI' | 'NO'
  web_color: 'SI' | 'NO'
  nombre_articulo: string
  alto_caja?: number
  ancho_caja?: number
  largo_caja?: number
  peso_caja?: string
  piezas_caja?: number
  origen_mercancia?: 'N' | 'I'
  capacidad?: string
  profundidad_articulo?: number
  imagenes: InventarioApiImage[]
}
```

### WooCommerceProduct

Ver la definición completa en `lib/woocommerce-products.ts`

## ⚠️ Notas Importantes

1. **Agrupación por Color**: La función `groupInventarioProductsByArticle` agrupa productos con el mismo `id_articulo` y crea variaciones por color. Esto es útil cuando un producto tiene múltiples colores disponibles.

2. **Precios con Descuento**: Si un producto tiene `desc_promo > 0`, el precio se calcula automáticamente aplicando el descuento.

3. **Visibilidad**: Solo los productos con `web === 'SI'` se consideran visibles.

4. **Manejo de Errores**: Todas las funciones manejan errores internamente y retornan arrays vacíos o `null` en caso de error.

5. **Timeout**: Por defecto, las peticiones tienen un timeout de 30 segundos. Puedes configurarlo con `INVENTARIO_API_TIMEOUT`.

## 🚀 Próximos Pasos

- [ ] Crear un endpoint de API route para sincronizar productos
- [ ] Agregar caché para mejorar el rendimiento
- [ ] Implementar sincronización automática periódica
- [ ] Agregar webhooks para actualizaciones en tiempo real
