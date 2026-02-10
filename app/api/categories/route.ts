/**
 * API para listar categorías desde Supabase (servidor).
 * GET /api/categories
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) {
      console.error("API categories error:", error)
      return NextResponse.json({ error: error.message, categories: [] }, { status: 200 })
    }
    return NextResponse.json({ categories: data || [] })
  } catch (err) {
    console.error("API categories:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al cargar categorías", categories: [] },
      { status: 200 }
    )
  }
}
