import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

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

