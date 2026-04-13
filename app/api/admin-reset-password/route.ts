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
    const { email, executedBy } = await req.json()
    if (!email) return NextResponse.json({ error: 'E-mail obrigatorio' }, { status: 400 })

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id, user_id')
      .eq('email', email)
      .single()

    if (!adminUser?.user_id) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const novaSenha = gerarSenhaTemporaria()

    await supabaseAdmin.auth.admin.updateUserById(adminUser.user_id, {
      password: novaSenha,
    })

    await supabaseAdmin
      .from('admin_users')
      .update({ trocar_senha: true })
      .eq('id', adminUser.id)

    await supabaseAdmin.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'reset_senha_admin',
      entity: 'admin_users',
      entity_id: adminUser.id,
      details: 'Reset senha: ' + email + ' | Nova senha temporaria gerada',
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      email,
      senhaTemporaria: novaSenha,
      mensagem: 'Senha resetada. Envie: Login: ' + email + ' | Nova senha: ' + novaSenha
    })
  } catch (err: any) {
    console.error('[admin-reset-password]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
