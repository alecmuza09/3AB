/**
 * API de chat con IA usando Google Gemini 2.5 Flash via REST.
 * Los productos se obtienen directamente de Supabase en el servidor,
 * para garantizar que siempre haya catálogo disponible.
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

interface CatalogProduct {
  id: string
  name: string
  category: string
  price: number | null
  description: string | null
  image_url: string | null
  slug: string | null
}

// Obtiene productos del catálogo directo desde Supabase (servidor)
async function fetchCatalogFromDB(): Promise<CatalogProduct[]> {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, description, image_url, slug, category:categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(80)

    if (error || !data) return []

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name ?? "General",
      price: p.price,
      description: p.description,
      image_url: p.image_url,
      slug: p.slug ?? null,
    }))
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 })
    }

    const body = await request.json()
    const { messages = [] } = body as {
      messages: { role: "user" | "assistant"; content: string }[]
    }

    // Siempre obtenemos el catálogo desde el servidor
    const catalog = await fetchCatalogFromDB()

    const catalogText =
      catalog.length > 0
        ? catalog
            .map((p) => {
              const price = p.price != null ? `$${Number(p.price).toFixed(2)} MXN` : "precio a consultar"
              const desc = p.description ? ` — ${p.description.slice(0, 100)}` : ""
              return `• ${p.name} | ${p.category} | ${price}${desc}`
            })
            .join("\n")
        : "No hay productos disponibles en este momento."

    const systemPrompt = `Eres el asistente de ventas de 3A Branding, empresa mexicana especializada en productos promocionales y branding corporativo. Tu trabajo es ayudar a los clientes a elegir los mejores productos para sus necesidades.

CATÁLOGO DE PRODUCTOS DISPONIBLES:
${catalogText}

REGLAS DE COMPORTAMIENTO:
1. SIEMPRE recomienda productos concretos del catálogo en cuanto tengas suficiente información. No esperes más de 1-2 preguntas antes de dar opciones.
2. Cuando tengas el contexto (evento, audiencia, cantidad o presupuesto), da DE INMEDIATO una lista de 3-5 productos específicos con nombre y precio.
3. Si el presupuesto es por total (ej: $10,000 para 20 personas = $500/pieza), calcula el costo unitario y recomienda productos en ese rango.
4. Si no hay suficiente info, haz SOLO UNA pregunta específica, no varias.
5. Sé directo, amigable y profesional. Máximo 4-5 oraciones por respuesta.
6. No inventes productos ni precios. Solo usa el catálogo.
7. Si preguntan cómo comprar o cotizar, diles que hagan clic en el producto para ver detalles o que contacten al equipo de ventas.
8. Responde siempre en español mexicano.`

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Cliente" : "Asistente"}: ${m.content}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\nCONVERSACIÓN:\n${conversationText}\n\nAsistente:`

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error("[AI Chat] Gemini error:", geminiRes.status, errBody)
      return NextResponse.json({ error: "Error de Gemini API", detail: errBody }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Devolvemos los productos mencionados completos (con id, imagen, precio, slug)
    // para que el frontend pueda mostrarlos con links directos
    const mentionedProducts = catalog.filter((p) =>
      reply.toLowerCase().includes(p.name.toLowerCase())
    )

    return NextResponse.json({ reply, mentionedProducts })
  } catch (error: any) {
    console.error("[AI Chat] Error interno:", error?.message ?? error)
    return NextResponse.json(
      { error: "Error interno del servidor", detail: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}
