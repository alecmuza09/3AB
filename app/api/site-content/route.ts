import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase-types"
import {
  SITE_CONTENT_SCHEMA,
  getDefaultsForPage,
} from "@/lib/site-content-schema"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** GET: contenido público por página (defaults + DB) */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page")

  if (!page) {
    return NextResponse.json(
      { error: "Query param 'page' requerido" },
      { status: 400 }
    )
  }

  const defaults = getDefaultsForPage(page)
  if (Object.keys(defaults).length === 0) {
    return NextResponse.json(defaults)
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
    const { data: rows, error } = await supabase
      .from("site_content")
      .select("section_key, value")
      .eq("page_slug", page)

    if (error) {
      console.error("site_content GET error:", error)
      return NextResponse.json(defaults)
    }

    const fromDb = Object.fromEntries(
      (rows || []).map((r: { section_key: string; value: string | null }) => [
        r.section_key,
        r.value ?? "",
      ])
    )

    const merged = { ...defaults, ...fromDb }
    return NextResponse.json(merged)
  } catch (e) {
    console.error(e)
    return NextResponse.json(defaults)
  }
}

/** PATCH: actualizar contenido (solo admin) */
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace(/^Bearer\s+/i, "")

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabaseUser = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const {
    data: { user },
    error: userError,
  } = await supabaseUser.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 })
  }

  const { data: profile } = await supabaseUser
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 })
  }

  let body: { page_slug: string; updates: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 })
  }

  const { page_slug, updates } = body
  if (!page_slug || typeof updates !== "object") {
    return NextResponse.json(
      { error: "page_slug y updates son requeridos" },
      { status: 400 }
    )
  }

  const schema = SITE_CONTENT_SCHEMA.find((p) => p.slug === page_slug)
  if (!schema) {
    return NextResponse.json({ error: "Página no definida en el schema" }, { status: 400 })
  }

  const validKeys = new Set(schema.fields.map((f) => f.key))
  const toUpsert = Object.entries(updates)
    .filter(([key]) => validKeys.has(key))
    .map(([section_key, value]) => ({
      page_slug,
      section_key,
      content_type: schema.fields.find((f) => f.key === section_key)?.type ?? "text",
      value: String(value),
      updated_at: new Date().toISOString(),
    }))

  if (toUpsert.length === 0) {
    return NextResponse.json({ success: true, updated: 0 })
  }

  const supabaseWithAuth = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  for (const row of toUpsert) {
    await supabaseWithAuth.from("site_content").upsert(
      {
        page_slug: row.page_slug,
        section_key: row.section_key,
        content_type: row.content_type,
        value: row.value,
        updated_at: row.updated_at,
      },
      { onConflict: "page_slug,section_key" }
    )
  }

  return NextResponse.json({ success: true, updated: toUpsert.length })
}
