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
import { notifyPaymentUpdate } from '@/lib/admin-notifications'

/**
 * Verifica la firma HMAC-SHA256 de Mercado Pago.
 * Docs: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */
async function verifyMercadoPagoSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!webhookSecret) return true // Sin secreto configurado, aceptar todas (modo dev)

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  const urlParams = new URL(request.url).searchParams
  const dataId = urlParams.get('data.id')

  if (!xSignature) return false

  const parts = xSignature.split(',')
  const tsEntry = parts.find((p) => p.startsWith('ts='))
  const v1Entry = parts.find((p) => p.startsWith('v1='))

  if (!tsEntry || !v1Entry) return false

  const ts = tsEntry.split('=')[1]
  const v1 = v1Entry.split('=')[1]

  const manifest = `id:${dataId || ''};request-id:${xRequestId || ''};ts:${ts};`

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest))
    const hashHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return hashHex === v1
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!accessToken || !supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes en webhook MP')
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    const rawBody = await request.text()
    const signatureValid = await verifyMercadoPagoSignature(request, rawBody)
    if (!signatureValid) {
      console.warn('[MP Webhook] Firma inválida — request rechazada')
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
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
    const paymentResponse: any = await paymentApi.get({ id: paymentId })
    const paymentData = paymentResponse?.body ?? paymentResponse

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

    // Notificar a Andrea sobre el pago (no bloqueante)
    notifyPaymentUpdate({
      orderId,
      paymentId: paymentId,
      paymentStatus: paymentData.status,
      amount: paymentData.transaction_amount,
      payerEmail: paymentData.payer?.email,
      payerName: paymentData.payer?.first_name
        ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`.trim()
        : undefined,
    }).catch((e: unknown) => console.warn('[MP Webhook] Error al notificar a Andrea:', e))

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MP Webhook] Error procesando webhook:', error)
    // Siempre retornar 200 para que MP no reintente indefinidamente
    return NextResponse.json({ received: true })
  }
}
