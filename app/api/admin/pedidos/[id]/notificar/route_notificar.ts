import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const TEMPLATES: Record<string, { subject: string; titulo: string; mensagem: string }> = {
  confirmed: {
    subject: 'Pedido confirmado — Taschibra Store',
    titulo:  'Seu pedido foi confirmado!',
    mensagem: 'Seu pagamento foi aprovado e seu pedido está sendo preparado para envio.',
  },
  awaiting_shipment: {
    subject: 'Pedido em separação — Taschibra Store',
    titulo:  'Estamos separando seu pedido',
    mensagem: 'Seu pedido está em separação no nosso estoque e em breve será enviado.',
  },
  shipped: {
    subject: 'Pedido enviado — Taschibra Store',
    titulo:  'Seu pedido foi enviado!',
    mensagem: 'Seu pedido saiu para entrega. Você pode rastrear pelo código abaixo.',
  },
  delivered: {
    subject: 'Pedido entregue — Taschibra Store',
    titulo:  'Pedido entregue com sucesso!',
    mensagem: 'Esperamos que tenha gostado dos seus produtos. Qualquer dúvida, fale conosco.',
  },
  cancelled: {
    subject: 'Pedido cancelado — Taschibra Store',
    titulo:  'Seu pedido foi cancelado',
    mensagem: 'Seu pedido foi cancelado. Se o pagamento já tinha sido realizado, o estorno será processado em até 7 dias úteis.',
  },
}

function htmlEmail(nome: string, titulo: string, mensagem: string, orderNumber: string, tracking?: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f4f4f4;margin:0;padding:0">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="background:#1a1a1a;padding:24px 32px">
      <img src="https://taschibra-store.vercel.app/logo-taschibra.png" alt="Taschibra" height="32" style="display:block">
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">${titulo}</h2>
      <p style="color:#555;margin:0 0 24px">Olá, <strong>${nome}</strong>.</p>
      <p style="color:#555;margin:0 0 24px">${mensagem}</p>
      <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#999">Número do pedido</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:#1a1a1a">${orderNumber}</p>
      </div>
      ${tracking ? `
      <div style="background:#e8f5e9;border-radius:6px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#388e3c">Código de rastreio</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#1b5e20">${tracking}</p>
      </div>` : ''}
      <p style="color:#999;font-size:12px;margin:0">
        Dúvidas? Entre em contato: <a href="mailto:contato@taschibra.com.br" style="color:#555">contato@taschibra.com.br</a>
      </p>
    </div>
    <div style="background:#f4f4f4;padding:16px 32px;font-size:11px;color:#aaa">
      Taschibra S.A. — CNPJ 79.610.656/0001-36 — Indaial/SC
    </div>
  </div>
</body>
</html>`
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, executedBy } = await req.json()

    const template = TEMPLATES[status]
    if (!template) {
      return NextResponse.json({ error: 'Status sem template de e-mail' }, { status: 400 })
    }

    // Busca pedido
    const { data: pedido, error: errBusca } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, customer_name, tracking_code')
      .eq('id', params.id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (!pedido.customer_email) {
      return NextResponse.json({ error: 'Pedido sem e-mail do cliente' }, { status: 400 })
    }

    const { error: mailErr } = await resend.emails.send({
      from:    'Taschibra Store <noreply@taschibra.com.br>',
      to:      pedido.customer_email,
      subject: template.subject,
      html:    htmlEmail(
        pedido.customer_name || 'Cliente',
        template.titulo,
        template.mensagem,
        pedido.order_number,
        status === 'shipped' ? pedido.tracking_code : undefined
      ),
    })

    if (mailErr) throw mailErr

    // Auditoria
    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action:      'cliente_notificado',
      entity:      'orders',
      entity_id:   params.id,
      details:     `Pedido ${pedido.order_number} | status: ${status} | email: ${pedido.customer_email}`,
      created_at:  new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, email: pedido.customer_email })
  } catch (err: any) {
    console.error('[notificar/route]', err)
    return NextResponse.json({ error: err.message || 'Erro ao enviar e-mail' }, { status: 500 })
  }
}