/**
 * Notificaciones internas para el equipo de 3A Branding.
 * Envía alertas a andrea@3abranding.com ante cualquier movimiento en la tienda.
 */

import { Resend } from 'resend'

const ANDREA_EMAIL = 'andrea@3abranding.com'
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@3abranding.com'
const ADMIN_URL = 'https://www.3abranding.com/admin'

function formatCurrency(value: number) {
  return `$${(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('⚠️ [Notificaciones] RESEND_API_KEY no configurada — notificación omitida')
    return null
  }
  return new Resend(apiKey)
}

function baseHtml(title: string, body: string): string {
  return `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>${title}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#333;background:#f9f9f9;margin:0;padding:32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#CE1818;padding:24px 40px;">
            <h1 style="margin:0;color:#fff;font-size:22px;">3A Branding · Notificación de Tienda</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#f7f7f7;padding:16px 40px;text-align:center;border-top:1px solid #e5e5e5;">
            <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} 3A Branding Group S.A. de C.V. · Este correo es una alerta automática del sistema.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

// ---------------------------------------------------------------------------
// Nuevo pedido (llamado desde checkout o cuando se crea el pedido en BD)
// ---------------------------------------------------------------------------
export async function notifyNewOrder(order: {
  id?: string
  order_number?: string
  total?: number
  status?: string
  contact_info?: { contactName?: string; email?: string; phone?: string; company?: string }
  items?: Array<{ name?: string; product_name?: string; quantity: number }>
}) {
  const resend = getResend()
  if (!resend) return

  const orderId = order.order_number || order.id || '—'
  const contact = order.contact_info || {}
  const items = order.items || []

  const body = `
    <h2 style="color:#CE1818;margin-top:0;">🛒 Nuevo Pedido Recibido</h2>
    <p><strong>Referencia:</strong> ${orderId}</p>
    <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
    <p><strong>Estado:</strong> ${order.status || 'pending'}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
    <h3 style="font-size:15px;">Cliente</h3>
    <p style="margin:4px 0;">${contact.contactName || 'Sin nombre'} ${contact.company ? `(${contact.company})` : ''}</p>
    <p style="margin:4px 0;">${contact.email || ''}</p>
    <p style="margin:4px 0;">${contact.phone || ''}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
    <h3 style="font-size:15px;">Productos (${items.length})</h3>
    <ul style="padding-left:20px;color:#555;">
      ${items.map((i) => `<li>${i.name || i.product_name || 'Producto'} × ${i.quantity}</li>`).join('')}
    </ul>
    <p style="margin-top:24px;">
      <a href="${ADMIN_URL}?section=orders" style="background:#CE1818;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:14px;">
        Ver pedido en panel →
      </a>
    </p>`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ANDREA_EMAIL],
      subject: `[Nuevo Pedido] ${orderId} — ${contact.contactName || 'Cliente'} · ${formatCurrency(order.total || 0)}`,
      html: baseHtml(`Nuevo Pedido ${orderId}`, body),
    })
    console.log('📧 [Notificaciones] Nuevo pedido notificado a Andrea:', orderId)
  } catch (e) {
    console.warn('⚠️ [Notificaciones] Error al notificar nuevo pedido:', e)
  }
}

// ---------------------------------------------------------------------------
// Cambio de estado de pedido
// ---------------------------------------------------------------------------
export async function notifyOrderStatusChange(order: {
  id?: string
  order_number?: string
  status: string
  total?: number
  contact_info?: { contactName?: string; email?: string }
  previousStatus?: string
}) {
  const resend = getResend()
  if (!resend) return

  const orderId = order.order_number || order.id || '—'
  const contact = order.contact_info || {}

  const statusColors: Record<string, string> = {
    'approved': '#16a34a',
    'paid': '#16a34a',
    'En producción': '#2563eb',
    'completed': '#16a34a',
    'cancelled': '#dc2626',
    'rejected': '#dc2626',
    'pending': '#d97706',
    'En revisión': '#d97706',
  }
  const color = statusColors[order.status] || '#555'

  const body = `
    <h2 style="color:#CE1818;margin-top:0;">🔄 Cambio de Estado en Pedido</h2>
    <p><strong>Referencia:</strong> ${orderId}</p>
    ${order.previousStatus ? `<p><strong>Estado anterior:</strong> ${order.previousStatus}</p>` : ''}
    <p><strong>Nuevo estado:</strong> <span style="color:${color};font-weight:700;">${order.status}</span></p>
    <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
    ${contact.contactName ? `<p><strong>Cliente:</strong> ${contact.contactName} (${contact.email || ''})</p>` : ''}
    <p style="margin-top:24px;">
      <a href="${ADMIN_URL}?section=orders" style="background:#CE1818;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:14px;">
        Ver pedido en panel →
      </a>
    </p>`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ANDREA_EMAIL],
      subject: `[Estado Pedido] ${orderId} → ${order.status}`,
      html: baseHtml(`Pedido ${orderId} — ${order.status}`, body),
    })
    console.log('📧 [Notificaciones] Cambio de estado notificado a Andrea:', orderId, '→', order.status)
  } catch (e) {
    console.warn('⚠️ [Notificaciones] Error al notificar cambio de estado:', e)
  }
}

