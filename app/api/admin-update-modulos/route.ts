import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { id, modulos, executedBy } = await req.json()
    if (!id || !modulos) return NextResponse.json({ error: 'Dados obrigatorios' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ modulos })
      .eq('id', id)

    if (error) throw error

    await supabaseAdmin.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'modulos_alterados',
      entity: 'admin_users',
      entity_id: id,
      details: 'Modulos: ' + modulos.join(', '),
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[admin-update-modulos]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
