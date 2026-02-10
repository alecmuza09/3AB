import { createSupabaseClient, getSupabaseClient } from "./supabase"

// Tipo para productos de Supabase
export interface SupabaseProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  attributes?: any | null
  is_active: boolean
  is_featured: boolean
  rating: number
  review_count: number
  stock_quantity: number | null
  min_quantity: number | null
  multiple_of: number | null
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

// Función para obtener todos los productos activos desde Supabase
export async function getAllProductsFromSupabase(): Promise<SupabaseProduct[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products from Supabase:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

// Función para obtener un producto por ID desde Supabase
export async function getProductByIdFromSupabase(id: string): Promise<SupabaseProduct | null> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching product from Supabase:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

// Función para obtener productos destacados desde Supabase
export async function getFeaturedProductsFromSupabase(limit: number = 6): Promise<SupabaseProduct[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured products from Supabase:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

// Función para obtener productos por categoría desde Supabase
export async function getProductsByCategoryFromSupabase(categoryId: string): Promise<SupabaseProduct[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products by category from Supabase:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

// Cache en memoria para catálogo (TTL 60 s) y carga más rápida
const catalogCache: { key: string; data: SupabaseProduct[]; ts: number } = { key: "", data: [], ts: 0 }
const CATALOG_CACHE_TTL_MS = 60 * 1000

/**
 * Catálogo público: productos activos desde el cliente (navegador).
 * Usa getSupabaseClient() y cache de 60 s para cargas más rápidas.
 */
export async function fetchCatalogProducts(categoryId?: string | null): Promise<SupabaseProduct[]> {
  const cacheKey = `catalog_${categoryId ?? "all"}`
  const now = Date.now()
  if (catalogCache.key === cacheKey && now - catalogCache.ts < CATALOG_CACHE_TTL_MS) {
    return catalogCache.data
  }

  try {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    let query = supabase
      .from("products")
      .select(`id,name,slug,description,price,image_url,category_id,min_quantity,multiple_of,is_featured,stock_quantity,rating,review_count,attributes,created_at, category:categories(id, name, slug)`)
      .eq("is_active", true)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) {
      console.error("Error fetching catalog products:", error)
      return []
    }
    const result = (data || []) as SupabaseProduct[]
    catalogCache.key = cacheKey
    catalogCache.data = result
    catalogCache.ts = now
    return result
  } catch (error) {
    console.error("Error fetchCatalogProducts:", error)
    return []
  }
}
