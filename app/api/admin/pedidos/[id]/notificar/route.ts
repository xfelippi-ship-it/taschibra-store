import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'pedidos@taschibrastore.com.br'

function templateStatus(dados: {
  nome: string
  order_number: string
  titulo: string
  mensagem: string
  tracking_code?: string
  is_retirada?: boolean
}): string {
  const trackingSection = dados.tracking_code && !dados.is_retirada ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
      <p style="font-size:14px;font-weight:bold;color:#166534;margin:0 0 8px">📦 Código de Rastreio</p>
      <p style="font-family:monospace;font-size:16px;font-weight:bold;color:#333;margin:0">${dados.tracking_code}</p>
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#166534;padding:24px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px">TASCHIBRA STORE</h1>
          <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px">Iluminação e Automação</p>
        </td></tr>
        <tr><td style="padding:32px 32px 0">
          <h2 style="color:#166534;margin:0 0 8px;font-size:20px">${dados.titulo}</h2>
          <p style="color:#555;margin:0 0 4px;font-size:14px">Olá, <strong>${dados.nome}</strong>!</p>
          <p style="color:#555;margin:0 0 16px;font-size:14px">${dados.mensagem}</p>
          <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;display:inline-block">
            <p style="margin:0;font-size:13px;color:#166534">Pedido: <strong>#${dados.order_number}</strong></p>
          </div>
        </td></tr>
        ${trackingSection}
        <tr><td style="padding:24px 32px">
          <div style="background:#f9fafb;border-radius:8px;padding:16px">
            <p style="margin:0 0 8px;font-size:13px;color:#555">📧 <strong>Dúvidas:</strong> contato@taschibrastore.com.br</p>
            <p style="margin:0;font-size:13px;color:#555">📞 <strong>WhatsApp:</strong> (47) 99149-3270</p>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#999">© 2025 Taschibra Store — Indaial/SC</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const STATUS_MSGS: Record<string, { subject: string; titulo: string; mensagem: string }> = {
  confirmed: {
    subject: 'Pedido confirmado!',
    titulo: '✅ Pedido Confirmado!',
    mensagem: 'Seu pedido foi confirmado e está sendo preparado.',
  },
  processing: {
    subject: 'Pedido em separação',
    titulo: '📦 Pedido em Separação',
    mensagem: 'Ótima notícia! Seu pedido está sendo separado no nosso centro de distribuição.',
  },
  awaiting_shipment: {
    subject: 'Pedido aguardando envio',
    titulo: '🔄 Aguardando Envio',
    mensagem: 'Seu pedido foi separado e está aguardando coleta pela transportadora.',
  },
  shipped: {
    subject: 'Pedido enviado! 🚚',
    titulo: '🚚 Pedido Enviado!',
    mensagem: 'Seu pedido foi despachado! Em breve você receberá o código de rastreio.',
  },
  awaiting_pickup: {
    subject: 'Pedido pronto para retirada!',
    titulo: '📍 Pronto para Retirada!',
    mensagem: 'Seu pedido está pronto! Pode vir retirar na nossa loja em Indaial/SC.',
  },
  delivered: {
    subject: 'Pedido entregue ✅',
    titulo: '🎉 Pedido Entregue!',
    mensagem: 'Seu pedido foi entregue com sucesso! Esperamos que aproveite seus produtos Taschibra.',
  },
  cancelled: {
    subject: 'Pedido cancelado',
    titulo: '❌ Pedido Cancelado',
    mensagem: 'Seu pedido foi cancelado. Em caso de dúvidas, entre em contato conosco.',
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
      .select('id, order_number, customer_email, customer_name, tracking_code, shipping_method, customers(name, email)')
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const email = pedido.customer_email || (pedido as any).customers?.email
    const nome = pedido.customer_name || (pedido as any).customers?.name || 'Cliente'
    const isRetirada = pedido.shipping_method?.toLowerCase().includes('retirada')

    if (!email) {
      return NextResponse.json({ error: 'E-mail do cliente não encontrado' }, { status: 400 })
    }

    const html = templateStatus({
      nome,
      order_number: pedido.order_number,
      titulo: msg.titulo,
      mensagem: msg.mensagem,
      tracking_code: pedido.tracking_code || undefined,
      is_retirada: isRetirada,
    })

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Taschibra Store <${FROM_EMAIL}>`,
        to: [email],
        subject: `${msg.subject} — Pedido ${pedido.order_number}`,
        html,
      })
    })

    const resendData = await resendRes.json()
    const emailEnviado = resendRes.ok

    if (!emailEnviado) {
      console.error('[notificar] Resend erro:', resendData)
    }

    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'cliente_notificado',
      entity: 'orders',
      entity_id: id,
      details: `Pedido ${pedido.order_number}: notificação "${msg.subject}" → ${email} (${emailEnviado ? 'enviado' : 'falhou'})`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, email, status: msg.subject, email_enviado: emailEnviado })
  } catch (err: any) {
    console.error('[notificar/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
