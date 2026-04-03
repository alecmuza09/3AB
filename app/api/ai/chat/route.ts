/**
 * API de chat con IA usando Google Gemini 2.5 Flash via REST.
 * Gemini responde en JSON estructurado con { message, productIds }
 * para garantizar que los productos recomendados siempre sean del catálogo real.
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

    const catalog = await fetchCatalogFromDB()

    // Catálogo con IDs para que la IA pueda referenciarlos exactamente
    const catalogText =
      catalog.length > 0
        ? catalog
            .map((p) => {
              const price = p.price != null ? `$${Number(p.price).toFixed(2)} MXN` : "precio a consultar"
              const desc = p.description ? ` — ${p.description.slice(0, 80)}` : ""
              return `[ID:${p.id}] ${p.name} | ${p.category} | ${price}${desc}`
            })
            .join("\n")
        : "No hay productos disponibles."

    const systemPrompt = `Eres el asistente de ventas de 3A Branding, empresa mexicana especializada en productos promocionales y branding corporativo.

CATÁLOGO DE PRODUCTOS (con sus IDs):
${catalogText}

INSTRUCCIONES:
- Responde SIEMPRE en formato JSON válido con esta estructura exacta:
  {"message": "tu respuesta aquí", "productIds": ["id1", "id2", "id3"]}
- En "message": responde de forma directa, amigable y profesional en español mexicano. Máximo 3-4 oraciones.
- En "productIds": incluye los IDs de 3-5 productos del catálogo que recomiendes. Si aún no tienes suficiente contexto para recomendar, deja el arreglo vacío [].
- Recomienda productos en cuanto tengas el contexto básico (tipo de uso, evento o necesidad). No hagas más de 1 pregunta seguida.
- Si el presupuesto es total (ej: $10,000 para 20 personas), calcula el costo por pieza y filtra los productos en ese rango.
- No inventes ni menciones productos fuera del catálogo.
- IMPORTANTE: Responde SOLO con el JSON, sin texto extra antes ni después.`

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Cliente" : "Asistente"}: ${m.content}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\nCONVERSACIÓN:\n${conversationText}\n\nAsistente (responde solo con JSON):`

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error("[AI Chat] Gemini error:", geminiRes.status, errBody)
      return NextResponse.json({ error: "Error de Gemini API", detail: errBody }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Parsear la respuesta JSON — Gemini a veces la envuelve en ```json ... ```
    let message = ""
    let productIds: string[] = []

    const extractJSON = (text: string): string => {
      // Quitar bloques de código markdown si los hay
      const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
      if (mdMatch) return mdMatch[1].trim()
      // Extraer el primer objeto JSON del texto
      const objMatch = text.match(/\{[\s\S]*\}/)
      if (objMatch) return objMatch[0]
      return text.trim()
    }

    try {
      const jsonStr = extractJSON(rawText)
      const parsed = JSON.parse(jsonStr)
      message = typeof parsed.message === "string" ? parsed.message.trim() : ""
      productIds = Array.isArray(parsed.productIds) ? parsed.productIds : []
    } catch {
      // Fallback: usar el texto como mensaje sin productos
      message = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim()
      productIds = []
    }

    // Buscar los productos completos por ID
    const mentionedProducts = productIds
      .map((id) => catalog.find((p) => p.id === id))
      .filter(Boolean) as CatalogProduct[]

    return NextResponse.json({ reply: message, mentionedProducts })
  } catch (error: any) {
    console.error("[AI Chat] Error interno:", error?.message ?? error)
    return NextResponse.json(
      { error: "Error interno del servidor", detail: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}
