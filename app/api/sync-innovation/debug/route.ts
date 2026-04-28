/**
 * GET /api/sync-innovation/debug
 * Diagnóstico detallado: prueba ambos endpoints (light y completo) de Innovation Line
 * y muestra exactamente qué responde cada uno.
 */
import { NextResponse } from 'next/server'
import { innovationConfig } from '@/lib/integrations-config'

const ENDPOINTS = {
  light: 'https://1x4nyx8c80.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAll_ProducLight',
  full: 'https://4vumtdis3m.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAllProductos',
  categorias: 'https://l8g7ouqzdh.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAllCategorias',
}

function mask(val: string, show = 6): string {
  if (!val) return '(vacío)'
  if (val.length <= show * 2) return val.substring(0, show) + '…'
  return val.substring(0, show) + '…' + val.substring(val.length - 4)
}

async function probeEndpoint(name: string, baseUrl: string, extraParams: Record<string, string> = {}) {
  const { authToken, user, clave } = innovationConfig
  const qs = new URLSearchParams({ User: user, Clave: clave, ...extraParams })
  const url = `${baseUrl}?${qs.toString()}`

  const startTime = Date.now()
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'auth-token': authToken, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    const elapsed = Date.now() - startTime
    const body = await res.text()
    let parsed: unknown = null
    try { parsed = JSON.parse(body) } catch { /* not json */ }

    // Determinar diagnóstico
    let diagnosis = 'unknown'
    if (parsed && typeof parsed === 'object') {
      const p = parsed as any
      if (p.error) {
        if (String(p.error).toLowerCase().includes('no activo')) diagnosis = 'fuera-de-horario-via-error'
        else if (String(p.error).toLowerCase().includes('credenciales')) diagnosis = 'credenciales-invalidas'
        else diagnosis = `error: ${p.error}`
      } else if (p.respuesta_llave?.response?.Activo === false) {
        diagnosis = `fuera-de-horario: ${p.respuesta_llave.response.Status ?? 'sin estado'}`
      } else if (Array.isArray(p) || p.productos || p.data || p.categorias) {
        const items = Array.isArray(p) ? p : (p.productos || p.data || p.categorias || [])
        diagnosis = `OK — ${items.length} ítems`
      } else {
        diagnosis = `respuesta sin error ni datos`
      }
    } else if (Array.isArray(parsed)) {
      diagnosis = `OK — ${(parsed as any[]).length} ítems (array directo)`
    }

    return {
      endpoint: name,
      httpStatus: res.status,
      responseTimeMs: elapsed,
      bodyPreview: body.substring(0, 250),
      diagnosis,
    }
  } catch (err) {
    return {
      endpoint: name,
      httpStatus: 0,
      responseTimeMs: Date.now() - startTime,
      bodyPreview: '',
      diagnosis: `ERROR: ${err instanceof Error ? err.message : 'desconocido'}`,
    }
  }
}

export async function GET() {
  const { authToken, user, clave } = innovationConfig

  const credentials = {
    authToken: mask(authToken),
    user: mask(user, 10),
    clave: mask(clave),
    isEnabled: innovationConfig.isEnabled(),
  }

  if (!innovationConfig.isEnabled()) {
    return NextResponse.json({
      credentials,
      error: 'No configurado (faltan variables de entorno)',
      timestamp: new Date().toISOString(),
    })
  }

  const now = new Date()
  const cdmxOffset = -6 * 60
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const cdmxMinutes = ((utcMinutes + cdmxOffset) + 24 * 60) % (24 * 60)
  const h = Math.floor(cdmxMinutes / 60)
  const m = cdmxMinutes % 60
  const t = h * 60 + m
  const inWindow1 = t >= 540 && t < 600
  const inWindow2 = t >= 780 && t < 840
  const inWindow3 = t >= 1020 && t < 1080
  const withinHours = inWindow1 || inWindow2 || inWindow3

  // Probar los 3 endpoints en paralelo
  const [lightResult, fullResult, catsResult] = await Promise.all([
    probeEndpoint('GetAll_ProducLight', ENDPOINTS.light),
    probeEndpoint('GetAllProductos (page=1)', ENDPOINTS.full, { page: '1', limit: '100' }),
    probeEndpoint('GetAllCategorias', ENDPOINTS.categorias),
  ])

  return NextResponse.json({
    credentials,
    serverTime: {
      utc: now.toISOString(),
      cdmxHourMinute: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      withinRecommendedWindow: withinHours,
      windows: ['09:00-10:00', '13:00-14:00', '17:00-18:00 (CDMX)'],
    },
    probes: [lightResult, fullResult, catsResult],
    timestamp: new Date().toISOString(),
  })
}
