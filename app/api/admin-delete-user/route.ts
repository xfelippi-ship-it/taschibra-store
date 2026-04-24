import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { adminUserId, authUserId, email } = await req.json()
    if (!adminUserId || !authUserId) return NextResponse.json({ error: 'Dados obrigatorios' }, { status: 400 })

    // Verificar se o usuario nunca ativou (last_sign_in_at = null)
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(authUserId)
    if (authUser?.user?.last_sign_in_at) {
      return NextResponse.json({ error: 'Usuario ja ativou a conta. Use desativar em vez de excluir.' }, { status: 403 })
    }

    // Deletar de admin_users
    await supabaseAdmin.from('admin_users').delete().eq('id', adminUserId)

    // Deletar de auth.users
    await supabaseAdmin.auth.admin.deleteUser(authUserId)

    // Auditoria
    await supabaseAdmin.from('audit_logs').insert({
      executed_by: 'admin',
      action: 'usuario_excluido',
      entity: 'admin_users',
      entity_id: adminUserId,
      details: 'Usuario excluido (nunca ativou): ' + email,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
