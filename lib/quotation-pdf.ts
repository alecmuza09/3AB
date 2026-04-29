/**
 * Generador de HTML imprimible para cotizaciones.
 *
 * Estrategia: en lugar de instalar jsPDF y agrandar el bundle, abrimos una
 * ventana nueva con un documento autocontenido (HTML + CSS) y disparamos
 * `window.print()`. El usuario puede imprimir físico, o elegir "Guardar
 * como PDF" en el diálogo del navegador (estándar en Chrome/Safari/Edge).
 *
 * Ventajas:
 * - 0 dependencias nuevas.
 * - Se ve igual en pantalla y en PDF.
 * - Funciona offline.
 *
 * Uso:
 *   import { openQuotationPrint } from '@/lib/quotation-pdf'
 *   openQuotationPrint(quotation, { brand: '3A Branding' })
 */

type QuotationLike = {
  quotation_number?: string
  status?: string
  created_at?: string
  valid_until?: string | null
  subtotal?: number | string | null
  taxes?: number | string | null
  shipping_cost?: number | string | null
  discount?: number | string | null
  total?: number | string | null
  currency?: string | null
  contact_info?: any
  notes?: string | null
  quotation_items?: any[]
  admin_notes?: string | null
}

type PrintOptions = {
  brand?: string
  brandTagline?: string
  brandColor?: string
  contactPhone?: string
  contactEmail?: string
  contactSite?: string
  logoUrl?: string | null
}

const DEFAULT_OPTS: Required<PrintOptions> = {
  brand: '3A Branding',
  brandTagline: 'Productos promocionales y soluciones corporativas',
  brandColor: '#c81e2c',
  contactPhone: '+52 55 0000 0000',
  contactEmail: 'contacto@3abranding.com',
  contactSite: '3abranding.com',
  logoUrl: null,
}

