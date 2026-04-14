/**
 * POST /api/webhooks/whatsapp/notify
 *
 * Endpoint interno para enviar notificaciones de WhatsApp desde el panel admin.
 * Solo accesible en producción con CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import { notifyQuotationReceived, sendTextMessage } from '@/lib/whatsapp-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, quotationNumber, contactName, total, message } = body

    if (!to) {
      return NextResponse.json({ error: 'El campo "to" (teléfono) es requerido' }, { status: 400 })
    }

    let result
    if (message) {
      result = await sendTextMessage(to, message)
    } else if (quotationNumber) {
      result = await notifyQuotationReceived(to, quotationNumber, contactName || 'Cliente', total || 0)
    } else {
      return NextResponse.json(
        { error: 'Proporciona "message" o "quotationNumber"' },
        { status: 400 }
      )
    }

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  } catch (error) {
    console.error('[WA notify]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
