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
      catalogSummary: { name: string; category: string; price: number | null }[]
    }

    // Construir contexto del usuario
    const contextLines: string[] = []
    if (context.eventType) contextLines.push(`Tipo de evento: ${context.eventType}`)
    if (context.audience) contextLines.push(`Audiencia: ${context.audience}`)
    if (context.objective) contextLines.push(`Objetivo: ${context.objective}`)
    if (context.attendees) contextLines.push(`Asistentes: ${context.attendees}`)
    if (context.budget) contextLines.push(`Presupuesto: ${context.budget}`)
    if (context.productPreference) contextLines.push(`Preferencia de producto: ${context.productPreference}`)

    // Resumen del catálogo (máx 40 productos para no exceder tokens)
    const catalogText =
      catalogSummary.length > 0
        ? catalogSummary
            .slice(0, 40)
            .map((p) => `- ${p.name} (${p.category || "General"}) — $${Number(p.price ?? 0).toFixed(2)} MXN`)
            .join("\n")
        : "Catálogo aún cargando."

    // Formatear el historial de conversación como texto plano
    // (evita restricciones de alternancia estricta del API de startChat)
    const conversationLines = messages
      .slice(0, -1)
      .filter((m) => m.text?.trim())
      .map((m) => {
        const speaker = m.role === "user" ? "Cliente" : "Asistente"
        return `${speaker}: ${m.text.trim()}`
      })
      .join("\n")

    const lastUserMessage = messages[messages.length - 1]?.text?.trim() ?? ""

    const prompt = `Eres el asistente de ventas de 3A Branding, empresa mexicana especializada en productos promocionales (termos, playeras, gorras, libretas, mochilas, USB, artículos ecológicos, kits corporativos, uniformes, etc.).

Tu objetivo es ayudar a encontrar los productos ideales para el evento o necesidad del cliente. Eres amigable, empático, profesional y conciso. Respondes siempre en español mexicano.

Reglas:
- Responde en máximo 3-4 oraciones cortas. Sin listas largas.
- Usa el contexto del cliente para personalizar la respuesta.
- Menciona productos o categorías del catálogo cuando sea relevante.
- Si preguntan por cotización, diles que hagan clic en el producto o contacten al equipo.
- No inventes precios ni información fuera del catálogo.
- Máximo 1-2 emojis por respuesta.
- Termina con una pregunta o invitación a continuar cuando sea natural.

=== CONTEXTO DEL CLIENTE ===
${contextLines.length > 0 ? contextLines.join("\n") : "Sin contexto aún."}

=== CATÁLOGO DISPONIBLE (muestra) ===
${catalogText}

=== CONVERSACIÓN ANTERIOR ===
${conversationLines || "(Primera interacción)"}

Cliente: ${lastUserMessage}
Asistente:`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    return NextResponse.json({ reply: responseText })
  } catch (error: any) {
    console.error("[AI Chat] Error:", error?.message ?? error)
    return NextResponse.json(
      { error: "Error al procesar la respuesta de IA", detail: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}
