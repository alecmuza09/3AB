/**
 * API Route para actualizar el stock de todos los productos
 * 
 * POST /api/update-products-stock
 * Body: { stockQuantity?: number } (opcional, por defecto 100)
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateAllProductsStock } from '@/lib/update-products-stock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const stockQuantity = body.stockQuantity || 100

    console.log(`Iniciando actualización de stock a ${stockQuantity} unidades...`)

    const result = await updateAllProductsStock(stockQuantity)

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Stock actualizado exitosamente',
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
    console.error('Error en actualización de stock:', error)
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
  // Permitir GET con query parameter
  const { searchParams } = new URL(request.url)
  const stockQuantity = parseInt(searchParams.get('stockQuantity') || '100', 10)

  try {
    console.log(`Iniciando actualización de stock a ${stockQuantity} unidades...`)

    const result = await updateAllProductsStock(stockQuantity)

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Stock actualizado exitosamente',
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
    console.error('Error en actualización de stock:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
