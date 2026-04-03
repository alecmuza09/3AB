/**
 * API de chat con IA usando Google Gemini 2.5 Flash via REST.
 * Usa formato texto con separador para evitar problemas de truncación de JSON.
 * El catálogo se pre-filtra por relevancia para reducir el tamaño del prompt.
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
      .limit(150)

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

// Pre-filtra el catálogo por relevancia usando la conversación completa
// para reducir el tamaño del prompt enviado a Gemini
function filterCatalogByRelevance(
  catalog: CatalogProduct[],
  conversationText: string,
  limit = 30
): CatalogProduct[] {
  if (catalog.length === 0) return []

  const text = conversationText.toLowerCase()

  // Palabras clave de producto mapeadas a términos de búsqueda
  const keywordMap: Record<string, string[]> = {
    viaje: ["viaje", "travel", "auto", "carro", "portátil", "outdoor"],
    tecnología: ["usb", "cargador", "cable", "power", "gadget", "tech", "electrónico"],
    escritura: ["pluma", "bolígrafo", "libreta", "agenda", "cuaderno", "escritorio", "bic", "escolar"],
    bebidas: ["termo", "taza", "vaso", "botella", "mug", "bebida", "café"],
    textil: ["playera", "camisa", "gorra", "mochila", "bolsa", "tela", "prenda"],
    herramienta: ["herramienta", "navaja", "multiherramienta", "llave", "linterna", "lámpara"],
    eco: ["ecológico", "bambú", "reciclado", "sustentable", "verde"],
    premium: ["premium", "ejecutivo", "lujo", "exclusivo", "sofisticado"],
  }

  const activeCategories = Object.entries(keywordMap)
    .filter(([, terms]) => terms.some((t) => text.includes(t)))
    .map(([cat]) => cat)

  if (activeCategories.length === 0) {
    // Sin contexto específico: devolver muestra variada
    return catalog.slice(0, limit)
  }

  const scored = catalog.map((p) => {
    const haystack = `${p.name} ${p.category} ${p.description ?? ""}`.toLowerCase()
    const score = activeCategories.reduce((acc, cat) => {
      const terms = keywordMap[cat]!
      return acc + terms.reduce((s, t) => s + (haystack.includes(t) ? 3 : 0), 0)
    }, 0)
    return { p, score }
  })

  const relevant = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p)

  return relevant.length >= 8 ? relevant : catalog.slice(0, limit)
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

    const allCatalog = await fetchCatalogFromDB()
    const conversationText = messages.map((m) => m.content).join(" ")
    const catalog = filterCatalogByRelevance(allCatalog, conversationText, 30)

    const catalogText = catalog
      .map((p) => {
        const price = p.price != null ? `$${Number(p.price).toFixed(2)} MXN` : "precio a consultar"
        const desc = p.description ? ` — ${p.description.slice(0, 60)}` : ""
        return `[${p.id}] ${p.name} | ${p.category} | ${price}${desc}`
      })
      .join("\n")

    const systemPrompt = `Eres el asistente de ventas de 3A Branding, empresa mexicana especializada en productos promocionales y branding corporativo.

CATÁLOGO DISPONIBLE (usa estos IDs exactos):
${catalogText}

FORMATO DE RESPUESTA OBLIGATORIO — dos secciones separadas por "---":
Línea 1 a N: tu mensaje conversacional
---
id1,id2,id3

Ejemplo:
¡Hola! Para tu evento te recomiendo estas opciones prácticas y llamativas que encajan perfecto con tu presupuesto.
---
abc-123,def-456,ghi-789

REGLAS:
- El mensaje debe ser directo, amigable y en español mexicano. Máximo 3-4 oraciones.
- Recomienda 3-5 productos en cuanto tengas contexto básico (uso, ocasión o necesidad). No hagas más de 1 pregunta seguida.
- Solo incluye IDs del catálogo. Si no hay productos relevantes o aún no hay suficiente contexto, escribe [] después del ---.
- Si el presupuesto es total (ej: $10,000 para 20 personas = $500/pieza), calcula el costo por pieza y filtra por ese rango.`

    const chatLines = messages
      .map((m) => `${m.role === "user" ? "Cliente" : "Asistente"}: ${m.content}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\nCONVERSACIÓN:\n${chatLines}\n\nAsistente:`

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error("[AI Chat] Gemini error:", geminiRes.status, errBody)
      return NextResponse.json({ error: "Error de Gemini API", detail: errBody }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Parsear el formato "mensaje\n---\nid1,id2,id3"
    const separatorIdx = rawText.lastIndexOf("---")
    let message = rawText.trim()
    let productIds: string[] = []

    if (separatorIdx !== -1) {
      message = rawText.slice(0, separatorIdx).trim()
      const idLine = rawText.slice(separatorIdx + 3).trim()
      if (idLine && idLine !== "[]") {
        productIds = idLine
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
    }

    // Buscar los productos completos por ID
    const mentionedProducts = productIds
      .map((id) => allCatalog.find((p) => p.id === id))
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
