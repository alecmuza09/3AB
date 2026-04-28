/**
 * GET /api/sync-promoopcion/test
 * Prueba la conexión con el Webservice V2 de PromoOpción (modo demo).
 */
import { NextResponse } from 'next/server'
import { promoopcionConfig } from '@/lib/integrations-config'
import { getExistenciasFromPromoOpcion } from '@/lib/promoopcion-api'

export async function GET() {
  if (!promoopcionConfig.isEnabled()) {
    return NextResponse.json({
      connection: {
        success: false,
        error: 'PromoOpción no está configurado. Verifica PROMOOPCION_USER y PROMOOPCION_API_KEY.',
      },
      timestamp: new Date().toISOString(),
    })
  }

  try {
    const startTime = Date.now()
    const existencias = await getExistenciasFromPromoOpcion()
    const elapsed = Date.now() - startTime

    const entries = [...existencias.entries()]
    const sample = entries.slice(0, 3).map(([code, stock]) => ({ code, stock }))
    const withStock = entries.filter(([, s]) => s > 0).length

    return NextResponse.json({
      connection: {
        success: true,
        totalItems: existencias.size,
        withStock,
        sampleItems: sample,
        responseTimeMs: elapsed,
        mode: promoopcionConfig.demo ? 'demo (sin límite)' : 'productivo',
      },
      config: { user: promoopcionConfig.user },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({
      connection: {
        success: false,
        error: msg,
        hint: msg.includes('429') || msg.includes('límite')
          ? 'Límite de consultas excedido. Activa PROMOOPCION_DEMO=1 para pruebas sin límite.'
          : undefined,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
