/**
 * API Route: sincronizar productos desde Doblevela a Supabase
 *
 * POST /api/sync-doblevela
 * GET  /api/sync-doblevela
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromDoblevela } from '@/lib/sync-doblevela'
import { doblevelaConfig } from '@/lib/integrations-config'

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('x-cron-secret')
      if (authHeader !== cronSecret) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    if (!doblevelaConfig.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Doblevela no está configurada. Añade DOBLEVELA_SERVICE_URL y DOBLEVELA_API_KEY en .env.local',
        },
        { status: 400 }
      )
    }

    console.log('[sync-doblevela] Iniciando sincronización...')

    const result = await syncProductsFromDoblevela()

    return NextResponse.json(
      {
        success: result.success,
        message: result.success
          ? 'Sincronización de Doblevela completada exitosamente'
          : 'Sincronización de Doblevela completada con errores',
        data: {
          categoriesCreated: result.categoriesCreated,
          categoriesUpdated: result.categoriesUpdated,
          productsCreated: result.productsCreated,
          productsUpdated: result.productsUpdated,
          imagesCreated: result.imagesCreated,
          errors: result.errors,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[sync-doblevela] Error:', error)
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
