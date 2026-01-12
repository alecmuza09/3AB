/**
 * API Route para sincronizar productos desde la API de inventario
 * 
 * POST /api/sync-products
 * 
 * Sincroniza todos los productos desde la API de 4Promotional
 * a la base de datos de Supabase.
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromInventarioApi } from '@/lib/sync-products'
import { inventarioApiConfig } from '@/lib/integrations-config'

export async function POST(request: NextRequest) {
  try {
    // Verificar que la API de inventario esté configurada
    if (!inventarioApiConfig.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: 'API de inventario no está configurada. Por favor, verifica las variables de entorno.',
        },
        { status: 400 }
      )
    }

    // Verificar autenticación (opcional, puedes agregar verificación de admin)
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    // }

    console.log('Iniciando sincronización de productos...')

    // Ejecutar sincronización
    const result = await syncProductsFromInventarioApi()

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Sincronización completada exitosamente',
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
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Sincronización completada con errores',
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
        { status: 200 } // 200 porque la sincronización se completó, aunque con errores
      )
    }
  } catch (error) {
    console.error('Error en sincronización:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

// También permitir GET para facilitar la ejecución desde el navegador
export async function GET(request: NextRequest) {
  return POST(request)
}
