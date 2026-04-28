/**
 * GET /api/sync-doblevela/test
 *
 * Prueba la conexión con el servicio SOAP de Doblevela.
 * También devuelve la IP pública saliente del servidor para diagnóstico de IP-whitelist.
 */
import { NextResponse } from 'next/server'
import { doblevelaConfig } from '@/lib/integrations-config'

export async function GET() {
  if (!doblevelaConfig.isEnabled()) {
    return NextResponse.json({
      connection: {
        success: false,
        error: 'Doblevela no está configurado. Verifica DOBLEVELA_SERVICE_URL y DOBLEVELA_API_KEY.',
      },
      config: { hasServiceUrl: !!doblevelaConfig.serviceUrl, hasApiKey: !!doblevelaConfig.apiKey },
      timestamp: new Date().toISOString(),
    })
  }

  // Obtener IP pública saliente del servidor para diagnóstico
  let serverIp: string | null = null
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) })
    if (ipRes.ok) {
      const ipData = await ipRes.json()
      serverIp = ipData.ip ?? null
    }
  } catch {
    // No bloquear si ipify no responde
  }

  try {
    const startTime = Date.now()

    // Llamada directa al endpoint para obtener la respuesta cruda y el JSON
    const qs = new URLSearchParams({ Key: doblevelaConfig.apiKey })
    const url = `${doblevelaConfig.serviceUrl}/GetExistenciaAll?${qs.toString()}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    let rawText = ''
    let httpStatus = 0
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json, text/xml' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      httpStatus = response.status
      rawText = await response.text()
    } catch (fetchErr) {
      clearTimeout(timeoutId)
      const msg = fetchErr instanceof Error ? fetchErr.message : 'Error de red'
      return NextResponse.json({
        connection: { success: false, error: msg, serverIp },
        timestamp: new Date().toISOString(),
      })
    }

    const elapsed = Date.now() - startTime

    // Extraer JSON del body (puede venir envuelto en XML)
    let jsonStr = rawText
    const xmlMatch = rawText.match(/<string[^>]*>([\s\S]*?)<\/string>/)
    if (xmlMatch) jsonStr = xmlMatch[1].trim()

    let parsed: { intCodigo?: number; strMensaje?: string; Resultado?: unknown[] } = {}
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({
        connection: {
          success: false,
          error: `Respuesta no es JSON válido (HTTP ${httpStatus})`,
          rawPreview: rawText.substring(0, 300),
          serverIp,
        },
        timestamp: new Date().toISOString(),
      })
    }

    if (parsed.intCodigo !== 0) {
      const msg = parsed.strMensaje || `Error código ${parsed.intCodigo}`
      const esAcceso = msg.toLowerCase().includes('acceso no permitido')
      return NextResponse.json({
        connection: {
          success: false,
          error: msg,
          serverIp,
          hint: esAcceso
            ? `La API rechaza IPs no registradas. IP autorizada en contrato: 35.215.119.244. IP actual del servidor: ${serverIp ?? 'desconocida'}. Contacta a Doblevela para actualizar la whitelist.`
            : undefined,
        },
        timestamp: new Date().toISOString(),
      })
    }

    const productos = Array.isArray(parsed.Resultado) ? parsed.Resultado : []
    const primer = (productos[0] as { Codigo?: string; Descripcion?: string } | undefined) ?? null

    return NextResponse.json({
      connection: {
        success: true,
        totalProducts: productos.length,
        sampleProduct: primer ? { Codigo: primer.Codigo, Descripcion: primer.Descripcion } : null,
        responseTimeMs: elapsed,
        serverIp,
      },
      config: { serviceUrl: doblevelaConfig.serviceUrl.substring(0, 50) + '…', hasApiKey: true },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      connection: {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        serverIp,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
