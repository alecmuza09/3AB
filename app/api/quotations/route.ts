import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyQuotationReceived } from '@/lib/whatsapp-api'

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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      userId,
      formData,
      quoteItems,
      subtotal,
      discountAmount,
      volumeDiscount,
      total,
    } = body

    if (!formData?.email || !formData?.contactName) {
      return NextResponse.json({ error: 'Datos de contacto incompletos' }, { status: 400 })
    }

    const quotationNumber = `COT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    const quotationRecord = {
      quotation_number: quotationNumber,
      user_id: userId || null,
      status: 'draft' as const,
      valid_until: validUntil.toISOString().split('T')[0],
      subtotal: subtotal || 0,
      taxes: 0,
      shipping_cost: 0,
      discount: discountAmount || 0,
      total: total || 0,
      currency: 'MXN',
      contact_info: {
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType || null,
        deliveryDate: formData.deliveryDate || null,
        deliveryAddress: formData.deliveryAddress || null,
        paymentTerms: formData.paymentTerms || null,
        volumeDiscount: volumeDiscount || 0,
      },
      notes: formData.specialRequirements || null,
      // Items stored as JSONB in admin_notes since quotation_items requires real product_id FKs
      admin_notes: JSON.stringify(
        (quoteItems || []).map((item: any) => ({
          product: item.product,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          customization: item.customization || null,
          imageCount: item.imageUrls?.length || 0,
        }))
      ),
    }

    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert(quotationRecord)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating quotation:', error)
      return NextResponse.json(
        {
          error: 'Error al crear la cotización',
          details: error.message,
          hint: error.code === '42P01'
            ? 'La tabla "quotations" no existe. Ejecuta la migración SQL en Supabase.'
            : undefined,
        },
        { status: 500 }
      )
    }

    // Insertar ítems reales en quotation_items (product_id es nullable tras migración)
    if (quoteItems && quoteItems.length > 0) {
      const itemRecords = (quoteItems as any[]).map((item: any) => ({
        quotation_id: quotation.id,
        product_id: item.productId || null,
        product_name: item.product || item.name || 'Producto personalizado',
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        subtotal: item.total || (item.unitPrice || 0) * (item.quantity || 1),
        customization: item.customization || null,
        image_url: null,
        customization_data: item.customizationData || {},
      }))

      const { error: itemsError } = await supabase.from('quotation_items').insert(itemRecords)
      if (itemsError) {
        console.warn('⚠️ Error al insertar quotation_items:', itemsError.message)
        // No falla la cotización, solo logueamos
      }
    }

    console.log('✅ Cotización creada:', quotation.quotation_number)

    // Enviar email y WhatsApp de forma no bloqueante
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const contactEmail = formData.email
    const contactName = formData.contactName || 'Cliente'
    const contactPhone = formData.phone || ''

    fetch(`${appUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'quotation',
        order: {
          ...quotation,
          quotation_items: (quoteItems || []).map((item: any) => ({
            product_name: item.product || item.name,
            quantity: item.quantity,
            subtotal: item.total || item.unitPrice * item.quantity || 0,
          })),
          contact_info: {
            email: contactEmail,
            contactName,
            companyName: formData.companyName || '',
            phone: contactPhone,
          },
        },
      }),
    }).catch((e) => console.warn('[quotations] Email send error:', e))

    if (contactPhone) {
      notifyQuotationReceived(contactPhone, quotation.quotation_number, contactName, total || 0).catch(
        (e) => console.warn('[quotations] WhatsApp send error:', e)
      )
    }

    return NextResponse.json(
      { success: true, quotation, message: 'Cotización creada exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/quotations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching quotations:', error)
      return NextResponse.json(
        { error: 'Error al obtener cotizaciones', details: error.message, quotations: [] },
        { status: 500 }
      )
    }

    return NextResponse.json({ quotations: data || [] })
  } catch (error) {
    console.error('Error in GET /api/quotations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { quotationId, status, adminNotes } = body

    if (!quotationId || !status) {
      return NextResponse.json({ error: 'quotationId y status son requeridos' }, { status: 400 })
    }

    const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() }
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes

    const { data, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', quotationId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar la cotización', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, quotation: data })
  } catch (error) {
    console.error('Error in PATCH /api/quotations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
