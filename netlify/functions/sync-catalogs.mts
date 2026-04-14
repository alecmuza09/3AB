/**
 * Netlify Scheduled Function — sincronización automática de catálogos
 *
 * Se ejecuta cada 6 horas. Dispara los endpoints de sync de 4Promotional
 * y 3A Promoción pasando el CRON_SECRET para autenticación.
 *
 * Para activar, agrega en netlify.toml:
 *   [functions.sync-catalogs]
 *     schedule = "0 */6 * * *"
 *
 * Variables de entorno requeridas:
 *   CRON_SECRET     — secreto compartido para autorizar la llamada
 *   NEXT_PUBLIC_SITE_URL — URL base del sitio (ej. https://3abranding.com)
 */

import type { Config } from '@netlify/functions'

export default async () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || ''
  const cronSecret = process.env.CRON_SECRET || ''

  if (!siteUrl) {
    console.error('NEXT_PUBLIC_SITE_URL no está configurado')
    return
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (cronSecret) {
    headers['x-cron-secret'] = cronSecret
  }

  const results: Array<{ endpoint: string; status: number; ok: boolean }> = []

  for (const endpoint of ['/api/sync-products', '/api/sync-promocion']) {
    try {
      const res = await fetch(`${siteUrl}${endpoint}`, {
        method: 'POST',
        headers,
      })
      results.push({ endpoint, status: res.status, ok: res.ok })
      console.log(`[sync-catalogs] ${endpoint}: ${res.status}`)
    } catch (err) {
      console.error(`[sync-catalogs] Error en ${endpoint}:`, err)
      results.push({ endpoint, status: 0, ok: false })
    }
  }

  const allOk = results.every((r) => r.ok)
  console.log('[sync-catalogs] Sincronización completada:', allOk ? 'exitosa' : 'con errores', results)
}

export const config: Config = {
  schedule: '0 */6 * * *',
}