function escapeHtml(input: unknown): string {
  if (input == null) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMoney(n: unknown, currency = 'MXN'): string {
  const num = Number(n) || 0
  const formatted = num.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `$${formatted} ${currency}`
}

function formatDate(value: unknown): string {
  if (!value) return '—'
  try {
    const d = new Date(value as string)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Expirada',
  converted: 'Convertida',
}

export function buildQuotationHtml(
  q: QuotationLike,
  opts: PrintOptions = {}
): string {
  const o = { ...DEFAULT_OPTS, ...opts }
  const ci = q.contact_info || {}
  const items = Array.isArray(q.quotation_items) ? q.quotation_items : []
  const currency = q.currency || 'MXN'

  const subtotal = Number(q.subtotal) || 0
  const discount = Number(q.discount) || 0
  const taxes = Number(q.taxes) || 0
  const shipping = Number(q.shipping_cost) || 0
  const total = Number(q.total) || 0

  const itemsRows = items
    .map((it: any, idx: number) => {
      const name = it.product_name || it.product || it.name || '—'
      const sku = it.product_sku || it.sku || ''
      const qty = Number(it.quantity) || 0
      const unit = Number(it.unit_price ?? it.unitPrice) || 0
      const sub = Number(it.subtotal ?? it.total) || qty * unit
      const customization =
        it.customization_data?.description ||
        it.customization ||
        ''
      return `
        <tr>
          <td class="num">${idx + 1}</td>
          <td>
            <div class="product-name">${escapeHtml(name)}</div>
            ${sku ? `<div class="product-sku">SKU: ${escapeHtml(sku)}</div>` : ''}
            ${customization ? `<div class="product-cust">${escapeHtml(customization)}</div>` : ''}
          </td>
          <td class="num">${qty}</td>
          <td class="num">${formatMoney(unit, currency)}</td>
          <td class="num strong">${formatMoney(sub, currency)}</td>
        </tr>
      `
    })
    .join('')

  const statusLabel = STATUS_LABELS[q.status || ''] || q.status || ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cotización ${escapeHtml(q.quotation_number || '')} — ${escapeHtml(o.brand)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      background: #f4f4f4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: 800px;
      margin: 24px auto;
      background: #fff;
      padding: 40px 48px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.08);
      border-radius: 4px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      border-bottom: 3px solid ${o.brandColor};
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .brand h1 {
      margin: 0 0 4px 0;
      font-size: 28px;
      letter-spacing: -0.5px;
      color: ${o.brandColor};
      font-weight: 800;
    }
    .brand .tagline {
      margin: 0;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .brand .contact-line {
      margin-top: 10px;
      font-size: 11px;
      color: #444;
      line-height: 1.5;
    }
    .doc-meta {
      text-align: right;
      min-width: 200px;
    }
    .doc-meta .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #999;
      margin-bottom: 2px;
    }
    .doc-meta .number {
      font-size: 22px;
      font-weight: 700;
      font-family: 'SF Mono', Menlo, Consolas, monospace;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    .doc-meta .date {
      font-size: 12px;
      color: #555;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 6px;
    }
    .badge.draft   { background: #f1f1f1; color: #555; }
    .badge.sent    { background: #dbeafe; color: #1e40af; }
    .badge.accepted{ background: #d1fae5; color: #065f46; }
    .badge.rejected{ background: #fee2e2; color: #991b1b; }
    .badge.expired { background: #fef3c7; color: #92400e; }
    .badge.converted { background: #ede9fe; color: #5b21b6; }

    .client-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
      border: 1px solid #eee;
    }
    .client-grid .col h3 {
      margin: 0 0 10px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
    }
    .client-grid .field {
      margin-bottom: 8px;
      font-size: 13px;
    }
    .client-grid .field-label {
      color: #777;
      font-size: 11px;
      margin-right: 4px;
    }
    .client-grid .field-value {
      color: #1a1a1a;
      font-weight: 500;
    }

    table.items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    table.items thead th {
      background: ${o.brandColor};
      color: #fff;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    table.items thead th.num { text-align: right; }
    table.items tbody td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
      vertical-align: top;
    }
    table.items tbody td.num { text-align: right; white-space: nowrap; }
    table.items tbody td.strong { font-weight: 600; }
    .product-name { font-weight: 500; }
    .product-sku { font-size: 11px; color: #888; font-family: 'SF Mono', monospace; margin-top: 2px; }
    .product-cust { font-size: 11px; color: #666; font-style: italic; margin-top: 4px; }

    .totals {
      width: 320px;
      margin-left: auto;
      margin-bottom: 28px;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .totals .row .label { color: #666; }
    .totals .row .value { font-weight: 500; }
    .totals .row.discount .value { color: #b91c1c; }
    .totals .row.total {
      border-top: 2px solid ${o.brandColor};
      margin-top: 8px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 700;
    }
    .totals .row.total .value { color: ${o.brandColor}; }

    .notes {
      background: #fafafa;
      border-left: 4px solid ${o.brandColor};
      padding: 14px 16px;
      margin-bottom: 18px;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      border-radius: 4px;
      white-space: pre-wrap;
    }
    .notes h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
    }

    .footer {
      margin-top: 32px;
      border-top: 1px solid #eee;
      padding-top: 16px;
      font-size: 10px;
      color: #999;
      text-align: center;
      line-height: 1.6;
    }
    .footer strong { color: ${o.brandColor}; }

    .actions-bar {
      max-width: 800px;
      margin: 16px auto 0 auto;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .actions-bar button {
      padding: 8px 14px;
      font-size: 13px;
      border-radius: 6px;
      border: 1px solid #ddd;
      background: #fff;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s;
    }
    .actions-bar button:hover { background: #f5f5f5; }
    .actions-bar button.primary {
      background: ${o.brandColor};
      color: #fff;
      border-color: ${o.brandColor};
    }
    .actions-bar button.primary:hover { opacity: 0.9; }

    @media print {
      body { background: #fff; }
      .page { box-shadow: none; margin: 0; max-width: 100%; padding: 24px 32px; }
      .actions-bar { display: none !important; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button onclick="window.print()" class="primary">🖨 Imprimir / Guardar PDF</button>
    <button onclick="window.close()">Cerrar</button>
  </div>

  <div class="page">
    <header class="header">
      <div class="brand">
        <h1>${escapeHtml(o.brand)}</h1>
        <p class="tagline">${escapeHtml(o.brandTagline)}</p>
        <div class="contact-line">
          ${escapeHtml(o.contactPhone)} · ${escapeHtml(o.contactEmail)} · ${escapeHtml(o.contactSite)}
        </div>
      </div>
      <div class="doc-meta">
        <div class="label">Cotización</div>
        <div class="number">${escapeHtml(q.quotation_number || '—')}</div>
        <div class="date">Emitida: ${formatDate(q.created_at)}</div>
        ${q.valid_until ? `<div class="date">Vigente: ${formatDate(q.valid_until)}</div>` : ''}
        ${
          statusLabel
            ? `<span class="badge ${escapeHtml(q.status || 'draft')}">${escapeHtml(statusLabel)}</span>`
            : ''
        }
      </div>
    </header>

    <div class="client-grid">
      <div class="col">
        <h3>Cliente</h3>
        ${ci.contactName ? `<div class="field"><span class="field-value">${escapeHtml(ci.contactName)}</span></div>` : ''}
        ${ci.companyName ? `<div class="field"><span class="field-value">${escapeHtml(ci.companyName)}</span></div>` : ''}
        ${ci.email ? `<div class="field"><span class="field-label">Email:</span><span class="field-value">${escapeHtml(ci.email)}</span></div>` : ''}
        ${ci.phone ? `<div class="field"><span class="field-label">Tel:</span><span class="field-value">${escapeHtml(ci.phone)}</span></div>` : ''}
        ${ci.taxId ? `<div class="field"><span class="field-label">RFC:</span><span class="field-value">${escapeHtml(ci.taxId)}</span></div>` : ''}
      </div>
      <div class="col">
        <h3>Detalles del proyecto</h3>
        ${ci.eventType ? `<div class="field"><span class="field-label">Tipo:</span><span class="field-value">${escapeHtml(ci.eventType)}</span></div>` : ''}
        ${ci.deliveryDate ? `<div class="field"><span class="field-label">Entrega:</span><span class="field-value">${formatDate(ci.deliveryDate)}</span></div>` : ''}
        ${ci.deliveryAddress ? `<div class="field"><span class="field-label">Dirección:</span><span class="field-value">${escapeHtml(ci.deliveryAddress)}</span></div>` : ''}
        ${ci.paymentTerms ? `<div class="field"><span class="field-label">Pago:</span><span class="field-value">${escapeHtml(ci.paymentTerms)}</span></div>` : ''}
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th class="num" style="width: 32px;">#</th>
          <th>Producto / descripción</th>
          <th class="num" style="width: 70px;">Cant.</th>
          <th class="num" style="width: 110px;">Precio unit.</th>
          <th class="num" style="width: 130px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows || `<tr><td colspan="5" style="text-align:center; padding: 32px; color: #999;">Sin productos</td></tr>`}
      </tbody>
    </table>

    <div class="totals">
      <div class="row">
        <span class="label">Subtotal</span>
        <span class="value">${formatMoney(subtotal, currency)}</span>
      </div>
      ${
        discount > 0
          ? `<div class="row discount">
              <span class="label">Descuento</span>
              <span class="value">−${formatMoney(discount, currency)}</span>
            </div>`
          : ''
      }
      ${
        taxes > 0
          ? `<div class="row">
              <span class="label">IVA</span>
              <span class="value">${formatMoney(taxes, currency)}</span>
            </div>`
          : ''
      }
      ${
        shipping > 0
          ? `<div class="row">
              <span class="label">Envío</span>
              <span class="value">${formatMoney(shipping, currency)}</span>
            </div>`
          : ''
      }
      <div class="row total">
        <span class="label">TOTAL</span>
        <span class="value">${formatMoney(total, currency)}</span>
      </div>
    </div>

    ${
      q.notes
        ? `<div class="notes">
            <h4>Notas y términos</h4>
            ${escapeHtml(q.notes)}
          </div>`
        : ''
    }

    <div class="footer">
      Esta cotización es válida hasta el ${formatDate(q.valid_until)} ·
      Precios sujetos a disponibilidad de inventario.<br/>
      Generado por <strong>${escapeHtml(o.brand)}</strong>
    </div>
  </div>

  <script>
    // Auto-imprimir después de cargar (puede comentarse si molesta)
    // window.addEventListener('load', () => setTimeout(() => window.print(), 500))
  </script>
</body>
</html>`
}

/**
 * Abre la cotización en una ventana nueva lista para imprimir / guardar PDF.
 */
export function openQuotationPrint(
  q: QuotationLike,
  opts?: PrintOptions
): void {
  if (typeof window === 'undefined') return
  const html = buildQuotationHtml(q, opts)
  const win = window.open('', '_blank', 'width=900,height=1000')
  if (!win) {
    alert(
      'El navegador bloqueó la ventana emergente. Permite las ventanas para 3abranding.com y vuelve a intentarlo.'
    )
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}
