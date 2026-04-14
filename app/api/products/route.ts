/**
 * API para listar y buscar productos desde Supabase (servidor, bypass RLS).
 * GET /api/products?activeOnly=true&categoryId=xxx
 * GET /api/products?id=uuid          → devuelve un único producto por ID
 * GET /api/products?slug=mi-slug     → devuelve un único producto por slug
 * GET /api/products?search=taza      → búsqueda por nombre (ilike)
 * GET /api/products?limit=12         → limitar resultados
 * - activeOnly: si es "false", devuelve todos (para admin). Por defecto true (solo activos).
 * - categoryId: opcional, filtra por categoría.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const id = searchParams.get("id") || undefined
    const slug = searchParams.get("slug") || undefined

    // Búsqueda de producto individual por ID o slug
    if (id || slug) {
      let query = supabase
        .from("products")
        .select("*, category:categories(id, name, slug)")

      if (id) {
        query = query.eq("id", id)
      } else if (slug) {
        query = query.eq("slug", slug)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json({ product: null }, { status: 200 })
        }
        console.error("API products single error:", error)
        return NextResponse.json({ error: error.message, product: null }, { status: 200 })
      }

      return NextResponse.json({ product: data })
    }

    // Listado de productos con filtros
    const activeOnly = searchParams.get("activeOnly") !== "false"
    const categoryId = searchParams.get("categoryId") || undefined
    const search = searchParams.get("search") || undefined
    const limitParam = parseInt(searchParams.get("limit") || "500", 10)
    const safeLimit = isNaN(limitParam) || limitParam < 1 ? 500 : Math.min(limitParam, 500)

    let query = supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .order("created_at", { ascending: false })
      .limit(safeLimit)

    if (activeOnly) {
      query = query.eq("is_active", true)
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("API products error:", error)
      return NextResponse.json(
        { error: error.message, products: [] },
        { status: 200 }
      )
    }

    return NextResponse.json({ products: data || [] })
  } catch (err) {
    console.error("API products:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al cargar productos", products: [] },
      { status: 200 }
    )
  }
}
