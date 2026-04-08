import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_ficticio_resend_api_key'
const FROM_EMAIL = process.env.FROM_EMAIL || 'pedidos@taschibrastore.com.br'

type ItemEmail = {
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

function templateConfirmacao(dados: {
  nome: string
  pedido_id: string
  itens: ItemEmail[]
  subtotal: number
  frete: number
  desconto: number
  total: number
  metodo_pagamento: string
  pix_code?: string
}): string {
  const itensHtml = dados.itens.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444;text-align:center">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444;text-align:right">R$ ${item.unit_price.toFixed(2).replace('.', ',')}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:bold;color:#222;text-align:right">R$ ${item.total_price.toFixed(2).replace('.', ',')}</td>
    </tr>
  `).join('')

  const pixSection = dados.pix_code ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
      <p style="font-size:14px;font-weight:bold;color:#166534;margin:0 0 8px">📱 Pague com PIX</p>
      <p style="font-size:12px;color:#555;margin:0 0 12px">Copie o código abaixo e pague no app do seu banco</p>
      <div style="background:#fff;border:1px solid #d1fae5;border-radius:6px;padding:10px;word-break:break-all;font-family:monospace;font-size:11px;color:#333">${dados.pix_code.substring(0, 100)}...</div>
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
          <h2 style="color:#166534;margin:0 0 8px;font-size:20px">Pedido Confirmado!</h2>
          <p style="color:#555;margin:0 0 4px;font-size:14px">Olá, <strong>${dados.nome}</strong>!</p>
          <p style="color:#555;margin:0;font-size:14px">Seu pedido foi recebido com sucesso.</p>
          <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;margin:16px 0;display:inline-block">
            <p style="margin:0;font-size:13px;color:#166534">Número do pedido: <strong>#${dados.pedido_id.substring(0,8).toUpperCase()}</strong></p>
          </div>
        </td></tr>
        ${pixSection}
        <tr><td style="padding:0 32px">
          <h3 style="color:#333;font-size:15px;margin:20px 0 12px">Resumo do pedido</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            <tr style="background:#f9fafb">
              <th style="padding:10px 12px;font-size:12px;color:#666;text-align:left">Produto</th>
              <th style="padding:10px 12px;font-size:12px;color:#666;text-align:center">Qtd</th>
              <th style="padding:10px 12px;font-size:12px;color:#666;text-align:right">Unit.</th>
              <th style="padding:10px 12px;font-size:12px;color:#666;text-align:right">Total</th>
            </tr>
            ${itensHtml}
          </table>
        </td></tr>
        <tr><td style="padding:0 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
            <tr><td style="font-size:13px;color:#666;padding:4px 0">Subtotal</td><td style="font-size:13px;color:#333;text-align:right;padding:4px 0">R$ ${dados.subtotal.toFixed(2).replace('.', ',')}</td></tr>
            ${dados.desconto > 0 ? `<tr><td style="font-size:13px;color:#16a34a;padding:4px 0">Desconto</td><td style="font-size:13px;color:#16a34a;text-align:right;padding:4px 0">- R$ ${dados.desconto.toFixed(2).replace('.', ',')}</td></tr>` : ''}
            <tr><td style="font-size:13px;color:#666;padding:4px 0">Frete</td><td style="font-size:13px;color:#333;text-align:right;padding:4px 0">R$ ${dados.frete.toFixed(2).replace('.', ',')}</td></tr>
            <tr style="border-top:2px solid #e5e7eb">
              <td style="font-size:16px;font-weight:bold;color:#166534;padding:12px 0 4px">Total</td>
              <td style="font-size:16px;font-weight:bold;color:#166534;text-align:right;padding:12px 0 4px">R$ ${dados.total.toFixed(2).replace('.', ',')}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px">
          <div style="background:#f9fafb;border-radius:8px;padding:16px">
            <p style="margin:0 0 8px;font-size:13px;color:#555">📦 <strong>Prazo:</strong> conforme transportadora selecionada</p>
            <p style="margin:0 0 8px;font-size:13px;color:#555">📧 <strong>Dúvidas:</strong> contato@taschibrastore.com.br</p>
            <p style="margin:0;font-size:13px;color:#555">📞 <strong>WhatsApp:</strong> (47) 99149-3270</p>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#999">2025 Taschibra Store — Indaial/SC</p>
          <p style="margin:4px 0 0;font-size:12px;color:#999">taschibrastore.com.br</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { tipo, destinatario, dados } = await req.json()

    if (!tipo || !destinatario) {
      return NextResponse.json({ error: 'tipo e destinatario obrigatorios' }, { status: 400 })
    }

    let subject = ''
    let html = ''

    if (tipo === 'confirmacao_pedido') {
      subject = `Pedido #${dados.pedido_id?.substring(0,8).toUpperCase()} confirmado - Taschibra Store`
      html = templateConfirmacao(dados)
    } else {
      return NextResponse.json({ error: 'Tipo de e-mail invalido' }, { status: 400 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Taschibra Store <${FROM_EMAIL}>`,
        to: [destinatario],
        subject,
        html,
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend erro:', data)
      return NextResponse.json({ error: data?.message || 'Erro ao enviar e-mail' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, email_id: data.id })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
