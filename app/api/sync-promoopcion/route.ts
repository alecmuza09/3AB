/**
 * API Route: sincronizar productos desde PromoOpción a Supabase
 *
 * POST /api/sync-promoopcion
 * GET  /api/sync-promoopcion
 *
 * Protegido por CRON_SECRET (header x-cron-secret).
 * Llamable manualmente desde el panel de administración.
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromPromoOpcion } from '@/lib/sync-promoopcion'
import { promoopcionConfig } from '@/lib/integrations-config'

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('x-cron-secret')
      if (authHeader !== cronSecret) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    if (!promoopcionConfig.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'PromoOpción no está configurado. Añade PROMOOPCION_USER y PROMOOPCION_API_KEY en las variables de entorno.',
        },
        { status: 400 }
      )
    }

    console.log('[sync-promoopcion] Iniciando sincronización...')

    const result = await syncProductsFromPromoOpcion()

    return NextResponse.json(
      {
        success: result.success,
        message: result.success
          ? 'Sincronización de PromoOpción completada exitosamente'
          : 'Sincronización de PromoOpción completada con errores',
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
    console.error('[sync-promoopcion] Error:', error)
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
