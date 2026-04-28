/**
 * API Route: sincronizar productos desde Innovation Line a Supabase
 *
 * POST /api/sync-innovation
 * GET  /api/sync-innovation
 *
 * Protegido por CRON_SECRET (header x-cron-secret).
 * También se puede llamar sin CRON_SECRET para uso manual desde el admin.
 *
 * Nota: La API de Innovation Line solo opera en ventanas horarias (hora CDMX):
 *   09:00-10:00  |  13:00-14:00  |  17:00-18:00
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromInnovation } from '@/lib/sync-innovation'
import { innovationConfig } from '@/lib/integrations-config'

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('x-cron-secret')
      if (authHeader !== cronSecret) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    if (!innovationConfig.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Innovation Line no está configurado. Añade INNOVATION_AUTH_TOKEN, INNOVATION_USER y INNOVATION_CLAVE en las variables de entorno.',
        },
        { status: 400 }
      )
    }

    console.log('[sync-innovation] Iniciando sincronización...')

    const result = await syncProductsFromInnovation()

    return NextResponse.json(
      {
        success: result.success,
        message: result.success
          ? 'Sincronización de Innovation Line completada exitosamente'
          : 'Sincronización de Innovation Line completada con errores',
        data: {
          categoriesCreated: result.categoriesCreated,
          categoriesUpdated: result.categoriesUpdated,
          productsCreated: result.productsCreated,
          productsUpdated: result.productsUpdated,
          variationsCreated: result.variationsCreated,
          variationsUpdated: result.variationsUpdated,
          imagesCreated: result.imagesCreated,
          errors: result.errors,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[sync-innovation] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
