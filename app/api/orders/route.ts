import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase con service role para bypassing RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verificar configuración
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno para Orders API:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
}

export async function POST(request: NextRequest) {
  try {
    // Verificar configuración
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes en POST /api/orders')
      return NextResponse.json(
        { 
          error: 'Configuración de Supabase incompleta',
          details: 'Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local'
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const orderData = await request.json()
    
    console.log('📦 Creando pedido:', orderData.id || 'nuevo')

    // Generar número de pedido único
    const orderNumber = orderData.id || `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`

    // Preparar datos del pedido principal
    const orderRecord = {
      order_number: orderNumber,
      status: orderData.status || 'pending',
      total: orderData.total || 0,
      subtotal: orderData.subtotal || 0,
      tax: orderData.taxes || 0,
      shipping_cost: orderData.shippingCost || 0,
      payment_method: orderData.paymentMethod || 'pending',
      contact_info: orderData.contact,
      shipping_info: orderData.shipping,
      billing_info: orderData.billing,
      user_id: orderData.userId || null, // null para usuarios sin sesión
      created_at: new Date().toISOString(),
    }

    // Insertar pedido principal
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderRecord)
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return NextResponse.json(
        { 
          error: 'Error al crear el pedido', 
          details: orderError.message,
          hint: orderError.code === '42P01' 
            ? 'La tabla "orders" no existe. Ejecuta la migración SQL en Supabase.' 
            : 'Verifica la configuración de Supabase y las tablas.'
        },
        { status: 500 }
      )
    }

    console.log('✅ Pedido creado:', order.id, order.order_number)

    // Insertar items del pedido
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice || 0,
        subtotal: item.subtotal || 0,
        variation_label: item.variationLabel || null,
        image_url: item.image || null,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('⚠️ Error creating order items:', itemsError)
        // No hacemos rollback, el pedido ya se creó
        return NextResponse.json(
          { 
            success: true, 
            order, 
            warning: 'Pedido creado pero hubo un problema con los items',
            details: itemsError.message,
            hint: itemsError.code === '42P01' 
              ? 'La tabla "order_items" no existe. Ejecuta la migración SQL en Supabase.' 
              : undefined
          },
          { status: 201 }
        )
      }
      
      console.log('✅ Items del pedido creados:', orderItems.length)
    }

    console.log('✅ Pedido completado exitosamente:', order.order_number)

    return NextResponse.json(
      { 
        success: true, 
        order,
        message: 'Pedido creado exitosamente' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar configuración
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes en GET /api/orders')
      return NextResponse.json(
        { 
          error: 'Configuración de Supabase incompleta',
          details: 'Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local',
          orders: []
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    console.log('📥 Cargando pedidos desde Supabase...')

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (orderId) {
      query = query.eq('id', orderId).single()
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching orders:', error)
      return NextResponse.json(
        { 
          error: 'Error al obtener pedidos', 
          details: error.message,
          hint: error.code === '42P01' 
            ? 'La tabla "orders" no existe. Ejecuta la migración SQL en Supabase.' 
            : 'Verifica la configuración y permisos de Supabase.',
          orders: []
        },
        { status: 500 }
      )
    }

    const orders = Array.isArray(data) ? data : (data ? [data] : [])
    console.log('✅ Pedidos obtenidos:', orders.length)

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Error in GET /api/orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verificar configuración
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes en PATCH /api/orders')
      return NextResponse.json(
        { 
          error: 'Configuración de Supabase incompleta',
          details: 'Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local'
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId es requerido' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status es requerido' },
        { status: 400 }
      )
    }

    console.log('📝 Actualizando pedido:', orderId, 'a estado:', status)

    // Actualizar el estado del pedido
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating order:', error)
      return NextResponse.json(
        { 
          error: 'Error al actualizar el pedido', 
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ Pedido actualizado:', data.order_number)

    return NextResponse.json({
      success: true,
      order: data,
      message: 'Pedido actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error in PATCH /api/orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
