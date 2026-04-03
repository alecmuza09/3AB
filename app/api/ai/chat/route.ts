/**
 * API de chat con IA usando Google Gemini 2.0 Flash via REST.
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from "next/server"

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 })
    }

    const body = await request.json()
    const {
      messages = [],
      catalogSummary = [],
    } = body as {
      messages: { role: "user" | "assistant"; content: string }[]
      catalogSummary: { name: string; category: string; price: number | null; description?: string | null }[]
    }

    // Construir resumen del catálogo para el contexto
    const catalogText =
      catalogSummary.length > 0
        ? catalogSummary
            .slice(0, 50)
            .map((p) => {
              const price = Number(p.price ?? 0).toFixed(2)
              const desc = p.description ? ` — ${p.description.slice(0, 80)}` : ""
              return `• ${p.name} (${p.category || "General"}) $${price} MXN${desc}`
            })
            .join("\n")
        : "El catálogo está cargando."

    // System prompt completo
    const systemPrompt = `Eres el asistente de ventas de 3A Branding, empresa mexicana líder en productos promocionales y branding corporativo.

CATÁLOGO ACTUAL DE PRODUCTOS:
${catalogText}

INSTRUCCIONES:
- Habla siempre en español mexicano, de forma amigable, cálida y profesional.
- Tu objetivo es ayudar al cliente a encontrar el producto promocional perfecto para su necesidad.
- Haz preguntas sobre el tipo de evento, la audiencia, la cantidad aproximada y el presupuesto para dar mejores recomendaciones.
- Recomienda productos específicos del catálogo cuando sea relevante. Menciona el nombre y precio.
- Si te preguntan por cotización, diles que pueden hacer clic en el producto para ver detalles o contactar al equipo.
- Responde de forma concisa (2-4 oraciones). No hagas listas largas a menos que el cliente pida opciones.
- Cuando sea natural, termina con una pregunta para mantener la conversación.
- No inventes productos ni precios fuera del catálogo.`

    // Formatear historial como conversación para Gemini
    const conversationText = messages
      .map((m) => {
        const role = m.role === "user" ? "Cliente" : "Asistente"
        return `${role}: ${m.content}`
      })
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\nCONVERSACIÓN:\n${conversationText}\n\nAsistente:`

    // Llamada REST directa a Gemini
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error("[AI Chat] Gemini API error:", geminiRes.status, errBody)
      return NextResponse.json(
        { error: "Error de Gemini API", detail: errBody },
        { status: 500 }
      )
    }

    const geminiData = await geminiRes.json()
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("[AI Chat] Error interno:", error?.message ?? error)
    return NextResponse.json(
      { error: "Error interno del servidor", detail: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}
