/**
 * API Route: sincronizar productos desde 3A Promoción (GraphQL) a Supabase
 *
 * POST /api/sync-promocion
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromPromocionApi } from '@/lib/sync-promocion'
import { promocionConfig } from '@/lib/integrations-config'

export async function POST(request: NextRequest) {
  try {
    if (!promocionConfig.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            '3A Promoción no está configurada. Añade PROMOCION_GRAPHQL_URL, PROMOCION_EMAIL y PROMOCION_PASSWORD en .env.local',
        },
        { status: 400 }
      )
    }

    const result = await syncProductsFromPromocionApi()

    return NextResponse.json(
      {
        success: result.success,
        message: result.success ? 'Sincronización completada' : 'Sincronización completada con errores',
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
    console.error('Error en sync-promocion:', error)
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
