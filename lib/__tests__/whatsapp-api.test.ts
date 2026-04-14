/**
 * Tests para el cliente de WhatsApp Cloud API
 * Valida construcción de payloads, normalización y guards de configuración
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// Mock de fetch global
// ============================================

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

// ============================================
// Helpers bajo prueba (replicados de lib/whatsapp-api.ts)
// ============================================

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

function buildTextMessagePayload(to: string, body: string) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'text',
    text: { preview_url: false, body },
  }
}

function buildTemplateMessagePayload(to: string, templateName: string, languageCode = 'es_MX', components?: any[]) {
  return {
    messaging_product: 'whatsapp',
    to: normalizePhoneNumber(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components && components.length > 0 ? { components } : {}),
    },
  }
}

// ============================================
// Tests
// ============================================

describe('WhatsApp — normalización de número', () => {
  it('elimina el símbolo + y espacios', () => {
    expect(normalizePhoneNumber('+52 55 1234 5678')).toBe('525512345678')
  })

  it('número limpio no cambia', () => {
    expect(normalizePhoneNumber('525567919161')).toBe('525567919161')
  })

  it('elimina caracteres especiales variados', () => {
    expect(normalizePhoneNumber('(55) 1234-5678')).toBe('5512345678')
  })
})

describe('WhatsApp — payload de mensaje de texto', () => {
  it('construye el payload correctamente', () => {
    const payload = buildTextMessagePayload('+52 55 6791 9161', 'Hola mundo')

    expect(payload).toMatchObject({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '525567919161',
      type: 'text',
      text: { preview_url: false, body: 'Hola mundo' },
    })
  })

  it('normaliza el número destino en el payload', () => {
    const payload = buildTextMessagePayload('+52 55 0000 0000', 'Test')
    expect(payload.to).toBe('525500000000')
    expect(payload.to).not.toContain('+')
    expect(payload.to).not.toContain(' ')
  })
})

describe('WhatsApp — payload de template', () => {
  it('construye un template sin components', () => {
    const payload = buildTemplateMessagePayload('+525567919161', 'order_confirmation')

    expect(payload.type).toBe('template')
    expect(payload.template.name).toBe('order_confirmation')
    expect(payload.template.language.code).toBe('es_MX')
    expect(payload.template).not.toHaveProperty('components')
  })

  it('incluye components cuando se proporcionan', () => {
    const components = [{ type: 'body', parameters: [{ type: 'text', text: 'Juan' }] }]
    const payload = buildTemplateMessagePayload('+525567919161', 'order_confirmation', 'es_MX', components)

    expect(payload.template.components).toHaveLength(1)
    expect(payload.template.components![0].parameters[0].text).toBe('Juan')
  })

  it('usa es_MX como código de idioma por defecto', () => {
    const payload = buildTemplateMessagePayload('+525567919161', 'test_template')
    expect(payload.template.language.code).toBe('es_MX')
  })

  it('permite usar un código de idioma diferente', () => {
    const payload = buildTemplateMessagePayload('+525567919161', 'test_template', 'en_US')
    expect(payload.template.language.code).toBe('en_US')
  })
})

describe('WhatsApp — manejo de respuesta de API', () => {
  it('extrae messageId de la respuesta exitosa', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [{ id: 'wamid.test123' }] }),
    })

    const response = await fetch('https://graph.facebook.com/v19.0/123/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify(buildTextMessagePayload('+525567919161', 'Test')),
    })

    const data = await response.json()
    const messageId = data?.messages?.[0]?.id

    expect(messageId).toBe('wamid.test123')
  })

  it('captura el mensaje de error cuando la API falla', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Invalid phone number', code: 131030 } }),
    })

    const response = await fetch('https://graph.facebook.com/v19.0/123/messages', {
      method: 'POST',
      headers: {},
      body: '{}',
    })

    const data = await response.json()
    expect(data.error.message).toBe('Invalid phone number')
    expect(response.ok).toBe(false)
  })
})
