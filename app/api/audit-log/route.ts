import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const { executedBy, acao, entidade, detalhe, valorAntes, valorDepois } = await req.json()
  await supabaseAdmin.from('audit_log').insert({
    executed_by: executedBy,
    user_email: entidade === 'admin_users' ? detalhe : executedBy,
    acao,
    entidade,
    detalhe,
    valor_antes: valorAntes || null,
    valor_depois: valorDepois || null,
  })
  return NextResponse.json({ ok: true })
}
