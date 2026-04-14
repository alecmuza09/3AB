/**
 * GET  /api/webhooks/whatsapp — verificación del webhook por Meta
 * POST /api/webhooks/whatsapp — mensajes entrantes de WhatsApp
 *
 * Requiere en .env.local:
 *   WHATSAPP_WEBHOOK_VERIFY_TOKEN — token elegido por ti al configurar el webhook en Meta
 *   WHATSAPP_ACCESS_TOKEN         — para reenviar mensajes al chatbot
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/whatsapp-api'

// ============================================
// GET — Verificación del webhook (Meta challenge)
// ============================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WA Webhook] Verificación exitosa')
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn('[WA Webhook] Verificación fallida — token incorrecto')
  return new NextResponse('Forbidden', { status: 403 })
}

// ============================================
// POST — Mensajes entrantes
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar que es un evento de WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ received: true })
    }

    const entries = body.entry ?? []

    for (const entry of entries) {
      const changes = entry.changes ?? []

      for (const change of changes) {
        if (change.field !== 'messages') continue

        const value = change.value
        const messages: any[] = value?.messages ?? []
        const contacts: any[] = value?.contacts ?? []

        for (const message of messages) {
          const from: string = message.from
          const contactName = contacts.find((c: any) => c.wa_id === from)?.profile?.name ?? 'Cliente'

          // Solo procesar mensajes de texto
          if (message.type !== 'text') {
            console.log(`[WA Webhook] Mensaje tipo ${message.type} de ${from} — ignorado`)
            continue
          }

          const userMessage: string = message.text?.body ?? ''
          console.log(`[WA Webhook] Mensaje de ${from} (${contactName}): ${userMessage}`)

          // Reenviar al chatbot IA para obtener una respuesta
          try {
            const chatRes = await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/chat`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: [{ role: 'user', content: userMessage }],
                  source: 'whatsapp',
                }),
              }
            )

            if (chatRes.ok) {
              const chatData = await chatRes.json()
              const aiReply: string = chatData.reply || chatData.message || ''

              if (aiReply) {
                await sendTextMessage(from, aiReply)
                console.log(`[WA Webhook] Respuesta IA enviada a ${from}`)
              }
            } else {
              console.warn('[WA Webhook] El chatbot devolvió error:', chatRes.status)
              // Fallback: respuesta genérica
              await sendTextMessage(
                from,
                '¡Hola! Recibimos tu mensaje. Un asesor de 3A Branding te contactará pronto. También puedes llamarnos al +52 55 6791 9161.'
              )
            }
          } catch (chatError) {
            console.error('[WA Webhook] Error al consultar chatbot:', chatError)
            // Fallback siempre
            await sendTextMessage(
              from,
              '¡Hola! Recibimos tu mensaje. Te contactaremos a la brevedad. — 3A Branding'
            )
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WA Webhook] Error procesando webhook:', error)
    // Siempre 200 para que Meta no reintente
    return NextResponse.json({ received: true })
  }
}
