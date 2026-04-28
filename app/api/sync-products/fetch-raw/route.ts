/**
 * GET /api/sync-products/fetch-raw
 * Solo descarga los productos crudos de la API de 4Promotional y los devuelve.
 * Diseñado para ejecutarse en menos de 10s (límite de Netlify Functions free).
 * El cliente luego envía estos datos en chunks a /api/sync-products/process-chunk.
 */
import { NextResponse } from 'next/server'
import { getAllProductsFromInventarioApi } from '@/lib/4promotional-api'
import { inventarioApiConfig } from '@/lib/integrations-config'

export async function GET() {
  if (!inventarioApiConfig.isEnabled()) {
    return NextResponse.json(
      { success: false, error: 'API de inventario no configurada' },
      { status: 400 }
    )
  }

  try {
    const startTime = Date.now()
    const products = await getAllProductsFromInventarioApi()
    const elapsed = Date.now() - startTime

    return NextResponse.json({
      success: true,
      totalRawItems: products.length,
      products,
      elapsedMs: elapsed,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
