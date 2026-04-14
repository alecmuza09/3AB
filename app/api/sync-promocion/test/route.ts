/**
 * GET /api/sync-promocion/test
 *
 * Prueba la conexión con la API de 3A Promoción y devuelve información de diagnóstico.
 * Solo accesible con CRON_SECRET o en modo desarrollo.
 */

import { NextRequest, NextResponse } from 'next/server'
import { testPromocionConnection, introspectPromocionApi } from '@/lib/promocion-api'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('x-cron-secret')
    if (authHeader !== cronSecret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const [connectionTest, schemaInfo] = await Promise.allSettled([
    testPromocionConnection(),
    introspectPromocionApi(),
  ])

  return NextResponse.json({
    connection: connectionTest.status === 'fulfilled' ? connectionTest.value : { error: String(connectionTest.reason) },
    schema: schemaInfo.status === 'fulfilled' ? schemaInfo.value : { error: String(schemaInfo.reason) },
    timestamp: new Date().toISOString(),
  })
}
