import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function gerarSenhaTemporaria(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const nums  = '23456789'
  const syms  = '@#$%&*!'
  const all   = upper + lower + nums + syms
  let senha = ''
  senha += upper[Math.floor(Math.random() * upper.length)]
  senha += lower[Math.floor(Math.random() * lower.length)]
  senha += nums[Math.floor(Math.random() * nums.length)]
  senha += syms[Math.floor(Math.random() * syms.length)]
  for (let i = 4; i < 8; i++) {
    senha += all[Math.floor(Math.random() * all.length)]
  }
  return senha.split('').sort(() => Math.random() - 0.5).join('')
}

export async function POST(req: Request) {
  try {
    const { email, papeis, modulos } = await req.json()
    if (!email) return NextResponse.json({ error: 'E-mail obrigatorio' }, { status: 400 })

    const senhaTemp = gerarSenhaTemporaria()

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: senhaTemp,
        email_confirm: true,
      })
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senhaTemp,
        email_confirm: true,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      userId = data.user.id
    }

    const { data: existing } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('admin_users')
        .update({
          papeis: papeis || ['custom'],
          modulos: modulos || ['dashboard', 'pedidos', 'relatorios'],
          ativo: true,
          user_id: userId,
          status: 'ativo',
          trocar_senha: true,
        })
        .eq('email', email)
    } else {
      await supabaseAdmin
        .from('admin_users')
        .insert({
          email,
          user_id: userId,
          role: 'admin',
          papeis: papeis || ['custom'],
          modulos: modulos || ['dashboard', 'pedidos', 'relatorios'],
          ativo: true,
          status: 'ativo',
          trocar_senha: true,
        })
    }

    await supabaseAdmin.from('audit_logs').insert({
      executed_by: 'admin',
      action: 'convite_enviado',
      entity: 'admin_users',
      entity_id: userId,
      details: 'Convite: ' + email + ' | Senha temporaria gerada | Papeis: ' + (papeis || []).join(', '),
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      email,
      senhaTemporaria: senhaTemp,
      mensagem: 'Usuario criado. Login: ' + email + ' | Senha: ' + senhaTemp + ' | Acesso: https://taschibra-store.vercel.app/admin'
    })
  } catch (err: any) {
    console.error('[admin-invite]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
