/**
 * GET /api/sync-products/test
 *
 * Prueba la conexión con la API de 4Promotional y devuelve información de diagnóstico.
 * Solo accesible con CRON_SECRET o en modo desarrollo.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllProductsFromInventarioApi, groupInventarioProductsByArticle } from '@/lib/4promotional-api'
import { inventarioApiConfig } from '@/lib/integrations-config'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('x-cron-secret')
    if (authHeader !== cronSecret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  if (!inventarioApiConfig.isEnabled()) {
    return NextResponse.json({
      connection: {
        success: false,
        error: 'API de inventario no configurada. Verifica INVENTARIO_API_URL en las variables de entorno.',
      },
      config: {
        baseUrl: inventarioApiConfig.baseUrl || '(no configurada)',
        hasApiKey: !!inventarioApiConfig.apiKey,
      },
      timestamp: new Date().toISOString(),
    })
  }

  try {
    const startTime = Date.now()
    const rawProducts = await getAllProductsFromInventarioApi()
    const elapsed = Date.now() - startTime

    if (rawProducts.length === 0) {
      return NextResponse.json({
        connection: {
          success: false,
          error: 'La API respondió pero no devolvió productos. Verifica el endpoint y las credenciales.',
          responseTimeMs: elapsed,
        },
        config: {
          baseUrl: inventarioApiConfig.baseUrl,
          hasApiKey: !!inventarioApiConfig.apiKey,
        },
        timestamp: new Date().toISOString(),
      })
    }

    const grouped = groupInventarioProductsByArticle(rawProducts.slice(0, 50))
    const sampleRaw = rawProducts[0]
    const sampleGrouped = grouped[0] ?? null

    const availableFields = sampleRaw ? Object.keys(sampleRaw) : []
    const categories = [...new Set(rawProducts.map((p) => p.categoria).filter(Boolean))]
    const subCategories = [...new Set(rawProducts.map((p) => p.sub_categoria).filter(Boolean))]

    return NextResponse.json({
      connection: {
        success: true,
        totalRawVariants: rawProducts.length,
        totalGroupedProducts: grouped.length,
        responseTimeMs: elapsed,
        sampleRawProduct: sampleRaw,
        sampleGroupedProduct: sampleGrouped,
      },
      schema: {
        availableFields,
        categories: categories.slice(0, 20),
        subCategories: subCategories.slice(0, 20),
        totalCategories: categories.length,
        totalSubCategories: subCategories.length,
      },
      config: {
        baseUrl: inventarioApiConfig.baseUrl,
        hasApiKey: !!inventarioApiConfig.apiKey,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      connection: {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      config: {
        baseUrl: inventarioApiConfig.baseUrl,
        hasApiKey: !!inventarioApiConfig.apiKey,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
