import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email, papeis } = await req.json()
  if (!email || !papeis) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  // Verifica se usuário já existe no Auth
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find((u: any) => u.email === email)

  let userId: string

  if (existingUser) {
    // Já existe — apenas registra/atualiza no admin_users
    userId = existingUser.id
  } else {
    // Novo usuário — envia convite com redirect para o admin
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://taschibra-store.vercel.app/admin'
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    userId = data.user.id
  }

  await supabaseAdmin.from('admin_users').upsert({
    email,
    user_id: userId,
    role: 'admin',
    papeis,
    ativo: true,
    status: existingUser ? 'ativo' : 'aguardando'
  }, { onConflict: 'email' })

  await supabaseAdmin.from('audit_log').insert({
    user_email: email,
    acao: 'convite_enviado',
    entidade: 'admin_users',
    detalhe: `Papéis: ${papeis.join(', ')}`
  })

  return NextResponse.json({ ok: true })
}
