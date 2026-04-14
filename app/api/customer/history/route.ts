/**
 * GET /api/customer/history?userId=...
 *
 * Devuelve en una sola llamada los pedidos y cotizaciones del cliente
 * desde Supabase. Requiere userId como query param.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Configuración de Supabase incompleta', orders: [], quotations: [] },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId es requerido', orders: [], quotations: [] },
      { status: 400 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const [ordersResult, quotationsResult] = await Promise.allSettled([
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const orders =
    ordersResult.status === 'fulfilled' && !ordersResult.value.error
      ? ordersResult.value.data ?? []
      : []

  const quotations =
    quotationsResult.status === 'fulfilled' && !quotationsResult.value.error
      ? quotationsResult.value.data ?? []
      : []

  if (ordersResult.status === 'fulfilled' && ordersResult.value.error) {
    console.error('[customer/history] Error fetching orders:', ordersResult.value.error.message)
  }
  if (quotationsResult.status === 'fulfilled' && quotationsResult.value.error) {
    console.error('[customer/history] Error fetching quotations:', quotationsResult.value.error.message)
  }

  return NextResponse.json({ orders, quotations })
}
