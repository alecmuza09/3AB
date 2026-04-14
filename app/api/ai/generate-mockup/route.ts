/**
 * POST /api/ai/generate-mockup
 *
 * Genera un mockup realista del producto con el logo del cliente usando
 * Gemini 2.0 Flash (generación de imágenes con entrada multimodal).
 *
 * Body esperado:
 *   productImageUrl  — URL de la imagen del producto (se descarga en el servidor)
 *   logoBase64       — Logo del cliente en base64 (data URL o base64 puro)
 *   logoMimeType     — MIME del logo: "image/png" | "image/jpeg" | "image/svg+xml"
 *   productName      — Nombre del producto para el prompt
 *   style            — Estilo de mockup: "professional" | "lifestyle" | "flat"
 *
 * Respuesta:
 *   { success: true, imageBase64: "...", mimeType: "image/png" }
 *   { success: false, error: "...", fallback: true }  → usar composición de canvas como fallback
 */

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`No se pudo descargar la imagen: ${res.status}`)
  const buffer = await res.arrayBuffer()
  const data = Buffer.from(buffer).toString('base64')
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const mimeType = contentType.split(';')[0].trim()
  return { data, mimeType }
}

function stripDataUrlPrefix(base64: string): { data: string; mimeType: string } {
  const match = base64.match(/^data:([^;]+);base64,(.+)$/)
  if (match) return { mimeType: match[1], data: match[2] }
  return { mimeType: 'image/png', data: base64 }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const {
      productImageUrl,
      logoBase64,
      productName = 'producto promocional',
      style = 'professional',
    } = body

    if (!productImageUrl || !logoBase64) {
      return NextResponse.json(
        { error: 'Se requiere productImageUrl y logoBase64' },
        { status: 400 }
      )
    }

    // Descargar imagen del producto
    let productImageData: string
    let productMimeType: string
    try {
      const result = await urlToBase64(productImageUrl)
      productImageData = result.data
      productMimeType = result.mimeType
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `No se pudo cargar la imagen del producto: ${e}`, fallback: true },
        { status: 200 }
      )
    }

    // Limpiar el logo base64
    const { data: logoData, mimeType: logoMimeType } = stripDataUrlPrefix(logoBase64)

    const styleDescriptions: Record<string, string> = {
      professional:
        'fotografía de producto profesional con fondo neutro, iluminación de estudio, sombra suave',
      lifestyle:
        'fotografía estilo lifestyle en un entorno de oficina moderno o espacio de trabajo',
      flat: 'vista plana cenital (flat lay) con fondo blanco limpio',
    }

    const styleDesc = styleDescriptions[style] || styleDescriptions.professional

    const prompt = `Eres un diseñador gráfico especializado en mockups de productos promocionales.

TAREA: Crea un mockup fotorrealista del producto que se muestra en la primera imagen, con el logo de la segunda imagen aplicado de forma natural y profesional sobre la superficie del producto.

PRODUCTO: ${productName}
ESTILO: ${styleDesc}

INSTRUCCIONES:
- El logo debe aparecer impreso, bordado o grabado de forma realista en el producto
- Mantén las proporciones y perspectiva correctas del producto
- El resultado debe verse como una fotografía real de producto con el logo ya aplicado
- Usa el color y textura original del producto; adapta el logo para que se integre naturalmente
- Si el producto tiene una superficie curva (taza, botella), adapta el logo a esa curvatura
- El fondo debe ser limpio y profesional

Genera únicamente la imagen del mockup, sin texto adicional.`

    const geminiUrl = `${GEMINI_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`

    const geminiBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: productMimeType,
                data: productImageData,
              },
            },
            {
              inline_data: {
                mime_type: logoMimeType,
                data: logoData,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        temperature: 0.4,
      },
    }

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
      signal: AbortSignal.timeout(60_000),
    })

    const geminiData = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('[generate-mockup] Gemini error:', geminiRes.status, JSON.stringify(geminiData))

      // Si el modelo no está disponible, devolver fallback para composición en canvas
      const isModelError =
        geminiRes.status === 404 ||
        geminiData?.error?.message?.includes('model') ||
        geminiData?.error?.message?.includes('not found')

      return NextResponse.json(
        {
          success: false,
          error: geminiData?.error?.message || 'Error de Gemini API',
          fallback: isModelError,
        },
        { status: 200 }
      )
    }

    // Extraer la imagen generada de la respuesta
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find(
      (p: any) => p.inline_data?.data && p.inline_data?.mime_type?.startsWith('image/')
    )

    if (!imagePart) {
      console.error('[generate-mockup] No se encontró imagen en la respuesta:', JSON.stringify(geminiData).slice(0, 500))
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini no devolvió una imagen. Intenta con otra imagen de producto o logo.',
          fallback: true,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      imageBase64: imagePart.inline_data.data,
      mimeType: imagePart.inline_data.mime_type,
    })
  } catch (error) {
    console.error('[generate-mockup] Error interno:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        fallback: true,
      },
      { status: 200 }
    )
  }
}
