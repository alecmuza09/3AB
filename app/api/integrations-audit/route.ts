/**
 * GET /api/integrations-audit
 * Auditoría rápida del estado de cada proveedor.
 * Hace una llamada de prueba pequeña a cada uno y devuelve un resumen.
 */
import { NextResponse } from 'next/server'
import {
  inventarioApiConfig,
  doblevelaConfig,
  innovationConfig,
  promoopcionConfig,
} from '@/lib/integrations-config'

interface ProviderStatus {
  name: string
  configured: boolean
  reachable: boolean
  status: 'ok' | 'blocked-ip' | 'wrong-hours' | 'wrong-credentials' | 'timeout' | 'not-configured' | 'error'
  message: string
  responseTimeMs?: number
}

async function auditServerIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const data = await res.json()
    return data.ip ?? null
  } catch {
    return null
  }
}

async function auditFourPromotional(): Promise<ProviderStatus> {
  const name = '4Promotional'
  if (!inventarioApiConfig.isEnabled()) {
    return { name, configured: false, reachable: false, status: 'not-configured', message: 'INVENTARIO_API_BASE_URL no configurada' }
  }
  const url = `${inventarioApiConfig.baseUrl}/inventario`
  const start = Date.now()
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(inventarioApiConfig.apiKey ? { 'Authorization': `Bearer ${inventarioApiConfig.apiKey}` } : {}),
      },
      signal: AbortSignal.timeout(8000),
    })
    const ms = Date.now() - start
    if (res.ok) {
      return { name, configured: true, reachable: true, status: 'ok', message: 'API responde correctamente', responseTimeMs: ms }
    }
    return { name, configured: true, reachable: true, status: 'error', message: `HTTP ${res.status} ${res.statusText}`, responseTimeMs: ms }
  } catch (err) {
    const ms = Date.now() - start
    const msg = err instanceof Error ? err.message : 'Error de red'
    if ((err as Error).name === 'TimeoutError' || msg.toLowerCase().includes('timeout')) {
      return { name, configured: true, reachable: false, status: 'timeout', message: `Timeout (${ms}ms). Puerto 9090 probablemente bloqueado o API muy lenta.`, responseTimeMs: ms }
    }
    return { name, configured: true, reachable: false, status: 'error', message: msg, responseTimeMs: ms }
  }
}

async function auditDoblevela(): Promise<ProviderStatus> {
  const name = 'Doblevela'
  if (!doblevelaConfig.isEnabled()) {
    return { name, configured: false, reachable: false, status: 'not-configured', message: 'DOBLEVELA_SERVICE_URL/API_KEY no configurados' }
  }
  const url = `${doblevelaConfig.serviceUrl}/GetExistenciaAll?Key=${doblevelaConfig.apiKey}`
  const start = Date.now()
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) })
    const ms = Date.now() - start
    const text = await res.text()
    const xmlMatch = text.match(/<string[^>]*>([\s\S]*?)<\/string>/)
    const jsonStr = xmlMatch ? xmlMatch[1].trim() : text.trim()
    try {
      const parsed = JSON.parse(jsonStr)
      if (parsed.intCodigo === 0) {
        return { name, configured: true, reachable: true, status: 'ok', message: `${parsed.Resultado?.length ?? 0} productos disponibles`, responseTimeMs: ms }
      }
      const apiMsg = parsed.strMensaje || `Código ${parsed.intCodigo}`
      if (apiMsg.toLowerCase().includes('acceso')) {
        return { name, configured: true, reachable: true, status: 'blocked-ip', message: `${apiMsg} — Necesita whitelist de IP de Netlify`, responseTimeMs: ms }
      }
      if (apiMsg.toLowerCase().includes('horario')) {
        return { name, configured: true, reachable: true, status: 'wrong-hours', message: apiMsg, responseTimeMs: ms }
      }
      return { name, configured: true, reachable: true, status: 'error', message: apiMsg, responseTimeMs: ms }
    } catch {
      return { name, configured: true, reachable: true, status: 'error', message: `Respuesta no parseable: ${text.substring(0, 80)}`, responseTimeMs: ms }
    }
  } catch (err) {
    return { name, configured: true, reachable: false, status: 'error', message: err instanceof Error ? err.message : 'Error', responseTimeMs: Date.now() - start }
  }
}

