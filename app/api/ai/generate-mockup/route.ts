/**
 * POST /api/ai/generate-mockup
 *
 * Pipeline:
 *   1. Gemini Vision (gemini-2.5-flash) — analiza producto + logo y devuelve un
 *      JSON estructurado con tipo, material, color, estado cerrado/abierto,
 *      tarjeta complementaria y un objeto contextual sugerido.
 *   2. Nano Banana (gemini-2.5-flash-image) — recibe el prompt construido a
 *      partir del template oficial 3A Branding + las dos imágenes (producto y
 *      logo) y genera un mockup fotorrealista de alta gama.
 *   3. Fallbacks: Nano Banana preview, modelos 2.0, Imagen 3 (texto→imagen).
 *
 * Si todo falla, devolvemos analysis + fallback:true para que el cliente haga
 * composición canvas con las coordenadas detectadas.
 *
 * IMPORTANTE: La API REST de Gemini usa camelCase (inlineData / mimeType).
 */

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const VISION_MODEL = 'gemini-2.5-flash'

// Nano Banana family — modelos de generación de imagen, en orden de preferencia
const IMAGE_MODELS = [
  'gemini-2.5-flash-image',          // Nano Banana (estable, principal)
  'gemini-2.5-flash-image-preview',  // Nano Banana (preview, fallback)
  'gemini-3.1-flash-image-preview',  // Nano Banana 2 (si la API key tiene acceso)
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation',
]
const IMAGEN3_MODEL = 'imagen-3.0-generate-001'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MockupAnalysis {
  product: {
    type: string
    material: string
    mainSurface: string
    primaryColor: string           // nombre legible (ej. "negro grafito")
    primaryColorHex: string        // hex aproximado
    hasCurvature: boolean
    curvatureAxis: 'horizontal' | 'vertical' | 'none'
    perspective: 'frontal' | '3quarter' | 'top' | 'angled'
    placementArea: { xPct: number; yPct: number; wPct: number; hPct: number }
    closedStateDescription: string // estado cerrado/exterior
    openStateDescription: string   // estado abierto/interior/detalle
    showsTwoViews: boolean
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
  insertCard: {
    applicable: boolean
    material: string   // ej. "papel mate de algodón", "cartón texturizado"
    color: string      // ej. "blanco", "kraft natural"
  }
  complementaryObject: string  // ej. "una pluma fuente plateada", "" si no aplica
  generationPrompt: string     // prompt final en español listo para Nano Banana
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

// ── Construcción del prompt 3A Branding ──────────────────────────────────────
//
// Plantilla oficial proporcionada para mockups de productos promocionales.
// Los placeholders se rellenan a partir del análisis de Gemini Vision.
function buildBrandingPrompt(a: MockupAnalysis, style: string): string {
  const techniqueMap: Record<string, string> = {
    debossing: 'una sutil y oscura impresión grabada (debossed)',
    laser_engraving: 'un grabado láser preciso',
    serigraphy: 'una impresión serigráfica nítida',
    digital_print: 'una impresión digital de alta resolución',
    embroidery: 'un bordado de alta densidad',
  }
  const techniqueText = techniqueMap[a.application.technique] ?? techniqueMap.debossing

  const styleMap: Record<string, string> = {
    professional:
      'fondo limpio, blanco y aislado, iluminación de estudio suave y uniforme',
    lifestyle:
      'sobre un escritorio de oficina moderno con luz natural cálida, fondo desenfocado',
    flat:
      'vista cenital (flat lay) sobre fondo blanco impecable, iluminación cenital uniforme',
  }
  const styleText = styleMap[style] ?? styleMap.professional

  const productLabel = `${a.product.type}`.trim()
  const materialLabel = a.product.material || 'material premium'
  const colorLabel = a.product.primaryColor || a.product.primaryColorHex || 'color original'

  const closedState = a.product.closedStateDescription || 'cerrado, mostrando su cubierta exterior'
  const openState = a.product.openStateDescription || 'abierto, revelando su interior y detalles funcionales'

  const cardClause = a.insertCard?.applicable
    ? `Como inserto, una tarjeta de visita de ${a.insertCard.material || 'papel premium'} de color ${a.insertCard.color || 'blanco'} está presente, mostrando el logo impreso en sus colores originales.`
    : ''

  const complementaryClause = a.complementaryObject && a.complementaryObject.trim().length > 0
    ? `Un objeto complementario, ${a.complementaryObject}, está presente para dar contexto.`
    : ''

  // Plantilla final — sigue la estructura solicitada
  return [
    `Una fotografía de estudio de producto de alta gama, nítidamente enfocada, que presenta un set de ${productLabel} hecho de ${materialLabel} de color ${colorLabel}, mostrado en dos vistas distintas sobre un ${styleText}.`,
    `Una vista (arriba a la izquierda) muestra el producto en un estado ${closedState}, revelando su textura y costuras precisas. ${techniqueText} del logo proporcionado (incluyendo todo el texto y elementos gráficos) está centrada en una ubicación clave de la cubierta.`,
    `La segunda vista (abajo a la derecha) muestra el producto en un estado ${openState}, revelando detalles clave.`,
    cardClause,
    complementaryClause,
    `Una iluminación de estudio suave y uniforme resalta las texturas y las aplicaciones detalladas del logo. Acabado fotorrealista, calidad comercial 4K, sin marcas de agua, sin texto agregado, sin marcos.`,
  ]
    .filter(Boolean)
    .join(' ')
}

// ── Etapa 1: Análisis de visión ───────────────────────────────────────────────

async function analyzeImages(
  apiKey: string,
  productMime: string, productData: string,
  logoMime: string, logoData: string,
  productName: string, style: string,
): Promise<MockupAnalysis | null> {

  const styleNote = style === 'lifestyle'
    ? 'lifestyle photography on a modern office desk with natural light'
    : style === 'flat'
    ? 'flat lay top-down view on a clean white surface'
    : 'high-end studio product photography on a clean isolated white background'

  const prompt = `You are an expert product mockup designer and photographer for a Mexican branding agency (3A Branding).
Analyze the TWO images provided:
- Image 1: product called "${productName}"
- Image 2: brand logo

Return ONLY a valid JSON object (no markdown fences, no explanation). Use this EXACT schema:
{
  "product": {
    "type": "<short product noun phrase in Spanish, e.g. 'libreta de viaje', 'taza cerámica', 'pluma metálica', 'mochila ejecutiva'>",
    "material": "<main material in Spanish, e.g. 'piel sintética premium', 'cerámica esmaltada', 'aluminio cepillado'>",
    "mainSurface": "<one short Spanish sentence describing the main printable surface>",
    "primaryColor": "<dominant color name in Spanish, e.g. 'negro grafito', 'azul marino'>",
    "primaryColorHex": "<dominant hex color of the product, e.g. '#1A1A1A'>",
    "hasCurvature": <boolean>,
    "curvatureAxis": "<horizontal|vertical|none>",
    "perspective": "<frontal|3quarter|top|angled>",
    "placementArea": {
      "xPct": <center X of best logo area as % of image width, 0-100>,
      "yPct": <center Y of best logo area as % of image height, 0-100>,
      "wPct": <width of placement zone as % of image width>,
      "hPct": <height of placement zone as % of image height>
    },
    "closedStateDescription": "<Spanish phrase describing the CLOSED / EXTERIOR view of this product, e.g. 'cerrado, mostrando su cubierta de piel con costuras visibles', 'tapado, exhibiendo su superficie esmaltada uniforme'>",
    "openStateDescription": "<Spanish phrase describing the OPEN / INTERIOR / DETAIL view of this product, e.g. 'abierto, revelando sus compartimentos interiores y bolsillos', 'destapado, mostrando el interior pulido y la boquilla'>",
    "showsTwoViews": <true if it makes sense to show this product in two views, false for very simple products like single-piece pens or buttons>
  },
  "logo": {
    "hasBackground": <true if logo has solid/colored background>,
    "primaryColor": "<dominant hex color of logo graphics>",
    "style": "<icon_only|text_only|icon_and_text|complex>",
    "recommendedSizePct": <logo width as % of product width, 15-45>
  },
  "application": {
    "technique": "<serigraphy|digital_print|laser_engraving|embroidery|debossing — pick the most natural for this material>",
    "logoColorAdjustment": "<short Spanish instruction, e.g. 'usar logo en blanco sobre producto oscuro', 'colores originales del logo'>",
    "blendMode": "<normal|multiply|screen|overlay>",
    "opacity": <0.7-1.0>,
    "perspectiveSkew": <true if logo needs perspective distortion>
  },
  "insertCard": {
    "applicable": <true ONLY if a complementary business card insert would naturally accompany this product (e.g. notebooks, leather goods, gift sets); false for mugs, pens alone, umbrellas, etc.>,
    "material": "<Spanish material name for the card if applicable, e.g. 'papel mate de algodón', 'cartón texturizado kraft'>",
    "color": "<Spanish color name for the card, e.g. 'blanco hueso', 'kraft natural'>"
  },
  "complementaryObject": "<Spanish description of ONE small contextual object that fits this product category, e.g. 'una pluma fuente plateada', 'unos granos de café tostado', 'unas hojas de menta fresca'. Empty string '' if no object adds value.>",
  "generationPrompt": "<placeholder; will be replaced by server. Output empty string ''>"
}

Rules:
- Be precise and visually accurate. Look carefully at the product image to determine its real material, color and shape.
- Pick a technique that matches the material (debossing/laser for leather/metal/wood, serigraphy/digital_print for ceramic/plastic/textile, embroidery for textile bags/caps).
- Photography style context: ${styleNote}.`

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
        generationConfig: { temperature: 0.15, maxOutputTokens: 1500 },
      }),
      signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json()
    if (!res.ok) { console.error('[mockup/analysis] error:', data?.error?.message); return null }

    let raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const analysis: MockupAnalysis = JSON.parse(raw)

    // Construir el prompt final con el template oficial 3A Branding
    analysis.generationPrompt = buildBrandingPrompt(analysis, style)

    console.log(
      '[mockup/analysis] OK →',
      analysis.product.type,
      '|', analysis.application.technique,
      '| insertCard:', analysis.insertCard?.applicable,
    )
    return analysis
  } catch (e: any) {
    console.error('[mockup/analysis] parse/fetch:', e?.message)
    return null
  }
}

