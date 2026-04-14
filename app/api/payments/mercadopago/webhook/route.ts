/**
 * POST /api/payments/mercadopago/webhook
 *
 * Recibe notificaciones IPN / webhooks de Mercado Pago.
 * Actualiza el estado del pedido en Supabase cuando el pago es aprobado.
 *
 * Requiere en .env.local:
 *   MERCADOPAGO_ACCESS_TOKEN
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { NextRequest, NextResponse } from 'next/server'
import MercadoPago, { Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!accessToken || !supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes en webhook MP')
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    const body = await request.json()
    console.log('[MP Webhook] Evento recibido:', body.type, body.data?.id)

    // Mercado Pago envía topic=payment o type=payment
    if (body.type !== 'payment' && body.topic !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ received: true })
    }

    const client = new MercadoPago({ accessToken })
    const paymentApi = new Payment(client)
    const { body: paymentData } = await paymentApi.get({ id: paymentId })

    console.log('[MP Webhook] Pago:', paymentId, 'Status:', paymentData.status)

    const orderId = paymentData.external_reference

    if (!orderId) {
      console.warn('[MP Webhook] No hay external_reference en el pago')
      return NextResponse.json({ received: true })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    let orderStatus: string
    let paymentStatus: string

    switch (paymentData.status) {
      case 'approved':
        orderStatus = 'En producción'
        paymentStatus = 'paid'
        break
      case 'pending':
      case 'in_process':
        orderStatus = 'En revisión'
        paymentStatus = 'pending'
        break
      case 'rejected':
      case 'cancelled':
        orderStatus = 'En revisión'
        paymentStatus = 'failed'
        break
      default:
        paymentStatus = paymentData.status || 'unknown'
        orderStatus = 'En revisión'
    }

    // Actualizar el pedido en Supabase usando order_number (que es el orderId externo)
    const { error } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_method: `mercadopago:${paymentStatus}`,
      })
      .eq('order_number', orderId)

    if (error) {
      console.error('[MP Webhook] Error actualizando pedido:', error)
    } else {
      console.log('[MP Webhook] Pedido actualizado:', orderId, '→', orderStatus)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MP Webhook] Error procesando webhook:', error)
    // Siempre retornar 200 para que MP no reintente indefinidamente
    return NextResponse.json({ received: true })
  }
}
