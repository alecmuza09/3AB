/**
 * POST /api/quotations/:id/convert
 *
 * Convierte una cotización en pedido. Genera:
 *  1) Un nuevo registro en `orders` (status='pending', type='order') con todos
 *     los datos de la cotización copiados (cliente, totales, dirección).
 *  2) Las líneas correspondientes en `order_items` clonadas desde
 *     quotation_items.
 *  3) Marca la cotización original como `status='converted'` y enlaza el
 *     order_number en `admin_notes` para referencia.
 *
 * body opcional:
 *   - paymentStatus: 'pending' | 'paid' | 'partial'   (default: 'pending')
 *   - notes: string                                    (notas internas para el pedido)
 *
 * Devuelve el pedido creado.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Configuración de Supabase incompleta")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 900000 + 100000)
  return `ORD-${year}-${rand}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const quotationId = params.id
    const body = await request.json().catch(() => ({}))
    const paymentStatus = body?.paymentStatus || "pending"
    const internalNotes = body?.notes || null

    // 1) Cargar la cotización con sus items
    const { data: quotation, error: qErr } = await supabase
      .from("quotations")
      .select("*, quotation_items(*)")
      .eq("id", quotationId)
      .single()

    if (qErr || !quotation) {
      return NextResponse.json(
        {
          error: "Cotización no encontrada",
          details: qErr?.message,
        },
        { status: 404 }
      )
    }

    if ((quotation as any).status === "converted") {
      return NextResponse.json(
        { error: "Esta cotización ya fue convertida en pedido." },
        { status: 400 }
      )
    }

    const ci = (quotation as any).contact_info || {}

    // shipping_address es NOT NULL en orders → necesitamos al menos un objeto.
    // Reusamos contact_info + deliveryAddress como mínimo viable.
    const shippingAddress = {
      contactName: ci.contactName || null,
      companyName: ci.companyName || null,
      email: ci.email || null,
      phone: ci.phone || null,
      address: ci.deliveryAddress || null,
      city: ci.city || null,
      state: ci.state || null,
      country: ci.country || "MX",
      postalCode: ci.postalCode || null,
    }

    // 2) Crear pedido
    const orderRecord: any = {
      order_number: generateOrderNumber(),
      user_id: (quotation as any).user_id || null,
      status: "pending",
      type: "order",
      subtotal: Number((quotation as any).subtotal) || 0,
      taxes: Number((quotation as any).taxes) || 0,
      shipping_cost: Number((quotation as any).shipping_cost) || 0,
      discount: Number((quotation as any).discount) || 0,
      total: Number((quotation as any).total) || 0,
      currency: (quotation as any).currency || "MXN",
      payment_status: paymentStatus,
      payment_method: null,
      payment_reference: null,
      contact_info: ci,
      shipping_address: shippingAddress,
      billing_address: null,
      notes: internalNotes || (quotation as any).notes || null,
      estimated_delivery_date: ci.deliveryDate || null,
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert(orderRecord)
      .select()
      .single()

    if (orderErr || !order) {
      console.error("[quotations/convert] error creando pedido:", orderErr)
      return NextResponse.json(
        {
          error: "Error al crear el pedido",
          details: orderErr?.message,
        },
        { status: 500 }
      )
    }

    // 3) Copiar líneas a order_items (saltando las que no tengan product_id real,
    //    porque order_items.product_id es NOT NULL en el schema)
    const items = Array.isArray((quotation as any).quotation_items)
      ? (quotation as any).quotation_items
      : []

    let itemsCreated = 0
    let itemsSkipped = 0
    if (items.length > 0) {
      const validItems = items.filter((it: any) => !!it.product_id)
      itemsSkipped = items.length - validItems.length

      if (validItems.length > 0) {
        const orderItemRecords = validItems.map((it: any) => ({
          order_id: (order as any).id,
          product_id: it.product_id,
          variation_id: it.variation_id || null,
          product_name: it.product_name || "Producto",
          product_sku: it.product_sku || null,
          variation_label: it.variation_label || null,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          subtotal:
            Number(it.subtotal) ||
            (Number(it.unit_price) || 0) * (Number(it.quantity) || 1),
          customization_data: it.customization_data || null,
          image_url: it.image_url || null,
        }))

        const { error: itemsErr } = await supabase
          .from("order_items")
          .insert(orderItemRecords)

        if (itemsErr) {
          console.warn(
            "[quotations/convert] error insertando order_items:",
            itemsErr.message
          )
        } else {
          itemsCreated = orderItemRecords.length
        }
      }
    }

    // 4) Marcar cotización como convertida y registrar referencia
    const previousAdminNotes = (quotation as any).admin_notes || ""
    const conversionNote = `[Convertida → ${(order as any).order_number} el ${new Date().toLocaleString("es-MX")}]`
    const updatedAdminNotes = previousAdminNotes
      ? `${previousAdminNotes}\n\n${conversionNote}`
      : conversionNote

    const { error: updErr } = await supabase
      .from("quotations")
      .update({
        status: "converted",
        admin_notes: updatedAdminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quotationId)

    if (updErr) {
      console.warn(
        "[quotations/convert] error actualizando cotización (pedido ya creado):",
        updErr.message
      )
    }

    return NextResponse.json({
      success: true,
      order,
      stats: {
        itemsCreated,
        itemsSkipped,
        skippedReason:
          itemsSkipped > 0
            ? "Las líneas sin product_id (productos manuales) no se copiaron porque order_items requiere un product_id válido. Agrégalas manualmente al pedido si las necesitas."
            : null,
      },
    })
  } catch (error: any) {
    console.error("Error in POST /api/quotations/:id/convert:", error)
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
