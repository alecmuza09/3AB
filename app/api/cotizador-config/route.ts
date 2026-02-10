import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase-types"
import type { CotizadorConfig } from "@/lib/cotizador"
import { defaultCotizadorConfig } from "@/lib/cotizador"

const COTIZADOR_PAGE = "settings"
const COTIZADOR_KEY = "cotizador_config"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** GET: configuración pública de la calculadora (defaults o guardada en site_content) */
export async function GET() {
  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
    const { data: row, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("page_slug", COTIZADOR_PAGE)
      .eq("section_key", COTIZADOR_KEY)
      .maybeSingle()

    if (error) {
      console.error("cotizador-config GET error:", error)
      return NextResponse.json(defaultCotizadorConfig)
    }

    if (!row?.value) {
      return NextResponse.json(defaultCotizadorConfig)
    }

    try {
      const parsed = JSON.parse(row.value) as CotizadorConfig
      // Validar estructura mínima
      if (
        parsed?.margins?.low?.threshold != null &&
        parsed?.margins?.medium?.threshold != null &&
        parsed?.margins?.high?.threshold != null &&
        parsed?.extras?.placa != null &&
        parsed?.extras?.ponchado != null &&
        parsed?.extras?.tratamiento != null
      ) {
        return NextResponse.json(parsed)
      }
    } catch {
      // JSON inválido
    }
    return NextResponse.json(defaultCotizadorConfig)
  } catch (e) {
    console.error(e)
    return NextResponse.json(defaultCotizadorConfig)
  }
}

/** PATCH: actualizar configuración (solo admin) */
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

  let body: CotizadorConfig
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 })
  }

  const config: CotizadorConfig = {
    margins: {
      low: {
        threshold: Number(body.margins?.low?.threshold) ?? defaultCotizadorConfig.margins.low.threshold,
        percentage: Number(body.margins?.low?.percentage) ?? defaultCotizadorConfig.margins.low.percentage,
      },
      medium: {
        threshold: Number(body.margins?.medium?.threshold) ?? defaultCotizadorConfig.margins.medium.threshold,
        percentage: Number(body.margins?.medium?.percentage) ?? defaultCotizadorConfig.margins.medium.percentage,
      },
      high: {
        threshold: Number(body.margins?.high?.threshold) ?? defaultCotizadorConfig.margins.high.threshold,
        percentage: Number(body.margins?.high?.percentage) ?? defaultCotizadorConfig.margins.high.percentage,
      },
    },
    extras: {
      placa: Number(body.extras?.placa) ?? defaultCotizadorConfig.extras.placa,
      ponchado: Number(body.extras?.ponchado) ?? defaultCotizadorConfig.extras.ponchado,
      tratamiento: Number(body.extras?.tratamiento) ?? defaultCotizadorConfig.extras.tratamiento,
    },
  }

  const { error } = await supabaseUser.from("site_content").upsert(
    {
      page_slug: COTIZADOR_PAGE,
      section_key: COTIZADOR_KEY,
      content_type: "text",
      value: JSON.stringify(config),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_slug,section_key" }
  )

  if (error) {
    console.error("cotizador-config PATCH error:", error)
    return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 })
  }

  return NextResponse.json({ success: true, config })
}
