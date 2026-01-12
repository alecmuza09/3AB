import { NextRequest, NextResponse } from "next/server"
import { updateAllProductsAvailability } from "@/lib/update-products-availability"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const stockQuantity = body.stockQuantity || 100

    const result = await updateAllProductsAvailability(stockQuantity)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al actualizar productos" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${result.updated} productos como disponibles`,
      updated: result.updated,
      stockQuantity: result.stockQuantity,
    })
  } catch (error: any) {
    console.error("Error en /api/update-products-availability:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar productos" },
      { status: 500 }
    )
  }
}

// También permitir GET para facilitar la ejecución
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stockQuantity = parseInt(searchParams.get("stockQuantity") || "100", 10)

    const result = await updateAllProductsAvailability(stockQuantity)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al actualizar productos" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${result.updated} productos como disponibles`,
      updated: result.updated,
      stockQuantity: result.stockQuantity,
    })
  } catch (error: any) {
    console.error("Error en /api/update-products-availability:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar productos" },
      { status: 500 }
    )
  }
}
