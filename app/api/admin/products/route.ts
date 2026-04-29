/**
 * API admin para crear, editar y eliminar productos.
 * - POST   /api/admin/products      → crea un producto
 * - PATCH  /api/admin/products      → actualiza un producto (body: { id, ...campos })
 * - DELETE /api/admin/products?id=… → elimina un producto
 *
 * Usa el cliente con service-role para evitar problemas de RLS.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
}

async function ensureUniqueSlug(supabase: ReturnType<typeof createSupabaseServerClient>, baseSlug: string): Promise<string> {
  let slug = baseSlug || `producto-${Date.now()}`
  let attempt = 0
  while (attempt < 20) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
    if (!data) return slug
    attempt += 1
    slug = `${baseSlug}-${attempt + 1}`
  }
  return `${baseSlug}-${Date.now()}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json().catch(() => ({}))
    const {
      name,
      sku,
      description,
      short_description,
      category_id,
      price,
      cost,
      stock_quantity,
      min_quantity,
      multiple_of,
      is_active,
      is_featured,
      is_bestseller,
      attributes,
    } = body || {}

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const baseSlug = generateSlug(name)
    const slug = await ensureUniqueSlug(supabase, baseSlug)

    const insertPayload: Record<string, any> = {
      name: name.trim(),
      slug,
      sku: sku?.trim() || null,
      description: description ?? null,
      short_description: short_description ?? null,
      category_id: category_id ?? null,
      price: Number(price ?? 0) || 0,
      cost: cost != null ? Number(cost) || 0 : null,
      stock_quantity: Math.max(0, Math.floor(Number(stock_quantity ?? 0)) || 0),
      min_quantity: Math.max(1, Math.floor(Number(min_quantity ?? 1)) || 1),
      multiple_of: Math.max(1, Math.floor(Number(multiple_of ?? 1)) || 1),
      is_active: is_active === false ? false : true,
      is_featured: Boolean(is_featured),
      is_bestseller: Boolean(is_bestseller),
      attributes: attributes ?? null,
    }

    const { data, error } = await supabase
      .from("products")
      .insert(insertPayload as any)
      .select("*, category:categories(id, name, slug)")
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, product: data })
  } catch (err: any) {
    console.error("POST /api/admin/products error:", err)
    return NextResponse.json(
      { error: err?.message || "Error al crear producto" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json().catch(() => ({}))
    const { id, ...rest } = body || {}

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 })
    }

    const allowedFields = [
      "name",
      "sku",
      "description",
      "short_description",
      "category_id",
      "price",
      "cost",
      "stock_quantity",
      "min_quantity",
      "multiple_of",
      "is_active",
      "is_featured",
      "is_bestseller",
      "attributes",
    ]
    const updatePayload: Record<string, any> = {}
    for (const key of allowedFields) {
      if (key in rest) updatePayload[key] = (rest as any)[key]
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    updatePayload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload as any)
      .eq("id", id)
      .select("*, category:categories(id, name, slug)")
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, product: data })
  } catch (err: any) {
    console.error("PATCH /api/admin/products error:", err)
    return NextResponse.json(
      { error: err?.message || "Error al actualizar producto" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 })
    }

    // Soft delete: marcar como inactivo en lugar de eliminar (más seguro
    // si hay foreign keys en order_items, cart_items, etc.).
    // Si quieres eliminación dura, cambia esto a .delete()
    const { error } = await supabase
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() } as any)
      .eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id, mode: "soft-delete" })
  } catch (err: any) {
    console.error("DELETE /api/admin/products error:", err)
    return NextResponse.json(
      { error: err?.message || "Error al eliminar producto" },
      { status: 500 }
    )
  }
}
