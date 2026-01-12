/**
 * API Route para actualizar productos existentes con sus imágenes
 * 
 * POST /api/update-products-images
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateProductsWithImages } from '@/lib/update-products-images'

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando actualización de imágenes de productos...')

    const result = await updateProductsWithImages()

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Actualización completada exitosamente',
          data: result,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error desconocido',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error en actualización de imágenes:', error)
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
