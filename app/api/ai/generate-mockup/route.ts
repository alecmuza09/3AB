/**
 * POST /api/ai/generate-mockup
 *
 * Pipeline de dos llamadas Gemini:
 *   1. gemini-2.5-flash (visión + texto) analiza el producto y el logo →
 *      devuelve JSON con área de impresión, perspectiva, técnica, blend mode
 *      y un prompt de generación personalizado en inglés.
 *   2. gemini-2.0-flash-preview-image-generation recibe ese prompt + las dos
 *      imágenes y produce el mockup fotorrealista.
 *
 * Si la generación de imagen falla, el servidor devuelve el análisis JSON para
 * que el cliente realice una composición canvas inteligente.
 *
 * Campos JSON importantes:  SIEMPRE camelCase en la REST API de Gemini.
 */

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const VISION_MODEL = 'gemini-2.5-flash'
const IMAGE_MODELS = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-exp',
]

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MockupAnalysis {
  product: {
    type: string
    material: string
    mainSurface: string
    primaryColor: string
    hasCurvature: boolean
    curvatureAxis: 'horizontal' | 'vertical' | 'none'
    perspective: 'frontal' | '3quarter' | 'top' | 'angled'
    placementArea: {
      xPct: number  // centro X del área imprimible, 0-100
      yPct: number  // centro Y del área imprimible, 0-100
      wPct: number  // ancho del área como % del total de la imagen
      hPct: number  // alto del área como % del total de la imagen
    }
  }
  logo: {
    hasBackground: boolean
    primaryColor: string
    style: 'icon_only' | 'text_only' | 'icon_and_text' | 'complex'
    recommendedSizePct: number  // % del ancho del producto que debe ocupar el logo
  }
  application: {
    technique: 'serigraphy' | 'digital_print' | 'laser_engraving' | 'embroidery' | 'debossing'
    logoColorAdjustment: string   // e.g. "white on dark product", "original colors"
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
    opacity: number               // 0.6 – 1.0
    perspectiveSkew: boolean      // si hay que aplicar distorsión perspectiva al logo
  }
  generationPrompt: string        // prompt en inglés, ultra-específico, listo para usar
}

// ── Utilidades ────────────────────────────────────────────────────────────────

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(12_000),
    headers: { 'User-Agent': 'Mozilla/5.0 3ABranding/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar imagen`)
  const buf = await res.arrayBuffer()
  const ct = res.headers.get('content-type') ?? 'image/jpeg'
  return { data: Buffer.from(buf).toString('base64'), mimeType: ct.split(';')[0].trim() }
}

function parseLogoDataUrl(input: string): { data: string; mimeType: string } {
  const m = input.match(/^data:([^;]+);base64,(.+)$/)
  return m ? { mimeType: m[1], data: m[2] } : { mimeType: 'image/png', data: input }
}

function inlineImg(mimeType: string, data: string) {
  return { inlineData: { mimeType, data } }  // camelCase obligatorio en Gemini REST
}

// ── Paso 1: Análisis de visión ────────────────────────────────────────────────

async function analyzeImages(
  apiKey: string,
  productMime: string,
  productData: string,
  logoMime: string,
  logoData: string,
  productName: string,
  style: string,
): Promise<MockupAnalysis | null> {
  const analysisPrompt = `You are an expert product mockup designer. Analyze the two images:
- Image 1: a product called "${productName}"
- Image 2: a brand logo

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "product": {
    "type": "<concise product type, e.g. Swiss Army knife, ceramic mug, cotton t-shirt>",
    "material": "<main material, e.g. stainless steel, ceramic, cotton, plastic>",
    "mainSurface": "<describe the main printable/imprintable surface in one sentence>",
    "primaryColor": "<dominant hex color of the product, e.g. #2c2c2c>",
    "hasCurvature": <true if surface is curved, false if flat>,
    "curvatureAxis": "<horizontal|vertical|none>",
    "perspective": "<frontal|3quarter|top|angled>",
    "placementArea": {
      "xPct": <center X of best logo placement area as % of image width, 0-100>,
      "yPct": <center Y of best logo placement area as % of image height, 0-100>,
      "wPct": <width of placement zone as % of image width>,
      "hPct": <height of placement zone as % of image height>
    }
  },
  "logo": {
    "hasBackground": <true if logo has a solid/colored background, false if transparent/cutout>,
    "primaryColor": "<dominant hex color of the logo>",
    "style": "<icon_only|text_only|icon_and_text|complex>",
    "recommendedSizePct": <recommended logo width as % of product width, typically 20-45>
  },
  "application": {
    "technique": "<serigraphy|digital_print|laser_engraving|embroidery|debossing — best for this product/logo combo>",
    "logoColorAdjustment": "<e.g. 'use white logo on dark product', 'original colors work well', 'invert colors for laser engraving'>",
    "blendMode": "<normal|multiply|screen|overlay — best for realistic integration>",
    "opacity": <0.75-1.0>,
    "perspectiveSkew": <true if logo should be distorted to match product perspective>
  },
  "generationPrompt": "<A detailed image generation prompt in English (100-150 words) describing exactly how to place this specific logo on this specific product. Include: product material, logo placement location, imprint technique, lighting style '${style === 'lifestyle' ? 'lifestyle photography in modern office' : style === 'flat' ? 'flat lay top view on white surface' : 'professional product photography on neutral background'}', photorealistic quality.>"
}`

  const url = `${GEMINI_BASE}/${VISION_MODEL}:generateContent?key=${apiKey}`
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: analysisPrompt },
        inlineImg(productMime, productData),
        inlineImg(logoMime, logoData),
      ],
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('[mockup/analysis] Gemini Vision error:', res.status, data?.error?.message)
      return null
    }
    let raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    // Limpiar posibles bloques markdown ```json … ```
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const analysis: MockupAnalysis = JSON.parse(raw)
    console.log('[mockup/analysis] Análisis OK:', analysis.product.type, '|', analysis.application.technique)
    return analysis
  } catch (e: any) {
    console.error('[mockup/analysis] Parse/fetch error:', e?.message)
    return null
  }
}

