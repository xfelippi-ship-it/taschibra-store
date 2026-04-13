import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — lista anotações do pedido
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('order_notes')
    .select('id, note, created_by, created_at')
    .eq('order_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data })
}

// POST — cria nova anotação
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { note, createdBy } = await req.json()

    if (!note?.trim()) {
      return NextResponse.json({ error: 'Anotação não pode ser vazia' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('order_notes')
      .insert({
        order_id:   params.id,
        note:       note.trim(),
        created_by: createdBy || 'admin',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, note: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove anotação pelo id passado no body
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { noteId } = await req.json()
  await supabase.from('order_notes').delete().eq('id', noteId).eq('order_id', params.id)
  return NextResponse.json({ ok: true })
}