// ---------------------------------------------------------------------------
// Pago de Mercado Pago confirmado / rechazado
// ---------------------------------------------------------------------------
export async function notifyPaymentUpdate(params: {
  orderId: string
  paymentId: string | number
  paymentStatus: string
  amount?: number
  payerEmail?: string
  payerName?: string
}) {
  const resend = getResend()
  if (!resend) return

  const isApproved = params.paymentStatus === 'approved'
  const icon = isApproved ? '✅' : params.paymentStatus === 'rejected' ? '❌' : '⏳'
  const statusLabel: Record<string, string> = {
    approved: 'Aprobado',
    pending: 'Pendiente',
    in_process: 'En proceso',
    rejected: 'Rechazado',
    cancelled: 'Cancelado',
  }
  const label = statusLabel[params.paymentStatus] || params.paymentStatus

  const body = `
    <h2 style="color:#CE1818;margin-top:0;">${icon} Actualización de Pago — Mercado Pago</h2>
    <p><strong>Pedido:</strong> ${params.orderId}</p>
    <p><strong>ID de pago MP:</strong> ${params.paymentId}</p>
    <p><strong>Estado del pago:</strong> <strong>${label}</strong></p>
    ${params.amount ? `<p><strong>Monto:</strong> ${formatCurrency(params.amount)}</p>` : ''}
    ${params.payerEmail ? `<p><strong>Pagador:</strong> ${params.payerName || ''} (${params.payerEmail})</p>` : ''}
    <p style="margin-top:24px;">
      <a href="${ADMIN_URL}?section=orders" style="background:#CE1818;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:14px;">
        Ver pedido en panel →
      </a>
    </p>`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ANDREA_EMAIL],
      subject: `[Pago MP] ${label} — Pedido ${params.orderId}`,
      html: baseHtml(`Pago Mercado Pago — ${params.orderId}`, body),
    })
    console.log('📧 [Notificaciones] Pago MP notificado a Andrea:', params.orderId, params.paymentStatus)
  } catch (e) {
    console.warn('⚠️ [Notificaciones] Error al notificar pago MP:', e)
  }
}

// ---------------------------------------------------------------------------
// Nueva cotización recibida
// ---------------------------------------------------------------------------
export async function notifyNewQuotation(quotation: {
  quotation_number?: string
  total?: number
  contact_info?: {
    contactName?: string
    companyName?: string
    email?: string
    phone?: string
  }
  notes?: string
  items?: Array<{ product_name?: string; product?: string; name?: string; quantity: number }>
}) {
  const resend = getResend()
  if (!resend) return

  const quotationNumber = quotation.quotation_number || '—'
  const contact = quotation.contact_info || {}
  const items = quotation.items || []

  const body = `
    <h2 style="color:#CE1818;margin-top:0;">📋 Nueva Cotización Recibida</h2>
    <p><strong>Cotización:</strong> ${quotationNumber}</p>
    <p><strong>Estimado total:</strong> ${formatCurrency(quotation.total || 0)}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
    <h3 style="font-size:15px;">Contacto</h3>
    <p style="margin:4px 0;">${contact.contactName || 'Sin nombre'} ${contact.companyName ? `· ${contact.companyName}` : ''}</p>
    <p style="margin:4px 0;">${contact.email || ''}</p>
    <p style="margin:4px 0;">${contact.phone || ''}</p>
    ${quotation.notes ? `<p style="margin-top:8px;"><strong>Notas:</strong> ${quotation.notes}</p>` : ''}
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
    <h3 style="font-size:15px;">Productos (${items.length})</h3>
    <ul style="padding-left:20px;color:#555;">
      ${items.map((i) => `<li>${i.product_name || i.product || i.name || 'Producto'} × ${i.quantity}</li>`).join('')}
    </ul>
    <p style="margin-top:24px;">
      <a href="${ADMIN_URL}?section=quotations" style="background:#CE1818;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:14px;">
        Ver cotización en panel →
      </a>
    </p>`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ANDREA_EMAIL],
      subject: `[Nueva Cotización] ${quotationNumber} — ${contact.contactName || 'Cliente'} · ${contact.companyName || ''}`,
      html: baseHtml(`Nueva Cotización ${quotationNumber}`, body),
    })
    console.log('📧 [Notificaciones] Nueva cotización notificada a Andrea:', quotationNumber)
  } catch (e) {
    console.warn('⚠️ [Notificaciones] Error al notificar nueva cotización:', e)
  }
}
