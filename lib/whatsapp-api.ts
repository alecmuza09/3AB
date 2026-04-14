/**
 * Cliente para la Meta WhatsApp Cloud API
 *
 * Requiere en .env.local:
 *   WHATSAPP_ACCESS_TOKEN      — token de acceso permanente de Meta
 *   WHATSAPP_PHONE_NUMBER_ID   — ID del número de teléfono registrado en Meta
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_VERSION = 'v19.0'
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`

function getWhatsAppConfig() {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    isEnabled: () =>
      !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID,
  }
}

// ============================================
// TIPOS
// ============================================

export interface WhatsAppTextMessage {
  to: string
  body: string
}

export interface WhatsAppTemplateMessage {
  to: string
  templateName: string
  languageCode?: string
  components?: TemplateComponent[]
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button'
  parameters: TemplateParameter[]
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video'
  text?: string
  currency?: { fallback_value: string; code: string; amount_1000: number }
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Envía un mensaje de texto simple.
 * Útil para notificaciones internas o respuestas del chatbot.
 */
export async function sendTextMessage(
  to: string,
  body: string
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  if (!config.isEnabled()) {
    console.warn('[WhatsApp] API no configurada — mensaje no enviado:', body.slice(0, 50))
    return { success: false, error: 'WhatsApp API no configurada' }
  }

  const normalizedTo = normalizePhoneNumber(to)

  try {
    const response = await fetch(
      `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTo,
          type: 'text',
          text: { preview_url: false, body },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[WhatsApp] Error al enviar mensaje:', data)
      return { success: false, error: data?.error?.message || 'Error desconocido' }
    }

    const messageId = data?.messages?.[0]?.id
    return { success: true, messageId }
  } catch (error) {
    console.error('[WhatsApp] Error de red:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Envía un mensaje usando una plantilla aprobada por Meta.
 * Las plantillas deben estar aprobadas en el Meta Business Manager.
 *
 * Ejemplos de nombres de plantilla esperados:
 *   - 'order_confirmation'   → confirmación de pedido
 *   - 'quotation_received'   → cotización recibida
 *   - 'order_shipped'        → pedido enviado
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  components?: TemplateComponent[],
  languageCode = 'es_MX'
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  if (!config.isEnabled()) {
    console.warn('[WhatsApp] API no configurada — template no enviado:', templateName)
    return { success: false, error: 'WhatsApp API no configurada' }
  }

  const normalizedTo = normalizePhoneNumber(to)

  try {
    const response = await fetch(
      `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedTo,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            ...(components && components.length > 0 ? { components } : {}),
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[WhatsApp] Error al enviar template:', data)
      return { success: false, error: data?.error?.message || 'Error desconocido' }
    }

    const messageId = data?.messages?.[0]?.id
    return { success: true, messageId }
  } catch (error) {
    console.error('[WhatsApp] Error de red:', error)
    return { success: false, error: String(error) }
  }
}

// ============================================
// HELPERS DE NOTIFICACIÓN
// ============================================

/**
 * Notifica al cliente que su pedido fue recibido.
 * Usa la plantilla 'order_confirmation' si está configurada,
 * o un mensaje de texto como fallback.
 */
export async function notifyOrderConfirmation(
  to: string,
  orderNumber: string,
  customerName: string,
  total: number
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  if (!config.isEnabled()) return { success: false, error: 'WhatsApp API no configurada' }

  // Intentar con template primero
  const templateResult = await sendTemplateMessage(to, 'order_confirmation', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: customerName },
        { type: 'text', text: orderNumber },
        {
          type: 'currency',
          currency: {
            fallback_value: `$${total.toFixed(2)} MXN`,
            code: 'MXN',
            amount_1000: total * 1000,
          },
        },
      ],
    },
  ])

  if (templateResult.success) return templateResult

  // Fallback: mensaje de texto libre
  return sendTextMessage(
    to,
    `¡Hola ${customerName}! Tu pedido *${orderNumber}* ha sido recibido correctamente. Total: $${total.toFixed(2)} MXN. Te contactaremos pronto para confirmar los detalles. — 3A Branding`
  )
}

/**
 * Notifica al cliente que su cotización fue recibida y está en proceso.
 */
export async function notifyQuotationReceived(
  to: string,
  quotationNumber: string,
  customerName: string,
  total: number
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  if (!config.isEnabled()) return { success: false, error: 'WhatsApp API no configurada' }

  const templateResult = await sendTemplateMessage(to, 'quotation_received', [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: customerName },
        { type: 'text', text: quotationNumber },
        {
          type: 'currency',
          currency: {
            fallback_value: `$${total.toFixed(2)} MXN`,
            code: 'MXN',
            amount_1000: total * 1000,
          },
        },
      ],
    },
  ])

  if (templateResult.success) return templateResult

  return sendTextMessage(
    to,
    `¡Hola ${customerName}! Recibimos tu solicitud de cotización *${quotationNumber}*. Estimado: $${total.toFixed(2)} MXN. Revisaremos los detalles y te contactaremos en breve. — 3A Branding`
  )
}

/**
 * Notifica al equipo interno de operaciones sobre un nuevo pedido o cotización.
 */
export async function notifyInternalTeam(subject: string, details: string): Promise<WhatsAppSendResult> {
  const internalPhone = process.env.WHATSAPP_INTERNAL_NOTIFY_PHONE
  if (!internalPhone) return { success: false, error: 'WHATSAPP_INTERNAL_NOTIFY_PHONE no configurado' }

  return sendTextMessage(internalPhone, `📋 *${subject}*\n\n${details}`)
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Normaliza un número de teléfono al formato internacional sin símbolo +.
 * Ejemplo: "+52 55 1234 5678" → "525512345678"
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

export { getWhatsAppConfig }