async function auditInnovation(): Promise<ProviderStatus> {
  const name = 'Innovation Line'
  if (!innovationConfig.isEnabled()) {
    return { name, configured: false, reachable: false, status: 'not-configured', message: 'INNOVATION_AUTH_TOKEN/USER/CLAVE no configurados' }
  }
  const start = Date.now()
  try {
    const url = `https://1x4nyx8c80.execute-api.us-east-1.amazonaws.com/default/Innovation_GetAll_ProducLight?User=${encodeURIComponent(innovationConfig.user)}&Clave=${encodeURIComponent(innovationConfig.clave)}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'auth-token': innovationConfig.authToken },
      signal: AbortSignal.timeout(8000),
    })
    const ms = Date.now() - start
    const text = await res.text()
    if (res.status === 403) {
      try {
        const parsed = JSON.parse(text)
        if (parsed?.respuesta_llave?.response?.Status === 'Fuera de horario') {
          return { name, configured: true, reachable: true, status: 'wrong-hours', message: 'Fuera de horario (credenciales OK). Ventanas: 09-10, 13-14, 17-18 CDMX.', responseTimeMs: ms }
        }
        if (parsed?.respuesta_llave?.response?.Correct_Datos === false) {
          return { name, configured: true, reachable: true, status: 'wrong-credentials', message: 'User/Clave incorrectos', responseTimeMs: ms }
        }
      } catch { /* ignore */ }
      return { name, configured: true, reachable: true, status: 'error', message: '403 sin detalle', responseTimeMs: ms }
    }
    if (res.ok) {
      return { name, configured: true, reachable: true, status: 'ok', message: 'API responde correctamente', responseTimeMs: ms }
    }
    return { name, configured: true, reachable: true, status: 'error', message: `HTTP ${res.status}`, responseTimeMs: ms }
  } catch (err) {
    return { name, configured: true, reachable: false, status: 'error', message: err instanceof Error ? err.message : 'Error', responseTimeMs: Date.now() - start }
  }
}

async function auditPromoOpcion(): Promise<ProviderStatus> {
  const name = 'PromoOpción'
  if (!promoopcionConfig.isEnabled()) {
    return { name, configured: false, reachable: false, status: 'not-configured', message: 'PROMOOPCION_USER/API_KEY no configurados' }
  }
  const baseUrl = promoopcionConfig.baseUrl.endsWith('/') ? promoopcionConfig.baseUrl : promoopcionConfig.baseUrl + '/'
  const url = `${baseUrl}existencias`
  const start = Date.now()
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'user': promoopcionConfig.user,
        'x-api-key': promoopcionConfig.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({ demo: promoopcionConfig.demo ? '1' : '0' }).toString(),
      signal: AbortSignal.timeout(8000),
    })
    const ms = Date.now() - start
    if (res.status === 404) {
      return { name, configured: true, reachable: false, status: 'blocked-ip', message: '404 desde Apache: el servidor bloquea por IP. Necesita whitelist de IP de Netlify.', responseTimeMs: ms }
    }
    if (res.ok) {
      const data = await res.json()
      const count = data && typeof data === 'object' ? Object.keys(data).length : 0
      return { name, configured: true, reachable: true, status: 'ok', message: `${count} ítems con stock`, responseTimeMs: ms }
    }
    if (res.status === 401 || res.status === 403) {
      return { name, configured: true, reachable: true, status: 'wrong-credentials', message: `HTTP ${res.status} — verifica USER/API_KEY`, responseTimeMs: ms }
    }
    return { name, configured: true, reachable: true, status: 'error', message: `HTTP ${res.status}`, responseTimeMs: ms }
  } catch (err) {
    return { name, configured: true, reachable: false, status: 'error', message: err instanceof Error ? err.message : 'Error', responseTimeMs: Date.now() - start }
  }
}

export async function GET() {
  const [serverIp, fourP, doble, inno, promoop] = await Promise.all([
    auditServerIp(),
    auditFourPromotional(),
    auditDoblevela(),
    auditInnovation(),
    auditPromoOpcion(),
  ])

  const providers = [fourP, doble, inno, promoop]
  const summary = {
    ok: providers.filter((p) => p.status === 'ok').length,
    blockedByIp: providers.filter((p) => p.status === 'blocked-ip').length,
    wrongHours: providers.filter((p) => p.status === 'wrong-hours').length,
    notConfigured: providers.filter((p) => p.status === 'not-configured').length,
    errors: providers.filter((p) => p.status === 'error' || p.status === 'timeout' || p.status === 'wrong-credentials').length,
  }

  return NextResponse.json({
    serverIp,
    serverIpHint: serverIp
      ? `Esta es la IP saliente desde Netlify. Compártela con Doblevela y PromoOpción para que la agreguen a su whitelist.`
      : null,
    summary,
    providers,
    timestamp: new Date().toISOString(),
  })
}
