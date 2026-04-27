/**
 * GET /api/integrations-status
 *
 * Devuelve el estado de las integraciones (habilitado/deshabilitado) sin exponer
 * valores de secretos. Este endpoint es server-side only; los valores de
 * process.env nunca llegan al bundle del cliente.
 */

import { NextResponse } from 'next/server'
import { getIntegrationsStatus } from '@/lib/integrations-config'

export async function GET() {
  const status = getIntegrationsStatus()
  return NextResponse.json({ integrations: status })
}
