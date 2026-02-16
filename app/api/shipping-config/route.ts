import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase incompleta' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Obtener todas las configuraciones de envío
    const { data, error } = await supabase
      .from('shipping_configuration')
      .select('*')

    if (error) {
      console.error('Error fetching shipping config:', error)
      return NextResponse.json(
        { error: 'Error al obtener configuración' },
        { status: 500 }
      )
    }

    // Transformar en objeto con keys
    const config: any = {}
    data?.forEach((item: any) => {
      config[item.config_key] = item.config_value
    })

    return NextResponse.json(config)

  } catch (error) {
    console.error('Error in GET /api/shipping-config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase incompleta' },
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

    // Preparar actualizaciones
    const updates = [
      {
        config_key: 'shipping_methods',
        config_value: body.methods || {},
      },
      {
        config_key: 'shipping_zones',
        config_value: body.zones || {},
      },
      {
        config_key: 'shipping_general',
        config_value: body.general || {},
      },
      {
        config_key: 'shipping_restrictions',
        config_value: body.restrictions || {},
      },
      {
        config_key: 'shipping_notifications',
        config_value: body.notifications || {},
      },
    ]

    // Actualizar cada configuración
    for (const update of updates) {
      const { error } = await supabase
        .from('shipping_configuration')
        .upsert(update, { onConflict: 'config_key' })

      if (error) {
        console.error(`Error updating ${update.config_key}:`, error)
        return NextResponse.json(
          { error: `Error al actualizar ${update.config_key}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración actualizada exitosamente' 
    })

  } catch (error) {
    console.error('Error in POST /api/shipping-config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
