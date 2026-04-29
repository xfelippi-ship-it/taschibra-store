import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, novaSenha } = await req.json()

    if (!userId || !novaSenha) {
      return NextResponse.json({ error: 'Dados obrigatorios' }, { status: 400 })
    }

    if (novaSenha.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter no minimo 8 caracteres' }, { status: 400 })
    }

    const hasUpper = /[A-Z]/.test(novaSenha)
    const hasLower = /[a-z]/.test(novaSenha)
    const hasNum   = /[0-9]/.test(novaSenha)
    const hasSym   = /[^A-Za-z0-9]/.test(novaSenha)

    if (!hasUpper || !hasLower || !hasNum || !hasSym) {
      return NextResponse.json({
        error: 'Senha deve conter: maiuscula, minuscula, numero e simbolo'
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: novaSenha,
    })

    if (error) throw error

    await supabaseAdmin
      .from('admin_users')
      .update({ trocar_senha: false, status: 'ativo' })
      .eq('user_id', userId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[admin-change-password]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
