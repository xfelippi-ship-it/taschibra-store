import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data } = await supabase
      .from('order_notes')
      .select('id, note, created_by, created_at')
      .eq('order_id', params.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ notes: data || [] })
  } catch (err: any) {
    return NextResponse.json({ notes: [], error: err.message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { note, createdBy } = await req.json()

    if (!note?.trim()) {
      return NextResponse.json({ error: 'Nota vazia' }, { status: 400 })
    }

    const { error } = await supabase.from('order_notes').insert({
      order_id: params.id,
      note: note.trim(),
      created_by: createdBy || 'admin',
      created_at: new Date().toISOString(),
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
) {
  try {
    const { noteId } = await req.json()

    if (!noteId) {
      return NextResponse.json({ error: 'noteId obrigatório' }, { status: 400 })
    }

    const { error } = await supabase.from('order_notes').delete().eq('id', noteId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
