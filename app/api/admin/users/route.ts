import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error loading profiles:", profilesError)
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    const orderIdsByUser: Record<string, { count: number; total: number; lastLogin: string | null }> = {}
    for (const p of profiles || []) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, created_at")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false })
      const count = orders?.length || 0
      const total = orders?.reduce((sum, o) => sum + Number(o?.total || 0), 0) || 0
      const lastLogin = p.updated_at || p.created_at || null
      orderIdsByUser[p.id] = { count, total, lastLogin }
    }

    const users = (profiles || []).map((profile) => ({
      ...profile,
      orders: orderIdsByUser[profile.id]?.count ?? 0,
      totalSpent: orderIdsByUser[profile.id]?.total ?? 0,
      lastLogin: orderIdsByUser[profile.id]?.lastLogin ?? null,
    }))

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: error.message || "Error al cargar usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, role } = body

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, password y nombre son requeridos" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 })
    }

    // Crear perfil
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name,
      phone: phone || null,
      role: role || "customer",
    })

    if (profileError) {
      // Intentar eliminar el usuario de auth si falla la creación del perfil
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: error.message || "Error al crear usuario" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Eliminar perfil
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Eliminar usuario de auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      // El perfil ya fue eliminado
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar usuario" }, { status: 500 })
  }
}


