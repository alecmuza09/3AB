import { createSupabaseClient } from "./supabase"

// Tipo para productos de Supabase
export interface SupabaseProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  is_active: boolean
  is_featured: boolean
  rating: number
  review_count: number
  stock: number | null
  min_quantity: number | null
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
