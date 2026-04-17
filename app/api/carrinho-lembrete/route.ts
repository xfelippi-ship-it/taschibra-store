import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

function substituirVariaveis(texto: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v || ''), texto)
}

export async function POST(req: NextRequest) {
  try {
    const { cart_id, email, disparo, settings } = await req.json()

    if (!cart_id || !email || !disparo) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios: cart_id, email, disparo' }, { status: 400 })
    }

    // Busca carrinho
    const { data: carrinho, error: errCart } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('id', cart_id)
      .single()

    if (errCart || !carrinho) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 })
    }

    // Seleciona configuração do disparo
    const n = disparo as 1 | 2 | 3
    const prefix = `d${n}` as 'd1' | 'd2' | 'd3'
    const subject = settings?.[`${prefix}_subject`] || `Lembrete do seu carrinho — disparo #${n}`
    const bodyTemplate = settings?.[`${prefix}_body`] || `Olá {{nome}}, finalize sua compra: {{link_carrinho}}`
    const couponCode = settings?.[`${prefix}_coupon_code`] || ''

    // Busca parcelas das configs da loja
    const { data: configLoja } = await supabase
      .from('store_config')
      .select('card_installments')
      .limit(1)
      .single()
    const parcelas = configLoja?.card_installments ? `até ${configLoja.card_installments}x sem juros` : 'parcelado'

    // Monta variáveis
    const produtos = Array.isArray(carrinho.items)
      ? carrinho.items.map((i: any) => i.name || i.product_name || '').filter(Boolean).join(', ')
      : 'seus produtos'

    const vars: Record<string, string> = {
      nome:         carrinho.customer_name || 'Cliente',
      produtos:     produtos || 'seus produtos',
      valor_total:  `R$ ${Number(carrinho.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      link_carrinho: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taschibra-store.vercel.app'}/carrinho?cart=${cart_id}`,
      cupom:        couponCode,
      parcelas:     parcelas,
      etapa:        carrinho.last_step_reached || 'carrinho',
    }

    const bodyTexto = substituirVariaveis(bodyTemplate, vars)
    const subjectFinal = substituirVariaveis(subject, vars)

    // Monta HTML do email
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: #1a5c2e; padding: 24px 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Taschibra Store</h1>
    </div>
    <div style="padding: 32px;">
      ${bodyTexto.split('\n').map((linha: string) => `<p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">${linha}</p>`).join('')}
      ${couponCode ? `
      <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
        <p style="color: #166534; font-size: 13px; margin: 0 0 6px;">Seu cupom exclusivo:</p>
        <p style="color: #15803d; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">${couponCode}</p>
      </div>` : ''}
      <a href="${vars.link_carrinho}" style="display: block; background: #16a34a; color: white; text-align: center; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; margin: 24px 0;">
        Finalizar compra →
      </a>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
        Taschibra S.A. · CNPJ 02.477.605/0001-01 · Indaial/SC
      </p>
    </div>
  </div>
</body>
</html>`

    // Envia via Resend
    const { error: errEmail } = await resend.emails.send({
      from: 'Taschibra Store <noreply@taschibra.com.br>',
      to: email,
      subject: subjectFinal,
      html,
    })

    if (errEmail) {
      console.error('[carrinho-lembrete] Resend error:', errEmail)
      return NextResponse.json({ error: 'Erro ao enviar email', detail: errEmail }, { status: 500 })
    }

    // Atualiza registro no banco
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (n === 1) updateData.d1_sent_at = new Date().toISOString()
    if (n === 2) updateData.d2_sent_at = new Date().toISOString()
    if (n === 3) updateData.d3_sent_at = new Date().toISOString()

    await supabase.from('abandoned_carts').update(updateData).eq('id', cart_id)

    return NextResponse.json({ ok: true, disparo: n, email })
  } catch (err: any) {
    console.error('[carrinho-lembrete]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
