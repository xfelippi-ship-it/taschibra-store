import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email, papeis } = await req.json()
  if (!email || !papeis) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: 'https://taschibra-store.vercel.app/admin'
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabaseAdmin.from('admin_users').upsert({
    email,
    user_id: data.user.id,
    role: 'admin',
    papeis,
    ativo: true,
    status: 'aguardando'
  }, { onConflict: 'email' })

  await supabaseAdmin.from('audit_log').insert({
    user_email: email,
    acao: 'convite_enviado',
    entidade: 'admin_users',
    detalhe: `Papéis: ${papeis.join(', ')}`
  })

  return NextResponse.json({ ok: true })
}
