/**
 * POST /api/ai/generate-mockup
 *
 * Pipeline de 3 etapas:
 *   1. Gemini Vision (gemini-2.5-flash) — analiza producto + logo → JSON estructurado
 *      con tipo, material, área de placement, perspectiva, técnica y prompt a medida.
 *   2. Gemini Image Generation — intenta generar mockup con imagen de entrada.
 *   3. Imagen 3 (imagen-3.0-generate-001) — si la etapa 2 falla, genera un mockup
 *      fotorrealista a partir del prompt de texto generado en la etapa 1.
 *
 * Si todas las etapas IA fallan, devuelve analysis + fallback:true para que el
 * cliente haga composición canvas inteligente.
 *
 * IMPORTANTE: La API REST de Gemini usa camelCase (inlineData / mimeType).
 */

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const VISION_MODEL  = 'gemini-2.5-flash'
const IMAGE_MODELS  = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-exp',
]
const IMAGEN3_MODEL = 'imagen-3.0-generate-001'

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
    placementArea: { xPct: number; yPct: number; wPct: number; hPct: number }
  }
  logo: {
    hasBackground: boolean
    primaryColor: string
    style: 'icon_only' | 'text_only' | 'icon_and_text' | 'complex'
    recommendedSizePct: number
  }
  application: {
    technique: 'serigraphy' | 'digital_print' | 'laser_engraving' | 'embroidery' | 'debossing'
    logoColorAdjustment: string
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
    opacity: number
    perspectiveSkew: boolean
  }
  generationPrompt: string
}

// ── Utilidades ────────────────────────────────────────────────────────────────

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(12_000),
    headers: { 'User-Agent': 'Mozilla/5.0 3ABranding/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar imagen`)
  const buf = await res.arrayBuffer()
  const ct = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim()
  return { data: Buffer.from(buf).toString('base64'), mimeType: ct }
}

function parseLogoDataUrl(input: string): { data: string; mimeType: string } {
  const m = input.match(/^data:([^;]+);base64,(.+)$/)
  return m ? { mimeType: m[1], data: m[2] } : { mimeType: 'image/png', data: input }
}

// camelCase obligatorio en Gemini REST API
const inlineImg = (mimeType: string, data: string) => ({ inlineData: { mimeType, data } })

// ── Etapa 1: Análisis de visión ───────────────────────────────────────────────

