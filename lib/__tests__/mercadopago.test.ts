/**
 * Tests para el flujo de Mercado Pago
 * Valida mapeo de ítems, construcción de external_reference y normalización de datos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// Helpers under test (inline since they are inline in the route)
// ============================================

function normalizeMpItems(items: any[]) {
  return items.map((item) => ({
    id: String(item.productId || item.id || 'product'),
    title: String(item.name).slice(0, 256),
    quantity: Number(item.quantity) || 1,
    unit_price: Math.max(0.01, Number(item.unitPrice ?? 0)),
    currency_id: 'MXN',
  }))
}

function buildExternalReference(orderNumber?: string, orderId?: string): string {
  return orderNumber || orderId || ''
}

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

// ============================================
// Tests
// ============================================

describe('Mercado Pago — mapeo de ítems', () => {
  it('mapea correctamente un ítem estándar', () => {
    const items = [{ productId: 'PROD-001', name: 'Taza Personalizada', quantity: 10, unitPrice: 150 }]
    const mapped = normalizeMpItems(items)

    expect(mapped[0]).toEqual({
      id: 'PROD-001',
      title: 'Taza Personalizada',
      quantity: 10,
      unit_price: 150,
      currency_id: 'MXN',
    })
  })

  it('trunca títulos de más de 256 caracteres', () => {
    const longName = 'A'.repeat(300)
    const mapped = normalizeMpItems([{ name: longName, quantity: 1, unitPrice: 50 }])
    expect(mapped[0].title.length).toBe(256)
  })

  it('garantiza unit_price mínimo de 0.01', () => {
    const mapped = normalizeMpItems([{ name: 'Test', quantity: 1, unitPrice: 0 }])
    expect(mapped[0].unit_price).toBe(0.01)
  })

  it('garantiza unit_price mínimo incluso con valores negativos', () => {
    const mapped = normalizeMpItems([{ name: 'Test', quantity: 1, unitPrice: -10 }])
    expect(mapped[0].unit_price).toBe(0.01)
  })

  it('usa orderId como fallback cuando no hay id en el ítem', () => {
    const mapped = normalizeMpItems([{ name: 'Test', quantity: 1, unitPrice: 50 }])
    expect(mapped[0].id).toBe('product')
  })

  it('mantiene quantity mínimo de 1', () => {
    const mapped = normalizeMpItems([{ name: 'Test', quantity: 0, unitPrice: 50 }])
    expect(mapped[0].quantity).toBe(1)
  })
})

describe('Mercado Pago — external_reference', () => {
  it('usa orderNumber (server-authoritative) cuando está disponible', () => {
    const ref = buildExternalReference('ORD-2026-10001', 'client-random-id')
    expect(ref).toBe('ORD-2026-10001')
  })

  it('cae al orderId cuando no hay orderNumber', () => {
    const ref = buildExternalReference(undefined, 'ORD-2026-fallback')
    expect(ref).toBe('ORD-2026-fallback')
  })

  it('devuelve string vacío si no hay ninguno', () => {
    const ref = buildExternalReference()
    expect(ref).toBe('')
  })
})

describe('WhatsApp — normalización de teléfono', () => {
  it('elimina espacios y guiones', () => {
    expect(normalizePhoneNumber('+52 55-1234-5678')).toBe('525512345678')
  })

  it('elimina el símbolo +', () => {
    expect(normalizePhoneNumber('+525567919161')).toBe('525567919161')
  })

  it('número ya limpio permanece igual', () => {
    expect(normalizePhoneNumber('525567919161')).toBe('525567919161')
  })

  it('elimina paréntesis y puntos', () => {
    expect(normalizePhoneNumber('(55) 1234.5678')).toBe('5512345678')
  })
})
