/**
 * POST /api/customizations  — guarda una propuesta de personalización
 * GET  /api/customizations?userId=... — lista propuestas del usuario
 *
 * El POST acepta:
 *   - productId: string
 *   - customizationData: object (estado JSON del canvas de Fabric.js)
 *   - previewDataUrl: string (imagen PNG en base64)
 *
 * La imagen se guarda en Supabase Storage (bucket "customizations").
 * El estado del canvas se guarda en la columna customization_data (JSONB).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configuración de Supabase incompleta')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ============================================
// POST — Guardar propuesta
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = getClient()
    const body = await request.json()
    const { productId, customizationData, previewDataUrl, userId } = body

    if (!productId || !customizationData) {
      return NextResponse.json(
        { error: 'productId y customizationData son requeridos' },
        { status: 400 }
      )
    }

    let previewImageUrl: string | null = null

    // Subir imagen de preview a Supabase Storage si se proporcionó
    if (previewDataUrl && typeof previewDataUrl === 'string') {
      try {
        const base64 = previewDataUrl.replace(/^data:image\/[a-z]+;base64,/, '')
        const buffer = Buffer.from(base64, 'base64')
        const fileName = `${userId || 'guest'}/${productId}-${Date.now()}.png`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('customizations')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: false,
          })

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('customizations')
            .getPublicUrl(uploadData.path)
          previewImageUrl = urlData.publicUrl
        } else {
          console.warn('[customizations] Error subiendo imagen:', uploadError?.message)
          // Guardar el data URL directamente como fallback (máx ~200KB para preview)
          previewImageUrl = previewDataUrl.length < 200_000 ? previewDataUrl : null
        }
      } catch (e) {
        console.warn('[customizations] Error procesando imagen:', e)
      }
    }

    const record = {
      user_id: userId || null,
      product_id: productId,
      customization_data: customizationData,
      preview_image_url: previewImageUrl,
      is_template: false,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('customizations')
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error('[customizations] Error insertando:', error)
      return NextResponse.json(
        {
          error: 'Error al guardar la propuesta',
          details: error.message,
          hint: error.code === '42P01'
            ? 'La tabla "customizations" no existe. Ejecuta la migración SQL.'
            : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, customization: data }, { status: 201 })
  } catch (error) {
    console.error('[customizations] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

// ============================================
// GET — Listar propuestas del usuario
// ============================================
export async function GET(request: NextRequest) {
  try {
    const supabase = getClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido', customizations: [] },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('customizations')
      .select('*, products(name, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[customizations] Error listando:', error)
      return NextResponse.json({ error: error.message, customizations: [] }, { status: 500 })
    }

    return NextResponse.json({ customizations: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno', customizations: [] },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE — Eliminar propuesta
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const { error } = await supabase.from('customizations').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
