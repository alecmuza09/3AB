/**
 * GET /api/sync-promoopcion/debug
 * Diagnóstico: muestra credenciales (enmascaradas), URL exacta y respuesta cruda de la API.
 */
import { NextResponse } from 'next/server'
import { promoopcionConfig } from '@/lib/integrations-config'

function mask(val: string, show = 6): string {
  if (!val) return '(vacío)'
  if (val.length <= show * 2) return val.substring(0, show) + '…'
  return val.substring(0, show) + '…' + val.substring(val.length - 4)
}

export async function GET() {
  const { baseUrl, user, apiKey, demo } = promoopcionConfig

  // Normalizar base URL
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
  const testUrl = `${normalizedBase}existencias/`

  const credentials = {
    baseUrl: normalizedBase,
    user: mask(user, 10),
    apiKey: mask(apiKey),
    demo,
    isEnabled: promoopcionConfig.isEnabled(),
  }

  if (!promoopcionConfig.isEnabled()) {
    return NextResponse.json({
      credentials,
      error: 'Integración no configurada (faltan PROMOOPCION_USER o PROMOOPCION_API_KEY)',
      timestamp: new Date().toISOString(),
    })
  }

  let httpStatus = 0
  let rawBody = ''
  let responseHeaders: Record<string, string> = {}

  try {
    const body = new URLSearchParams({ demo: demo ? '1' : '0' })
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'user': user,
        'x-api-key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': '3ABranding/1.0',
      },
      body: body.toString(),
      signal: controller.signal,
    })
    clearTimeout(tid)

    httpStatus = res.status
    rawBody = await res.text()
    res.headers.forEach((v, k) => { responseHeaders[k] = v })
  } catch (err) {
    return NextResponse.json({
      credentials,
      urlCalled: testUrl,
      error: err instanceof Error ? err.message : 'Error de red',
      timestamp: new Date().toISOString(),
    })
  }

  let parsed: unknown = null
  try { parsed = JSON.parse(rawBody) } catch { /* no es JSON */ }

  // Para existencias (objeto grande), solo mostrar resumen
  const summary = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? { totalKeys: Object.keys(parsed as object).length, sample: Object.entries(parsed as object).slice(0, 3) }
    : null

  return NextResponse.json({
    credentials,
    urlCalled: testUrl,
    httpStatus,
    rawBodyPreview: rawBody.substring(0, 300),
    responseSummary: summary,
    responseHeaders,
    timestamp: new Date().toISOString(),
  })
}