// ── Paso 2: Generación de imagen ──────────────────────────────────────────────

async function generateImage(
  apiKey: string,
  analysis: MockupAnalysis | null,
  productMime: string,
  productData: string,
  logoMime: string,
  logoData: string,
  productName: string,
  style: string,
): Promise<{ imageBase64: string; mimeType: string; model: string } | null> {

  const styleMap: Record<string, string> = {
    professional: 'professional product photography on neutral studio background with soft shadows',
    lifestyle: 'lifestyle photography in a modern office or workspace, natural light',
    flat: 'flat lay top-down view on clean white surface',
  }

  const basePrompt = analysis?.generationPrompt
    ?? `Create a photorealistic product mockup of "${productName}" with the brand logo from the second image applied directly onto the product's main surface. The logo should look imprinted, not floating. Style: ${styleMap[style] ?? styleMap.professional}. High quality, sharp details.`

  const fullPrompt = `${basePrompt}

CRITICAL REQUIREMENTS:
- Logo must be physically applied to the product surface (imprinted/printed/engraved), NOT as a floating overlay
- Maintain the product's exact shape, color (${analysis?.product.primaryColor ?? 'original'}), material (${analysis?.product.material ?? 'original'}) and perspective
- Application technique: ${analysis?.application.technique ?? 'digital print'}
- ${analysis?.application.logoColorAdjustment ?? 'Use logo colors as-is'}
- Background style: ${styleMap[style] ?? styleMap.professional}
- Output: only the product, no text, no frames, photorealistic quality`

  const parts = [
    { text: fullPrompt },
    inlineImg(productMime, productData),
    inlineImg(logoMime, logoData),
  ]

  for (const model of IMAGE_MODELS) {
    console.log('[mockup/gen] Intentando modelo:', model)
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.3,
          },
        }),
        signal: AbortSignal.timeout(90_000),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error?.message ?? `HTTP ${res.status}`
        console.warn(`[mockup/gen] ${model}: ${msg}`)
        if (res.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('deprecated')) continue
        break
      }
      const responseParts: any[] = data?.candidates?.[0]?.content?.parts ?? []
      const imgPart = responseParts.find(
        (p: any) => p.inlineData?.data && p.inlineData?.mimeType?.startsWith('image/')
      )
      if (!imgPart) {
        const text = responseParts.find((p: any) => p.text)?.text ?? ''
        console.warn(`[mockup/gen] ${model} no devolvió imagen. Texto: ${text.slice(0, 150)}`)
        continue
      }
      return { imageBase64: imgPart.inlineData.data, mimeType: imgPart.inlineData.mimeType, model }
    } catch (e: any) {
      console.error(`[mockup/gen] ${model} error:`, e?.message)
    }
  }
  return null
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const {
      productImageUrl,
      logoBase64,
      productName = 'producto promocional',
      style = 'professional',
    } = body

    if (!productImageUrl || !logoBase64) {
      return NextResponse.json({ success: false, error: 'Se requiere productImageUrl y logoBase64' }, { status: 400 })
    }

    // Descargar imagen del producto
    let productData: string, productMime: string
    try {
      const r = await urlToBase64(productImageUrl)
      productData = r.data
      productMime = r.mimeType
      if (productMime === 'image/svg+xml') {
        return NextResponse.json({ success: false, error: 'La imagen del producto es SVG; usa PNG o JPEG.', fallback: true })
      }
    } catch (e: any) {
      return NextResponse.json({ success: false, error: `No se pudo descargar la imagen del producto: ${e?.message}`, fallback: true })
    }

    const { data: logoData, mimeType: logoMime } = parseLogoDataUrl(logoBase64)

    // ── Paso 1: Análisis ────────────────────────────────────────────────────
    const analysis = await analyzeImages(apiKey, productMime, productData, logoMime, logoData, productName, style)

    // ── Paso 2: Generación ──────────────────────────────────────────────────
    const generated = await generateImage(apiKey, analysis, productMime, productData, logoMime, logoData, productName, style)

    if (generated) {
      return NextResponse.json({
        success: true,
        imageBase64: generated.imageBase64,
        mimeType: generated.mimeType,
        model: generated.model,
        analysis,
      })
    }

    // Imagen no generada → devolver análisis para canvas inteligente en cliente
    return NextResponse.json({
      success: false,
      error: 'Los modelos de generación de imagen no están disponibles en este momento.',
      fallback: true,
      analysis,
    })
  } catch (error: any) {
    console.error('[generate-mockup] Error interno:', error?.message)
    return NextResponse.json({ success: false, error: error?.message ?? 'Error interno', fallback: true }, { status: 200 })
  }
}
