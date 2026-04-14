/**
 * POST /api/payments/mercadopago
 *
 * Crea una preferencia de Mercado Pago y devuelve el init_point (URL de pago).
 * El cliente es redirigido a esa URL para completar el pago.
 *
 * Requiere en .env.local:
 *   MERCADOPAGO_ACCESS_TOKEN — token de producción o sandbox
 *   NEXT_PUBLIC_SITE_URL     — URL base del sitio
 */

import { NextRequest, NextResponse } from 'next/server'
import MercadoPago, { Preference } from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json(
        { error: 'MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { orderId, orderNumber, items, contactEmail } = body

    if (!orderId || !items?.length) {
      return NextResponse.json({ error: 'orderId e items son requeridos' }, { status: 400 })
    }

    // Usar el order_number de Supabase como external_reference para que el webhook
    // pueda encontrar el pedido al hacer .eq('order_number', external_reference)
    const externalReference = orderNumber || orderId

    const client = new MercadoPago({ accessToken })
    const preference = new Preference(client)

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://3abranding.com'

    const mpItems = items.map((item: any) => ({
      id: String(item.productId || item.id || 'product'),
      title: String(item.name).slice(0, 256),
      quantity: Number(item.quantity) || 1,
      unit_price: Math.max(0.01, Number(item.unitPrice ?? 0)),
      currency_id: 'MXN',
    }))

    const preferenceResponse: any = await preference.create({
      body: {
        items: mpItems,
        payer: contactEmail ? { email: contactEmail } : undefined,
        external_reference: externalReference,
        back_urls: {
          success: `${siteUrl}/pedidos?payment=success&order=${externalReference}`,
          failure: `${siteUrl}/checkout?payment=failure&order=${externalReference}`,
          pending: `${siteUrl}/pedidos?payment=pending&order=${externalReference}`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/payments/mercadopago/webhook`,
        statement_descriptor: '3A Branding',
      },
    })
    const preferenceData = preferenceResponse?.body ?? preferenceResponse

    return NextResponse.json({
      success: true,
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point,
      sandboxInitPoint: preferenceData.sandbox_init_point,
    })
  } catch (error) {
    console.error('Error creando preferencia de Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago', details: String(error) },
      { status: 500 }
    )
  }
}
