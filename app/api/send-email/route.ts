import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@3abranding.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'factura@3abranding.com'
const OPS_EMAIL = process.env.OPS_EMAIL || 'operaciones@3abranding.com'
const ANDREA_EMAIL = 'andrea@3abranding.com'

function formatCurrency(value: number) {
  return `$${(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function buildConfirmationEmail(order: any): string {
  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatCurrency(item.unitPrice || 0)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${formatCurrency((item.unitPrice || 0) * item.quantity)}</td>
      </tr>`
    )
    .join('')

  const shippingLabel =
    order.shipping?.method === 'pickup'
      ? 'Recolección en showroom'
      : order.shipping?.method === 'express'
      ? 'Envío express'
      : 'Envío estándar'

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmación de Pedido</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background:#CE1818;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">3A Branding</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Confirmación de Pedido</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;">Hola <strong>${order.contact?.contactName || 'Cliente'}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;">Hemos recibido tu pedido exitosamente. A continuación encontrarás el resumen y los datos para completar tu pago.</p>

              <!-- Reference Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border:1px solid #fecaca;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Número de Referencia</p>
                    <p style="margin:0;font-size:26px;font-weight:700;color:#CE1818;">${order.id}</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#888;">Incluye este número en tu transferencia</p>
                  </td>
                </tr>
              </table>

              <!-- Order Summary -->
              <h2 style="margin:0 0 16px;font-size:17px;color:#222;">Resumen del Pedido</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f7f7f7;">
                    <th style="padding:10px 12px;text-align:left;font-size:12px;color:#666;font-weight:600;">Producto</th>
                    <th style="padding:10px 12px;text-align:center;font-size:12px;color:#666;font-weight:600;">Cant.</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;font-weight:600;">Precio</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;font-weight:600;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:4px 0;color:#555;">Subtotal</td>
                  <td style="padding:4px 0;text-align:right;">${formatCurrency(order.subtotal || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#555;">${shippingLabel}</td>
                  <td style="padding:4px 0;text-align:right;">${formatCurrency(order.shippingCost || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#555;">IVA (16%)</td>
                  <td style="padding:4px 0;text-align:right;">${formatCurrency(order.taxes || 0)}</td>
                </tr>
                <tr style="border-top:2px solid #e5e5e5;">
                  <td style="padding:10px 0 4px;font-size:16px;font-weight:700;">Total</td>
                  <td style="padding:10px 0 4px;text-align:right;font-size:16px;font-weight:700;color:#CE1818;">${formatCurrency(order.total || 0)}</td>
                </tr>
              </table>

              <!-- Bank Transfer -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <h3 style="margin:0 0 16px;font-size:16px;color:#1d4ed8;">Datos para Transferencia</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ['Beneficiario', '3A BRANDING GROUP S.A. DE C.V.'],
                        ['RFC', 'ABG150227SA1'],
                        ['Banco', 'SANTANDER'],
                        ['Número de Cuenta', '65-50500620-5'],
                        ['CLABE Interbancaria', '014180655050062058'],
                        ['Referencia', order.id],
                      ]
                        .map(
                          ([label, val]) => `
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#555;width:45%;">${label}</td>
                        <td style="padding:5px 0;font-size:13px;font-weight:600;">${val}</td>
                      </tr>`
                        )
                        .join('')}
                    </table>
                    <p style="margin:16px 0 0;font-size:13px;color:#555;">
                      Envía tu comprobante a <a href="mailto:factura@3abranding.com" style="color:#1d4ed8;">factura@3abranding.com</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h2 style="margin:0 0 12px;font-size:17px;color:#222;">Siguientes Pasos</h2>
              <ol style="margin:0 0 28px;padding-left:20px;color:#555;font-size:14px;line-height:2;">
                <li>Realiza la transferencia con los datos bancarios indicados arriba.</li>
                <li>Envía tu comprobante de pago a <strong>factura@3abranding.com</strong> mencionando tu referencia.</li>
                <li>Un asesor confirmará tu pedido en menos de <strong>4 horas hábiles</strong>.</li>
                <li>Recibirás actualizaciones de estado por correo conforme avance tu pedido.</li>
              </ol>

              <p style="margin:0;font-size:14px;color:#555;">¿Tienes dudas? Escríbenos por WhatsApp o responde este correo.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f7f7f7;padding:20px 40px;text-align:center;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#888;">© 2024 3A Branding Group S.A. de C.V. · CDMX, México</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildAdminNotificationEmail(order: any): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;color:#333;padding:24px;">
  <h2 style="color:#CE1818;">Nuevo Pedido Recibido — ${order.id}</h2>
  <p><strong>Estado:</strong> ${order.status}</p>
  <p><strong>Total:</strong> $${(order.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
  <hr/>
  <h3>Cliente</h3>
  <p>
    ${order.contact?.contactName || ''} ${order.contact?.company ? `(${order.contact.company})` : ''}<br/>
    ${order.contact?.email || ''}<br/>
    ${order.contact?.phone || ''}
  </p>
  <hr/>
  <h3>Productos (${(order.items || []).length})</h3>
  <ul>
    ${(order.items || []).map((i: any) => `<li>${i.name} × ${i.quantity}</li>`).join('')}
  </ul>
  <p style="margin-top:24px;"><a href="https://www.3abranding.com/admin?section=orders" style="color:#CE1818;">Ver en Panel Admin →</a></p>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY no configurada — correo no enviado')
      return NextResponse.json({ success: true, message: 'Email omitido (sin API key)' })
    }

    const resend = new Resend(apiKey)

    const { order, type } = await request.json()

    if (!order) {
      return NextResponse.json({ error: 'Datos de pedido requeridos' }, { status: 400 })
    }

    const emailType = type || 'confirmation'

    if (emailType === 'confirmation' && order.contact?.email) {
      const [customerResult, adminResult] = await Promise.allSettled([
        resend.emails.send({
          from: FROM_EMAIL,
          to: [order.contact.email],
          subject: `Confirmación de Pedido ${order.id} — 3A Branding`,
          html: buildConfirmationEmail(order),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL, ANDREA_EMAIL],
          subject: `[Nuevo Pedido] ${order.id} — ${order.contact?.contactName || 'Cliente'}`,
          html: buildAdminNotificationEmail(order),
        }),
      ])

      const customerOk = customerResult.status === 'fulfilled'
      const adminOk = adminResult.status === 'fulfilled'

      console.log('📧 Correo cliente:', customerOk ? '✅' : '❌', !customerOk && (customerResult as PromiseRejectedResult).reason)
      console.log('📧 Notificación admin:', adminOk ? '✅' : '❌', !adminOk && (adminResult as PromiseRejectedResult).reason)

      return NextResponse.json({
        success: customerOk,
        customerEmail: customerOk,
        adminEmail: adminOk,
      })
    }

    // ---- Cotización recibida ----
    if ((emailType === 'quotation' || emailType === 'quotation_admin') && order) {
      const clientEmail = order.contact_info?.email || order.contact?.email || ''
      const quotationNumber = order.quotation_number || order.id || 'COT-XXXX'
      const contactName = order.contact_info?.contactName || order.contact?.contactName || 'Cliente'
      const companyName = order.contact_info?.companyName || ''
      const total = order.total || 0
      const validUntil = order.valid_until
        ? new Date(order.valid_until).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Por definir'

      const quotationItems: any[] = order.quotation_items || order.items || []

      const itemsHtml = quotationItems.map((item: any) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.product_name || item.product || item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${formatCurrency(item.subtotal || item.unit_price || 0)}</td>
        </tr>`
      ).join('')

      const quotationClientHtml = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Cotización ${quotationNumber}</title></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr><td style="background:#CE1818;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;">3A Branding</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Solicitud de Cotización Recibida</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p>Hola <strong>${contactName}</strong>${companyName ? ` de <strong>${companyName}</strong>` : ''},</p>
          <p style="color:#555;">Hemos recibido tu solicitud de cotización correctamente. En menos de 24 horas hábiles un asesor te enviará la propuesta formal con precios finales.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border:1px solid #fecaca;border-radius:6px;margin:20px 0;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Número de Cotización</p>
              <p style="margin:0;font-size:26px;font-weight:700;color:#CE1818;">${quotationNumber}</p>
              <p style="margin:6px 0 0;font-size:12px;color:#888;">Válida hasta: ${validUntil}</p>
            </td></tr>
          </table>
          ${quotationItems.length > 0 ? `
          <h3 style="font-size:16px;margin:24px 0 12px;">Productos solicitados</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;">
            <thead><tr style="background:#f7f7f7;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#666;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#666;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;">Estimado</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="text-align:right;font-size:16px;font-weight:700;color:#CE1818;margin-top:12px;">Estimado total: ${formatCurrency(total)}</p>
          ` : ''}
          <p style="margin-top:28px;color:#555;font-size:14px;">¿Tienes alguna duda? Responde este correo o contáctanos vía WhatsApp.</p>
        </td></tr>
        <tr><td style="background:#f7f7f7;padding:20px 40px;text-align:center;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:12px;color:#888;">© 2024 3A Branding Group S.A. de C.V. · CDMX, México</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

      const quotationAdminHtml = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;color:#333;padding:24px;">
  <h2 style="color:#CE1818;">Nueva Cotización — ${quotationNumber}</h2>
  <p><strong>Empresa:</strong> ${companyName || 'N/A'}</p>
  <p><strong>Contacto:</strong> ${contactName}</p>
  <p><strong>Email:</strong> ${clientEmail}</p>
  <p><strong>Teléfono:</strong> ${order.contact_info?.phone || ''}</p>
  <p><strong>Estimado:</strong> ${formatCurrency(total)}</p>
  <p><strong>Válida hasta:</strong> ${validUntil}</p>
  <hr/>
  <h3>Productos (${quotationItems.length})</h3>
  <ul>${quotationItems.map((i: any) => `<li>${i.product_name || i.product || i.name} × ${i.quantity}</li>`).join('')}</ul>
  ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
  <p style="margin-top:24px;"><a href="https://www.3abranding.com/admin?section=quotations" style="color:#CE1818;">Ver en Panel Admin →</a></p>
</body></html>`

      const sendPromises: Promise<any>[] = []

      if (clientEmail) {
        sendPromises.push(
          resend.emails.send({
            from: FROM_EMAIL,
            to: [clientEmail],
            subject: `Cotización ${quotationNumber} recibida — 3A Branding`,
            html: quotationClientHtml,
          })
        )
      }

      sendPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: [OPS_EMAIL, ANDREA_EMAIL],
          subject: `[Nueva Cotización] ${quotationNumber} — ${contactName}`,
          html: quotationAdminHtml,
        })
      )

      const results = await Promise.allSettled(sendPromises)
      const allOk = results.every((r) => r.status === 'fulfilled')

      return NextResponse.json({
        success: allOk,
        results: results.map((r) => r.status),
      })
    }

    return NextResponse.json({ success: false, error: 'Tipo de email no reconocido' }, { status: 400 })
  } catch (error) {
    console.error('Error en /api/send-email:', error)
    return NextResponse.json({ error: 'Error interno al enviar el correo' }, { status: 500 })
  }
}
