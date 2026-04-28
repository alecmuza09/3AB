/**
 * GET /api/sync-innovation/test
 * Prueba la conexión con el Webservice 3.0 de Innovation Line.
 * Solo advierte (no bloquea) si estamos fuera de las ventanas horarias recomendadas.
 */
import { NextResponse } from 'next/server'
import { innovationConfig } from '@/lib/integrations-config'
import { getAllProductsLightFromInnovation, isWithinInnovationHours } from '@/lib/innovation-api'

export async function GET() {
  if (!innovationConfig.isEnabled()) {
    return NextResponse.json({
      connection: {
        success: false,
        error: 'Innovation Line no está configurado. Verifica INNOVATION_AUTH_TOKEN, INNOVATION_USER y INNOVATION_CLAVE.',
      },
      timestamp: new Date().toISOString(),
    })
  }

  const withinHours = isWithinInnovationHours()

  try {
    const startTime = Date.now()
    const products = await getAllProductsLightFromInnovation()
    const elapsed = Date.now() - startTime

    return NextResponse.json({
      connection: {
        success: true,
        totalProducts: products.length,
        sampleProduct: products[0] ?? null,
        responseTimeMs: elapsed,
        withinRecommendedHours: withinHours,
        note: withinHours ? undefined : 'Fuera de ventana horaria recomendada (09-10, 13-14, 17-18 CDMX), pero la API respondió correctamente.',
      },
      config: { user: innovationConfig.user },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    const esHorario = msg.toLowerCase().includes('horario') || msg.toLowerCase().includes('fuera de')
    return NextResponse.json({
      connection: {
        success: false,
        error: msg,
        withinRecommendedHours: withinHours,
        hint: esHorario
          ? 'La API de Innovation Line bloqueó la petición por horario. Intenta en la próxima ventana: 13:00-14:00 CDMX.'
          : undefined,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
