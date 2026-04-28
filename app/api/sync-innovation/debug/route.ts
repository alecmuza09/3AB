/**
 * GET /api/sync-innovation/debug
 * Diagnóstico detallado: muestra credenciales (enmascaradas) y respuesta cruda de la API.
 */
import { NextResponse } from 'next/server'
import { innovationConfig } from '@/lib/integrations-config'

const LIGHT_ENDPOINT = 'https://1x4nyx8c80.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAll_ProducLight'

function mask(val: string, show = 6): string {
  if (!val) return '(vacío)'
  if (val.length <= show * 2) return val.substring(0, show) + '…'
  return val.substring(0, show) + '…' + val.substring(val.length - 4)
}

export async function GET() {
  const { authToken, user, clave } = innovationConfig

  const credentials = {
    authToken: mask(authToken),
    authTokenLength: authToken.length,
    user: mask(user, 10),
    userLength: user.length,
    clave: mask(clave),
    claveLength: clave.length,
    isEnabled: innovationConfig.isEnabled(),
  }

  if (!innovationConfig.isEnabled()) {
    return NextResponse.json({
      credentials,
      error: 'Integración no configurada (faltan variables de entorno)',
      timestamp: new Date().toISOString(),
    })
  }

  // Construir URL exacta que se enviará
  const qs = new URLSearchParams({ User: user, Clave: clave })
  const url = `${LIGHT_ENDPOINT}?${qs.toString()}`

  let httpStatus = 0
  let rawBody = ''
  let responseHeaders: Record<string, string> = {}

  try {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'auth-token': authToken,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(tid)

    httpStatus = res.status
    rawBody = await res.text()
    res.headers.forEach((v, k) => { responseHeaders[k] = v })
  } catch (err) {
    return NextResponse.json({
      credentials,
      urlCalled: url.replace(clave, mask(clave)).replace(encodeURIComponent(clave), mask(clave)),
      error: err instanceof Error ? err.message : 'Error de red',
      timestamp: new Date().toISOString(),
    })
  }

  // Parsear si es JSON
  let parsed: unknown = null
  try { parsed = JSON.parse(rawBody) } catch { /* no es JSON */ }

  return NextResponse.json({
    credentials,
    urlCalled: `${LIGHT_ENDPOINT}?User=${mask(user, 10)}&Clave=${mask(clave)}`,
    httpStatus,
    rawBodyPreview: rawBody.substring(0, 500),
    parsedResponse: parsed,
    responseHeaders,
    timestamp: new Date().toISOString(),
  })
}
