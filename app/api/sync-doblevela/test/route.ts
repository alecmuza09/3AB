/**
 * GET /api/sync-doblevela/test
 * Prueba la conexión con el servicio SOAP de Doblevela.
 */
import { NextResponse } from 'next/server'
import { doblevelaConfig } from '@/lib/integrations-config'
import { getAllProductsFromDoblevela } from '@/lib/doblevela-api'

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

  try {
    const startTime = Date.now()
    const products = await getAllProductsFromDoblevela()
    const elapsed = Date.now() - startTime

    return NextResponse.json({
      connection: {
        success: true,
        totalProducts: products.length,
        sampleProduct: products[0]
          ? { Codigo: products[0].Codigo, Descripcion: products[0].Descripcion }
          : null,
        responseTimeMs: elapsed,
      },
      config: { serviceUrl: doblevelaConfig.serviceUrl.substring(0, 40) + '…', hasApiKey: true },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    const fueraDeHorario = msg.toLowerCase().includes('horario') || msg.toLowerCase().includes('permitido')
    return NextResponse.json({
      connection: {
        success: false,
        error: msg,
        hint: fueraDeHorario
          ? 'La API de Doblevela solo opera en horario laboral (L-V, 9am–6pm CDMX).'
          : undefined,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
