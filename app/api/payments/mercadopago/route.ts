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
    const { orderId, orderNumber, items, contactEmail, total } = body

    if (!orderId || !items?.length) {
      return NextResponse.json({ error: 'orderId e items son requeridos' }, { status: 400 })
    }

    const client = new MercadoPago({ accessToken })
    const preference = new Preference(client)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://3abranding.com'

    const mpItems = items.map((item: any) => ({
      id: item.productId || item.id || 'product',
      title: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice ?? 0,
      currency_id: 'MXN',
    }))

    const { body: preferenceData } = await preference.create({
      body: {
        items: mpItems,
        payer: contactEmail ? { email: contactEmail } : undefined,
        external_reference: orderId,
        back_urls: {
          success: `${siteUrl}/pedidos?payment=success&order=${orderNumber || orderId}`,
          failure: `${siteUrl}/checkout?payment=failure&order=${orderNumber || orderId}`,
          pending: `${siteUrl}/pedidos?payment=pending&order=${orderNumber || orderId}`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/payments/mercadopago/webhook`,
        statement_descriptor: '3A Branding',
      },
    })

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
