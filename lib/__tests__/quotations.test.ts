/**
 * Tests para el módulo de cotizaciones
 * Valida generación de número de cotización, mapeo de ítems y cálculo de totales
 */

import { describe, it, expect } from 'vitest'

// ============================================
// Helpers bajo prueba
// ============================================

function generateQuotationNumber(year?: number): string {
  const y = year ?? new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000 + 10000)
  return `COT-${y}-${random}`
}

function mapQuoteItemsToDb(quoteItems: any[], quotationId: string) {
  return quoteItems.map((item: any) => ({
    quotation_id: quotationId,
    product_id: item.productId || null,
    product_name: item.product || item.name || 'Producto personalizado',
    quantity: item.quantity || 1,
    unit_price: item.unitPrice || 0,
    subtotal: item.total || (item.unitPrice || 0) * (item.quantity || 1),
    customization: item.customization || null,
    image_url: null,
    customization_data: item.customizationData || {},
  }))
}

function calculateQuotationTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  discountPct = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discountAmount = subtotal * (discountPct / 100)
  const total = subtotal - discountAmount
  return { subtotal, discountAmount, total }
}

// ============================================
// Tests
// ============================================

describe('Número de cotización', () => {
  it('tiene el formato COT-YYYY-NNNNN', () => {
    const num = generateQuotationNumber(2026)
    expect(num).toMatch(/^COT-2026-\d{5}$/)
  })

  it('usa el año actual si no se especifica', () => {
    const num = generateQuotationNumber()
    const year = new Date().getFullYear()
    expect(num).toMatch(new RegExp(`^COT-${year}-\\d{5}$`))
  })

  it('el número aleatorio tiene exactamente 5 dígitos', () => {
    for (let i = 0; i < 20; i++) {
      const num = generateQuotationNumber(2026)
      const parts = num.split('-')
      expect(parts[2]).toHaveLength(5)
    }
  })
})

describe('Mapeo de ítems a quotation_items', () => {
  const quotationId = 'test-quotation-uuid'

  it('mapea correctamente un ítem con producto explícito', () => {
    const items = [{ product: 'Taza Ecológica', quantity: 50, unitPrice: 120, total: 6000, productId: 'PROD-001' }]
    const mapped = mapQuoteItemsToDb(items, quotationId)

    expect(mapped[0]).toMatchObject({
      quotation_id: quotationId,
      product_id: 'PROD-001',
      product_name: 'Taza Ecológica',
      quantity: 50,
      unit_price: 120,
      subtotal: 6000,
    })
  })

  it('product_id es null para ítems libres (sin productId)', () => {
    const items = [{ product: 'Producto libre', quantity: 1, unitPrice: 100 }]
    const mapped = mapQuoteItemsToDb(items, quotationId)
    expect(mapped[0].product_id).toBeNull()
  })

  it('calcula subtotal automáticamente si no se proporciona total', () => {
    const items = [{ product: 'Test', quantity: 5, unitPrice: 200 }]
    const mapped = mapQuoteItemsToDb(items, quotationId)
    expect(mapped[0].subtotal).toBe(1000)
  })

  it('usa quantity mínimo de 1 si no se especifica', () => {
    const items = [{ product: 'Test', unitPrice: 100 }]
    const mapped = mapQuoteItemsToDb(items, quotationId)
    expect(mapped[0].quantity).toBe(1)
  })

  it('mapea múltiples ítems correctamente', () => {
    const items = [
      { product: 'A', quantity: 10, unitPrice: 50 },
      { product: 'B', quantity: 20, unitPrice: 80 },
    ]
    const mapped = mapQuoteItemsToDb(items, quotationId)
    expect(mapped).toHaveLength(2)
    expect(mapped[0].product_name).toBe('A')
    expect(mapped[1].product_name).toBe('B')
  })
})

describe('Cálculo de totales de cotización', () => {
  it('calcula subtotal correctamente', () => {
    const { subtotal } = calculateQuotationTotals([
      { quantity: 100, unitPrice: 50 },
      { quantity: 50, unitPrice: 120 },
    ])
    expect(subtotal).toBe(11000) // 5000 + 6000
  })

  it('aplica descuento por porcentaje', () => {
    const { subtotal, discountAmount, total } = calculateQuotationTotals(
      [{ quantity: 100, unitPrice: 100 }],
      10
    )
    expect(subtotal).toBe(10000)
    expect(discountAmount).toBe(1000)
    expect(total).toBe(9000)
  })

  it('sin descuento: total === subtotal', () => {
    const { subtotal, total } = calculateQuotationTotals([{ quantity: 5, unitPrice: 200 }])
    expect(total).toBe(subtotal)
  })

  it('descuento de 0% no afecta el total', () => {
    const { subtotal, discountAmount, total } = calculateQuotationTotals(
      [{ quantity: 10, unitPrice: 500 }],
      0
    )
    expect(discountAmount).toBe(0)
    expect(total).toBe(subtotal)
  })
})
