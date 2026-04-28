/**
 * GET /api/sync-innovation/test
 * Prueba la conexión con el Webservice 3.0 de Innovation Line.
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
  if (!withinHours) {
    return NextResponse.json({
      connection: {
        success: false,
        error: 'Fuera del horario de operación de Innovation Line.',
        hint: 'La API solo opera en estas ventanas (CDMX): 09:00-10:00, 13:00-14:00, 17:00-18:00.',
      },
      timestamp: new Date().toISOString(),
    })
  }

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
      },
      config: { user: innovationConfig.user },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      connection: {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      timestamp: new Date().toISOString(),
    })
  }
}
