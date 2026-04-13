import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { id, ...payload } = await req.json()
    if (id) {
      const { error } = await supabase.from('popup_promos').update(payload).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('popup_promos').insert(payload)
      if (error) throw error
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