// ── Etapa 2: Nano Banana (gemini-2.5-flash-image) ────────────────────────────

async function tryNanoBanana(
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

  // Si tenemos análisis, usamos el prompt construido con la plantilla 3A.
  // Si no, usamos un prompt mínimo en inglés como respaldo.
  const finalPrompt = analysis?.generationPrompt
    ? `${analysis.generationPrompt}

INSTRUCTIONS:
- Apply the brand logo from the provided reference image onto the product surface using the technique described (it must look physically applied: debossed/printed/engraved/embroidered, NOT floating).
- Preserve the logo's exact shapes, text and proportions — do not redraw or invent letters.
- ${analysis.application.logoColorAdjustment}
- Final output: photorealistic, commercial-grade mockup. No watermark, no extra text, no frame.`
    : `Photorealistic high-end product mockup of "${productName}" with the brand logo from the second image physically applied onto the product surface. ${styleMap[style] ?? styleMap.professional}. No watermark, no extra text.`

  for (const model of IMAGE_MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: finalPrompt },
              inlineImg(productMime, productData),
              inlineImg(logoMime, logoData),
            ],
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.4,
          },
        }),
        signal: AbortSignal.timeout(90_000),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error?.message ?? `HTTP ${res.status}`
        console.warn(`[mockup/nano-banana] ${model}: ${msg.slice(0, 160)}`)
        continue
      }
      const parts: any[] = data?.candidates?.[0]?.content?.parts ?? []
      const img = parts.find(
        (p: any) => p.inlineData?.data && p.inlineData?.mimeType?.startsWith('image/')
      )
      if (!img) {
        console.warn(`[mockup/nano-banana] ${model} no devolvió imagen`)
        continue
      }
      console.log(`[mockup/nano-banana] OK con ${model}`)
      return {
        imageBase64: img.inlineData.data,
        mimeType: img.inlineData.mimeType,
        model,
      }
    } catch (e: any) {
      console.error(`[mockup/nano-banana] ${model}:`, e?.message)
    }
  }
  return null
}

