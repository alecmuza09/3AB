/**
 * POST /api/quotations/admin
 *
 * Crea una cotización desde el panel de admin con esquema completo:
 *
 * body: {
 *   userId?: string | null              // perfil de cliente vinculado
 *   contactInfo: {                      // datos del cliente (snapshot)
 *     contactName, companyName, email, phone, taxId,
 *     deliveryAddress, eventType, deliveryDate, paymentTerms
 *   },
 *   items: [{
 *     productId?, productName, productSku?, quantity, unitPrice,
 *     subtotal, customization?, imageUrl?
 *   }],
 *   subtotal, taxes, shippingCost, discount, total,
 *   currency?,                          // 'MXN' por defecto
 *   validUntil?,                        // ISO date string (YYYY-MM-DD)
 *   notes?,                             // notas para el cliente
 *   adminNotes?,                        // notas internas
 *   status?                             // 'draft' por defecto
 * }
 *
 * Devuelve la cotización completa con sus items.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configuración de Supabase incompleta')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function generateQuotationNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000 + 10000)
  return `COT-${year}-${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      userId,
      contactInfo,
      items,
      subtotal,
      taxes,
      shippingCost,
      discount,
      total,
      currency,
      validUntil,
      notes,
      adminNotes,
      status,
    } = body

    if (!contactInfo?.email || !contactInfo?.contactName) {
      return NextResponse.json(
        { error: 'Datos de contacto incompletos: email y contactName son requeridos' },
        { status: 400 }
      )
    }

    const validIso = (() => {
      if (validUntil) {
        const d = new Date(validUntil)
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
      }
      const fallback = new Date()
      fallback.setDate(fallback.getDate() + 30)
      return fallback.toISOString().split('T')[0]
    })()

    const quotationRecord = {
      quotation_number: generateQuotationNumber(),
      user_id: userId || null,
      status: (status as any) || 'draft',
      valid_until: validIso,
      subtotal: Number(subtotal) || 0,
      taxes: Number(taxes) || 0,
      shipping_cost: Number(shippingCost) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      currency: currency || 'MXN',
      contact_info: contactInfo,
      notes: notes || null,
      admin_notes: adminNotes || null,
    }

    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert(quotationRecord)
      .select()
      .single()

    if (error) {
      console.error('[quotations/admin] error creando cotización:', error)
      return NextResponse.json(
        {
          error: 'Error al crear la cotización',
          details: error.message,
          hint:
            error.code === '42P01'
              ? 'La tabla "quotations" no existe. Ejecuta la migración SQL en Supabase.'
              : undefined,
        },
        { status: 500 }
      )
    }

    // Insertar líneas en quotation_items
    if (Array.isArray(items) && items.length > 0) {
      const itemRecords = items.map((item: any) => ({
        quotation_id: quotation.id,
        product_id: item.productId || null,
        product_name: item.productName || item.name || 'Producto personalizado',
        product_sku: item.productSku || item.sku || null,
        variation_id: item.variationId || null,
        variation_label: item.variationLabel || null,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unitPrice) || 0,
        subtotal:
          Number(item.subtotal) ||
          (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
        customization_data: item.customization
          ? { description: item.customization }
          : item.customizationData || null,
        image_url: item.imageUrl || null,
      }))

      const { error: itemsError } = await supabase.from('quotation_items').insert(itemRecords)
      if (itemsError) {
        console.warn('[quotations/admin] error insertando items:', itemsError.message)
        // no fallamos la cotización
      }
    }

    // Devolver con items
    const { data: full } = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('id', quotation.id)
      .single()

    return NextResponse.json(
      { success: true, quotation: full || quotation },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/quotations/admin:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