async function analyzeImages(
  apiKey: string,
  productMime: string, productData: string,
  logoMime: string, logoData: string,
  productName: string, style: string,
): Promise<MockupAnalysis | null> {

  const styleNote = style === 'lifestyle'
    ? 'lifestyle photography in modern office, natural light'
    : style === 'flat'
    ? 'flat lay top-down view on white surface'
    : 'professional product photography on neutral background with soft shadows'

  const prompt = `You are an expert product mockup designer and photographer.
Analyze the TWO images provided:
- Image 1: product called "${productName}"
- Image 2: brand logo

Return ONLY a valid JSON object (no markdown, no explanation). Use this EXACT schema:
{
  "product": {
    "type": "<e.g. Swiss Army knife, ceramic mug, cotton tote bag>",
    "material": "<main material>",
    "mainSurface": "<one sentence describing the main printable surface>",
    "primaryColor": "<dominant hex color>",
    "hasCurvature": <boolean>,
    "curvatureAxis": "<horizontal|vertical|none>",
    "perspective": "<frontal|3quarter|top|angled>",
    "placementArea": {
      "xPct": <center X of best logo area as % of image width, 0-100>,
      "yPct": <center Y of best logo area as % of image height, 0-100>,
      "wPct": <width of placement zone as % of image width>,
      "hPct": <height of placement zone as % of image height>
    }
  },
  "logo": {
    "hasBackground": <true if logo has solid/colored background>,
    "primaryColor": "<dominant hex color of logo graphics>",
    "style": "<icon_only|text_only|icon_and_text|complex>",
    "recommendedSizePct": <logo width as % of product width, 15-45>
  },
  "application": {
    "technique": "<serigraphy|digital_print|laser_engraving|embroidery|debossing>",
    "logoColorAdjustment": "<e.g. 'use white logo on dark product', 'original colors'>",
    "blendMode": "<normal|multiply|screen|overlay>",
    "opacity": <0.7-1.0>,
    "perspectiveSkew": <true if logo needs perspective distortion>
  },
  "generationPrompt": "<120-word English prompt for a text-to-image model to generate a photorealistic mockup. Include: exact product type, material, color, logo placement location on product surface, printing technique (${styleNote}), the logo design described visually, lighting, camera angle. Do NOT use the word 'logo' — describe the printed/engraved mark visually.>"
}`

  try {
    const res = await fetch(`${GEMINI_BASE}/${VISION_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            inlineImg(productMime, productData),
            inlineImg(logoMime, logoData),
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
      }),
      signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json()
    if (!res.ok) { console.error('[mockup/analysis] error:', data?.error?.message); return null }

    let raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const analysis: MockupAnalysis = JSON.parse(raw)
    console.log('[mockup/analysis] OK →', analysis.product.type, '|', analysis.application.technique)
    return analysis
  } catch (e: any) {
    console.error('[mockup/analysis] parse/fetch:', e?.message)
    return null
  }
}

// ── Etapa 2: Gemini image generation (imagen entrada → imagen salida) ─────────

async function tryGeminiImageGen(
  apiKey: string,
  analysis: MockupAnalysis | null,
  productMime: string, productData: string,
  logoMime: string, logoData: string,
  productName: string, style: string,
): Promise<{ imageBase64: string; mimeType: string; model: string } | null> {

  const styleMap: Record<string, string> = {
    professional: 'professional product photography on neutral studio background with soft shadows',
    lifestyle: 'lifestyle photography in a modern office or workspace, natural light',
    flat: 'flat lay top-down view on clean white surface',
  }

  const prompt = `${analysis?.generationPrompt ?? `Photorealistic mockup of "${productName}" with brand logo applied on its main surface.`}

RULES:
- Logo physically applied to product surface (imprinted/printed/engraved), NOT floating
- Product color: ${analysis?.product.primaryColor ?? 'original'}, material: ${analysis?.product.material ?? 'original'}
- Technique: ${analysis?.application.technique ?? 'digital print'}
- ${analysis?.application.logoColorAdjustment ?? 'Use logo colors naturally'}
- Photography style: ${styleMap[style] ?? styleMap.professional}
- Output only the product image, no text, no frame`

  for (const model of IMAGE_MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              inlineImg(productMime, productData),
              inlineImg(logoMime, logoData),
            ],
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'], temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(90_000),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error?.message ?? `HTTP ${res.status}`
        console.warn(`[mockup/gemini-img] ${model}: ${msg.slice(0, 120)}`)
        continue
      }
      const parts: any[] = data?.candidates?.[0]?.content?.parts ?? []
      const img = parts.find((p: any) => p.inlineData?.data && p.inlineData?.mimeType?.startsWith('image/'))
      if (!img) { console.warn(`[mockup/gemini-img] ${model} no devolvió imagen`); continue }
      return { imageBase64: img.inlineData.data, mimeType: img.inlineData.mimeType, model }
    } catch (e: any) {
      console.error(`[mockup/gemini-img] ${model}:`, e?.message)
    }
  }
  return null
}

// ── Etapa 3: Imagen 3 — generación texto→imagen ───────────────────────────────

async function tryImagen3(
  apiKey: string,
  analysis: MockupAnalysis | null,
  productName: string,
  style: string,
): Promise<{ imageBase64: string; mimeType: string; model: string } | null> {

  if (!analysis?.generationPrompt) {
    console.warn('[mockup/imagen3] Sin analysis.generationPrompt, saltando')
    return null
  }

  const styleMap: Record<string, string> = {
    professional: 'Professional product photography, neutral white/grey background, studio lighting, soft shadows, 4K quality',
    lifestyle: 'Lifestyle product photography in a modern office setting, natural window light, shallow depth of field',
    flat: 'Flat lay product photography, overhead view, clean white background, minimal composition',
  }

  const fullPrompt = `${analysis.generationPrompt}. ${styleMap[style] ?? styleMap.professional}. Photorealistic, high resolution, commercial quality product mockup.`

  console.log('[mockup/imagen3] Prompt:', fullPrompt.slice(0, 200))

  try {
    const res = await fetch(`${GEMINI_BASE}/${IMAGEN3_MODEL}:predict?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: fullPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          personGeneration: 'dont_allow',
          safetySetting: 'block_some',
        },
      }),
      signal: AbortSignal.timeout(60_000),
    })
    const data = await res.json()
    if (!res.ok) {
      console.warn('[mockup/imagen3] Error:', data?.error?.message ?? res.status)
      return null
    }
    const pred = data?.predictions?.[0]
    if (!pred?.bytesBase64Encoded) {
      console.warn('[mockup/imagen3] Sin imagen en respuesta:', JSON.stringify(data).slice(0, 300))
      return null
    }
    console.log('[mockup/imagen3] Imagen generada OK')
    return {
      imageBase64: pred.bytesBase64Encoded,
      mimeType: pred.mimeType ?? 'image/png',
      model: IMAGEN3_MODEL,
    }
  } catch (e: any) {
    console.error('[mockup/imagen3]', e?.message)
    return null
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
    }

    const { productImageUrl, logoBase64, productName = 'producto promocional', style = 'professional' } = await request.json()

    if (!productImageUrl || !logoBase64) {
      return NextResponse.json({ success: false, error: 'Faltan productImageUrl o logoBase64' }, { status: 400 })
    }

    // Descargar imagen del producto
    let productData: string, productMime: string
    try {
      const r = await urlToBase64(productImageUrl)
      productData = r.data; productMime = r.mimeType
      if (productMime === 'image/svg+xml') {
        return NextResponse.json({ success: false, error: 'Imagen SVG no compatible; usa PNG/JPEG.', fallback: true })
      }
    } catch (e: any) {
      return NextResponse.json({ success: false, error: `No se pudo descargar la imagen: ${e?.message}`, fallback: true })
    }

    const { data: logoData, mimeType: logoMime } = parseLogoDataUrl(logoBase64)

    // ── Etapa 1: Análisis ────────────────────────────────────────────
    const analysis = await analyzeImages(apiKey, productMime, productData, logoMime, logoData, productName, style)

    // ── Etapa 2: Gemini imagen ───────────────────────────────────────
    const geminiResult = await tryGeminiImageGen(apiKey, analysis, productMime, productData, logoMime, logoData, productName, style)
    if (geminiResult) {
      return NextResponse.json({ success: true, ...geminiResult, analysis, stage: 'gemini-image-gen' })
    }

    // ── Etapa 3: Imagen 3 ────────────────────────────────────────────
    const imagen3Result = await tryImagen3(apiKey, analysis, productName, style)
    if (imagen3Result) {
      return NextResponse.json({ success: true, ...imagen3Result, analysis, stage: 'imagen3' })
    }

    // ── Fallback canvas ──────────────────────────────────────────────
    console.warn('[generate-mockup] Todas las etapas IA fallaron → canvas en cliente')
    return NextResponse.json({ success: false, error: 'Modelos IA no disponibles con esta API key.', fallback: true, analysis })

  } catch (error: any) {
    console.error('[generate-mockup] Error interno:', error?.message)
    return NextResponse.json({ success: false, error: error?.message ?? 'Error interno', fallback: true }, { status: 200 })
  }
}
