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

  // Probar primero una URL pública conocida del mismo servidor para descartar bloqueo por IP
  let serverPublicStatus = 0
  try {
    const pubRes = await fetch('http://www.contenidopromo.com/exportadb.php?ubk=MX', {
      method: 'GET', signal: AbortSignal.timeout(5000)
    })
    serverPublicStatus = pubRes.status
  } catch { serverPublicStatus = -1 }

  if (!promoopcionConfig.isEnabled()) {
    return NextResponse.json({
      credentials,
      serverPublicPageStatus: serverPublicStatus,
      error: 'Integración no configurada (faltan PROMOOPCION_USER o PROMOOPCION_API_KEY)',
      timestamp: new Date().toISOString(),
    })
  }

  // Probar distintas variantes de URL para identificar cuál funciona
  const urlVariants = [
    'http://www.contenidopromo.com/wsds/mx/existencias',
    'http://www.contenidopromo.com/wsds/mx/existencias/',
    'https://www.contenidopromo.com/wsds/mx/existencias/',
    'http://www.contenidopromo.com/wsds/mx/existencias.php',
  ]

  const results: Array<{ url: string; status: number; preview: string }> = []

  for (const variant of urlVariants) {
    try {
      const body = new URLSearchParams({ demo: demo ? '1' : '0' })
      const res = await fetch(variant, {
        method: 'POST',
        headers: {
          'user': user,
          'x-api-key': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: body.toString(),
        signal: AbortSignal.timeout(8000),
      })
      const text = await res.text()
      results.push({ url: variant, status: res.status, preview: text.substring(0, 150) })
      // Si obtuvimos algo que no es 404, parar
      if (res.status !== 404) break
    } catch (e) {
      results.push({ url: variant, status: -1, preview: String(e) })
    }
  }

  return NextResponse.json({
    credentials,
    serverPublicPageStatus: serverPublicStatus,
    diagnosis: serverPublicStatus === 200
      ? 'El servidor responde a URLs públicas — la ruta /wsds/mx/ puede estar bloqueada por IP'
      : serverPublicStatus === 404
      ? 'El servidor no reconoce la URL pública — posible bloqueo total por IP desde Netlify'
      : 'No se pudo conectar al servidor en absoluto',
    urlVariantTests: results,
    timestamp: new Date().toISOString(),
  })
}