// ── Etapa 3: Imagen 3 — generación texto→imagen (último recurso IA) ──────────

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

  const fullPrompt = `${analysis.generationPrompt} ${styleMap[style] ?? styleMap.professional}. Photorealistic, high resolution, commercial quality product mockup.`

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

    const {
      productImageUrl,
      logoBase64,
      productName = 'producto promocional',
      style = 'professional',
    } = await request.json()

    if (!productImageUrl || !logoBase64) {
      return NextResponse.json(
        { success: false, error: 'Faltan productImageUrl o logoBase64' },
        { status: 400 },
      )
    }

    // Descargar imagen del producto
    let productData: string, productMime: string
    try {
      const r = await urlToBase64(productImageUrl)
      productData = r.data; productMime = r.mimeType
      if (productMime === 'image/svg+xml') {
        return NextResponse.json({
          success: false,
          error: 'Imagen SVG no compatible; usa PNG/JPEG.',
          fallback: true,
        })
      }
    } catch (e: any) {
      return NextResponse.json({
        success: false,
        error: `No se pudo descargar la imagen: ${e?.message}`,
        fallback: true,
      })
    }

    const { data: logoData, mimeType: logoMime } = parseLogoDataUrl(logoBase64)

    // ── Etapa 1: Análisis ────────────────────────────────────────────
    const analysis = await analyzeImages(
      apiKey,
      productMime, productData,
      logoMime, logoData,
      productName, style,
    )

    // ── Etapa 2: Nano Banana ─────────────────────────────────────────
    const nanoResult = await tryNanoBanana(
      apiKey,
      analysis,
      productMime, productData,
      logoMime, logoData,
      productName, style,
    )
    if (nanoResult) {
      return NextResponse.json({
        success: true,
        ...nanoResult,
        analysis,
        stage: 'nano-banana',
      })
    }

    // ── Etapa 3: Imagen 3 (último recurso IA) ────────────────────────
    const imagen3Result = await tryImagen3(apiKey, analysis, productName, style)
    if (imagen3Result) {
      return NextResponse.json({
        success: true,
        ...imagen3Result,
        analysis,
        stage: 'imagen3',
      })
    }

    // ── Fallback canvas ──────────────────────────────────────────────
    console.warn('[generate-mockup] Todas las etapas IA fallaron → canvas en cliente')
    return NextResponse.json({
      success: false,
      error: 'Modelos IA no disponibles con esta API key.',
      fallback: true,
      analysis,
    })

  } catch (error: any) {
    console.error('[generate-mockup] Error interno:', error?.message)
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Error interno', fallback: true },
      { status: 200 },
    )
  }
}
