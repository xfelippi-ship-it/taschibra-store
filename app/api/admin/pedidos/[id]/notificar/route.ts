import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STATUS_MSGS: Record<string, { subject: string; body: string }> = {
  confirmed: {
    subject: 'Pedido confirmado!',
    body: 'Seu pedido foi confirmado e está sendo preparado para envio.',
  },
  processing: {
    subject: 'Pedido em separação',
    body: 'Seu pedido está sendo separado no nosso centro de distribuição.',
  },
  shipped: {
    subject: 'Pedido enviado!',
    body: 'Seu pedido foi enviado! Você receberá o código de rastreio em breve.',
  },
  delivered: {
    subject: 'Pedido entregue',
    body: 'Seu pedido foi entregue. Esperamos que aproveite seus produtos Taschibra!',
  },
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status, executedBy } = await req.json()

    const msg = STATUS_MSGS[status]
    if (!msg) {
      return NextResponse.json({ error: 'Status de notificação inválido' }, { status: 400 })
    }

    const { data: pedido, error: errBusca } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, customer_name, tracking_code, customers(name, email)')
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const email = pedido.customer_email || (pedido as any).customers?.email
    const nome = pedido.customer_name || (pedido as any).customers?.name || 'Cliente'

    if (!email) {
      return NextResponse.json({ error: 'E-mail do cliente não encontrado' }, { status: 400 })
    }

    // TODO: Integrar Resend real quando tiver chave produção
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Taschibra Store <noreply@taschibra.com.br>',
    //   to: email,
    //   subject: `${msg.subject} — Pedido ${pedido.order_number}`,
    //   html: `<p>Olá ${nome},</p><p>${msg.body}</p>...`,
    // })

    // Log como se tivesse enviado (sandbox)
    console.log(`[notificar] E-mail simulado para ${email}: ${msg.subject}`)

    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'cliente_notificado',
      entity: 'orders',
      entity_id: id,
      details: `Pedido ${pedido.order_number}: notificação "${msg.subject}" → ${email}`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, email, status: msg.subject })
  } catch (err: any) {
    console.error('[notificar/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
