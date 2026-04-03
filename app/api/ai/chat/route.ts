/**
 * API de chat con IA usando Google Gemini.
 * POST /api/ai/chat
 *
 * Body:
 * {
 *   messages: { role: "user" | "model", text: string }[],
 *   context: {
 *     eventType?: string, audience?: string, objective?: string,
 *     attendees?: string, budget?: string, productPreference?: string
 *   },
 *   catalogSummary: { name: string, category: string, price: number }[]
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `Eres el asistente de ventas de 3A Branding, empresa mexicana especializada en productos promocionales y artículos de branding (termos, playeras, gorras, libretas, mochilas, USB, artículos ecológicos, kits corporativos, uniformes, etc.).

Tu objetivo es ayudar al usuario a encontrar los productos ideales para su evento o necesidad. Eres amigable, empático, profesional y conciso. Respondes siempre en español mexicano.

Reglas importantes:
- Responde en máximo 3-4 oraciones cortas. No uses listas largas en cada mensaje.
- Si el usuario ya tiene contexto (tipo de evento, audiencia, presupuesto), úsalo para personalizar la respuesta.
- Cuando recomiendes productos, menciona nombres o categorías de productos del catálogo proporcionado.
- Si el usuario pregunta por cotización, dile que puede hacer clic en cualquier producto recomendado o contactar al equipo.
- No inventes precios ni información que no esté en el catálogo. 
- Si el catálogo está vacío, di que el catálogo está cargando.
- No uses emojis en exceso, máximo 1-2 por respuesta.
- Termina tus respuestas con una pregunta o invitación a continuar cuando sea natural.`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 })
    }

    const body = await request.json()
    const {
      messages = [],
      context = {},
      catalogSummary = [],
    } = body as {
      messages: { role: "user" | "model"; text: string }[]
      context: Record<string, string>
      catalogSummary: { name: string; category: string; price: number }[]
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Construir contexto actual del usuario
    const contextLines: string[] = []
    if (context.eventType) contextLines.push(`Tipo de evento: ${context.eventType}`)
    if (context.audience) contextLines.push(`Audiencia: ${context.audience}`)
    if (context.objective) contextLines.push(`Objetivo: ${context.objective}`)
    if (context.attendees) contextLines.push(`Asistentes: ${context.attendees}`)
    if (context.budget) contextLines.push(`Presupuesto: ${context.budget}`)
    if (context.productPreference) contextLines.push(`Preferencia de producto: ${context.productPreference}`)

    // Resumen del catálogo (máx 40 productos para no exceder tokens)
    const catalogTop = catalogSummary.slice(0, 40)
    const catalogText =
      catalogTop.length > 0
        ? catalogTop
            .map((p) => `- ${p.name} (${p.category}) — $${p.price.toLocaleString("es-MX")} MXN`)
            .join("\n")
        : "Catálogo aún cargando."

    const systemWithContext = [
      SYSTEM_PROMPT,
      "",
      "=== CONTEXTO DEL USUARIO ===",
      contextLines.length > 0 ? contextLines.join("\n") : "Sin contexto aún.",
      "",
      "=== CATÁLOGO DISPONIBLE (muestra) ===",
      catalogText,
    ].join("\n")

    // Historial de conversación (excluyendo el último mensaje del usuario).
    // Se filtra para que empiece en el primer mensaje "user" y los roles alternen
    // estrictamente (user → model → user…), ya que Gemini lo exige.
    const rawHistory = messages.slice(0, -1)
    const firstUserIdx = rawHistory.findIndex((m) => m.role === "user")
    const alternatingHistory: typeof rawHistory = []
    let expectedRole: "user" | "model" = "user"
    for (const m of firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : []) {
      if (m.role === expectedRole) {
        alternatingHistory.push(m)
        expectedRole = expectedRole === "user" ? "model" : "user"
      }
    }
    const history = alternatingHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }))

    const lastUserMessage = messages[messages.length - 1]?.text ?? ""

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemWithContext }] },
        {
          role: "model",
          parts: [{ text: "Entendido. Estoy listo para ayudar a los clientes de 3A Branding a encontrar los mejores productos promocionales." }],
        },
        ...history,
      ],
    })

    const result = await chat.sendMessage(lastUserMessage)
    const responseText = result.response.text()

    return NextResponse.json({ reply: responseText })
  } catch (error: any) {
    console.error("[AI Chat] Error:", error)
    return NextResponse.json(
      { error: "Error al procesar la respuesta de IA", detail: error?.message },
      { status: 500 }
    )
  }
}
