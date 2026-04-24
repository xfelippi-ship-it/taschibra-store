import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: senhaTemp,
        email_confirm: true,
      })
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
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

    // Enviar e-mail com credenciais via Resend
    let emailEnviado = false
    try {
      await resend.emails.send({
        from: 'Taschibra Store <onboarding@resend.dev>',
        to: email,
        subject: 'Seu acesso ao Backoffice LightSales - Taschibra',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <div style="background: #1e7a3c; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Taschibra Store</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Backoffice LightSales</p>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 15px; color: #333; margin: 0 0 16px;">Seu acesso ao backoffice foi criado.</p>
              <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="font-size: 13px; color: #666; margin: 0 0 8px;"><strong>Link de acesso:</strong></p>
                <p style="font-size: 14px; margin: 0 0 12px;"><a href="https://taschibra-store.vercel.app/admin" style="color: #1e7a3c; font-weight: bold;">taschibra-store.vercel.app/admin</a></p>
                <p style="font-size: 13px; color: #666; margin: 0 0 4px;"><strong>Login:</strong> ${email}</p>
                <p style="font-size: 13px; color: #666; margin: 0 0 4px;"><strong>Senha temporaria:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-weight: bold;">${senhaTemp}</code></p>
              </div>
              <div style="background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                <p style="font-size: 12px; color: #795548; margin: 0;">No primeiro acesso, voce sera solicitado a criar uma nova senha segura (minimo 8 caracteres com maiuscula, minuscula, numero e simbolo).</p>
              </div>
              <p style="font-size: 11px; color: #999; margin: 0; text-align: center;">Este e-mail foi enviado automaticamente pelo sistema LightSales.</p>
            </div>
          </div>
        `,
      })
      emailEnviado = true
    } catch (emailErr: any) {
      console.error('[admin-invite] Erro ao enviar e-mail:', emailErr.message)
    }

    await supabaseAdmin.from('audit_logs').insert({
      executed_by: 'admin',
      action: 'convite_enviado',
      entity: 'admin_users',
      entity_id: userId,
      details: 'Convite: ' + email + ' | Email: ' + (emailEnviado ? 'enviado' : 'falhou') + ' | Papeis: ' + (papeis || []).join(', '),
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      email,
      senhaTemporaria: senhaTemp,
      emailEnviado,
      mensagem: emailEnviado
        ? 'Convite enviado por e-mail para ' + email
        : 'Usuario criado. E-mail falhou - envie manualmente: Login: ' + email + ' | Senha: ' + senhaTemp
    })
  } catch (err: any) {
    console.error('[admin-invite]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
