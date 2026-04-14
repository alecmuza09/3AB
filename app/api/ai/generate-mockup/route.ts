/**
 * POST /api/ai/generate-mockup
 *
 * Genera un mockup fotorrealista con Gemini 2.0 Flash (image-in / image-out).
 * IMPORTANTE: La API REST de Gemini usa camelCase en todos los campos JSON.
 *
 * Body:
 *   productImageUrl  — URL pública de la imagen del producto
 *   logoBase64       — Logo en data-URL (data:image/png;base64,...) o base64 puro
 *   productName      — Nombre del producto para el prompt
 *   style            — "professional" | "lifestyle" | "flat"
 *
 * Respuesta éxito:
 *   { success: true, imageBase64: "...", mimeType: "image/png" }
 * Respuesta error (con fallback al canvas):
 *   { success: false, error: "...", fallback: true, detail: "..." }
 */

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Modelos a intentar en orden (el primero disponible gana)
const IMAGE_MODELS = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-exp',
]

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(12_000),
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar imagen del producto`)
  const buffer = await res.arrayBuffer()
  const raw = Buffer.from(buffer).toString('base64')
  const ct = res.headers.get('content-type') || 'image/jpeg'
  // Normalizar: algunos CDN devuelven "image/svg+xml" — Gemini necesita JPEG o PNG
  const mime = ct.split(';')[0].trim()
  return { data: raw, mimeType: mime }
}

function parseLogoBase64(input: string): { data: string; mimeType: string } {
  const match = input.match(/^data:([^;]+);base64,(.+)$/)
  if (match) return { mimeType: match[1], data: match[2] }
  return { mimeType: 'image/png', data: input }
}

async function callGeminiImageGen(
  apiKey: string,
  model: string,
  parts: object[],
  temperature = 0.35
): Promise<{ ok: boolean; data: any; status: number }> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      // OBLIGATORIO: incluir ambas modalidades para que el modelo genere imagen
      responseModalities: ['TEXT', 'IMAGE'],
      temperature,
    },
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  })
  const data = await res.json()
  return { ok: res.ok, data, status: res.status }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY no configurada', fallback: false },
        { status: 500 }
      )
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
        { success: false, error: 'Se requiere productImageUrl y logoBase64', fallback: false },
        { status: 400 }
      )
    }

    // ── 1. Descargar imagen del producto ──────────────────────────────────────
    let productData: string
    let productMime: string
    try {
      const r = await urlToBase64(productImageUrl)
      productData = r.data
      productMime = r.mimeType
      // SVG no es soportado como entrada en Gemini; tratar como fallback
      if (productMime === 'image/svg+xml') {
        return NextResponse.json({
          success: false,
          error: 'La imagen del producto es SVG; no compatible con generación IA.',
          fallback: true,
        })
      }
    } catch (e: any) {
      console.error('[generate-mockup] Error descargando imagen:', e?.message)
      return NextResponse.json({
        success: false,
        error: `No se pudo descargar la imagen del producto: ${e?.message}`,
        fallback: true,
      })
    }

    // ── 2. Parsear logo ───────────────────────────────────────────────────────
    const { data: logoData, mimeType: logoMime } = parseLogoBase64(logoBase64)

    // ── 3. Construir prompt ───────────────────────────────────────────────────
    const styleMap: Record<string, string> = {
      professional: 'fondo blanco o gris neutro, iluminación de estudio, sombras suaves',
      lifestyle: 'entorno de oficina moderno o escritorio de trabajo, luz natural',
      flat: 'vista cenital (flat lay) sobre superficie blanca',
    }
    const styleDesc = styleMap[style] ?? styleMap.professional

    const prompt = `Eres un diseñador especializado en mockups de productos promocionales corporativos.

TAREA: Genera una imagen fotorrealista de alta calidad del producto "${productName}" con el logo de la empresa aplicado de forma natural y profesional.

INSTRUCCIONES OBLIGATORIAS:
1. El producto debe mantener exactamente su forma, color y perspectiva de la imagen de referencia.
2. El logo debe aparecer impreso, serigrafíado o grabado sobre la superficie principal del producto — NO como un sticker flotante.
3. Adapta el logo a la geometría del producto: si la superficie es curva (taza, botella), el logo debe seguir esa curvatura con la distorsión perspectiva correcta.
4. El logo debe integrarse al material del producto (si es textil, simula bordado o impresión; si es metal, simula grabado láser o serigrafía).
5. Estilo de fotografía: ${styleDesc}.
6. El resultado DEBE ser solo la imagen del producto; sin marcos, sin bordes, sin texto adicional.

Las dos imágenes adjuntas son: [1] el producto de referencia, [2] el logo a aplicar.`

    // ── 4. Intentar modelos en orden ──────────────────────────────────────────
    // CRÍTICO: Los campos de imagen usan camelCase en la API REST de Gemini:
    //   inlineData.mimeType  (NO inline_data.mime_type)
    const imageParts = [
      { text: prompt },
      {
        inlineData: {          // camelCase
          mimeType: productMime,  // camelCase
          data: productData,
        },
      },
      {
        inlineData: {          // camelCase
          mimeType: logoMime,  // camelCase
          data: logoData,
        },
      },
    ]

    let lastError = ''
    let lastDetail = ''

    for (const model of IMAGE_MODELS) {
      console.log(`[generate-mockup] Intentando modelo: ${model}`)
      try {
        const { ok, data: gData, status } = await callGeminiImageGen(apiKey, model, imageParts)

        if (!ok) {
          const errMsg = gData?.error?.message ?? `HTTP ${status}`
          console.warn(`[generate-mockup] ${model} → ${status}: ${errMsg}`)
          lastError = errMsg
          lastDetail = JSON.stringify(gData?.error ?? {}).slice(0, 300)
          // 404 = modelo no existe → probar el siguiente
          if (status === 404 || errMsg.toLowerCase().includes('not found')) continue
          // Cualquier otro error no es de modelo → detener
          break
        }

        // Buscar parte de imagen en la respuesta (camelCase en respuesta también)
        const parts: any[] = gData?.candidates?.[0]?.content?.parts ?? []
        const imgPart = parts.find(
          (p: any) => p.inlineData?.data && p.inlineData?.mimeType?.startsWith('image/')
        )

        if (!imgPart) {
          // A veces devuelve texto de rechazo en lugar de imagen
          const textPart = parts.find((p: any) => p.text)
          lastError = textPart?.text ?? 'El modelo no devolvió imagen'
          lastDetail = JSON.stringify(gData?.candidates?.[0] ?? {}).slice(0, 400)
          console.warn(`[generate-mockup] ${model} sin imagen. Texto: ${lastError.slice(0, 200)}`)
          continue
        }

        console.log(`[generate-mockup] Mockup generado con ${model}`)
        return NextResponse.json({
          success: true,
          imageBase64: imgPart.inlineData.data,
          mimeType: imgPart.inlineData.mimeType,
          model,
        })
      } catch (fetchErr: any) {
        console.error(`[generate-mockup] ${model} fetch error:`, fetchErr?.message)
        lastError = fetchErr?.message ?? 'Error de red'
        continue
      }
    }

    // Todos los modelos fallaron → fallback al canvas del cliente
    console.error('[generate-mockup] Todos los modelos fallaron. Último error:', lastError)
    return NextResponse.json({
      success: false,
      error: lastError || 'No se pudo generar el mockup con IA.',
      detail: lastDetail,
      fallback: true,
    })
  } catch (error: any) {
    console.error('[generate-mockup] Error interno:', error?.message ?? error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? 'Error interno del servidor',
        fallback: true,
      },
      { status: 200 }
    )
  }
}
