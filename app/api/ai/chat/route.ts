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

    // System prompt optimizado para ser directo y recomendar productos
    const systemPrompt = `Eres el asistente de ventas de 3A Branding, empresa mexicana especializada en productos promocionales y branding corporativo.

CATÁLOGO DE PRODUCTOS DISPONIBLES:
${catalogText}

CÓMO DEBES RESPONDER:
1. Si el cliente da suficiente contexto (tipo de evento, ocasión o necesidad), RECOMIENDA PRODUCTOS DE INMEDIATO del catálogo. No sigas haciendo preguntas.
2. Solo haz UNA pregunta a la vez cuando realmente falte información clave (ej: si no sabes nada del evento).
3. Cuando recomiendes, menciona 2-4 productos del catálogo por nombre exacto y precio. Sé específico.
4. Si el cliente menciona presupuesto, filtra las recomendaciones a productos dentro de ese rango.
5. Si el cliente menciona cantidad (ej: 100 piezas), considera el costo total en tu respuesta.
6. Responde de forma directa y concisa. Máximo 5 oraciones. Sin rodeos ni preguntas innecesarias.
7. Habla en español mexicano, amigable y profesional.
8. No inventes productos ni precios que no estén en el catálogo.
9. Si preguntan por cotización, diles que hagan clic en el producto o contacten al equipo de ventas.`

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
          temperature: 0.6,
          maxOutputTokens: 1024,
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
