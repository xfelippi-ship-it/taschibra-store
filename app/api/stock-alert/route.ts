import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { product_id, variant_sku, product_name, variant_label, nome, email, whatsapp } = await req.json()

    if (!product_id || !product_name || !nome || !email) {
      return NextResponse.json({ error: 'Campos obrigatorios ausentes' }, { status: 400 })
    }

    // Verificar se ja existe cadastro para esse email + variacao
    const { data: existing } = await supabase
      .from('stock_alerts')
      .select('id')
      .eq('email', email)
      .eq('product_id', product_id)
      .eq('variant_sku', variant_sku || '')
      .is('notified_at', null)
      .single()

    if (existing) {
      return NextResponse.json({ ok: true, already: true })
    }

    // Salvar alerta
    const { error } = await supabase.from('stock_alerts').insert({
      product_id,
      variant_sku: variant_sku || null,
      product_name,
      variant_label: variant_label || null,
      nome,
      email,
      whatsapp: whatsapp || null,
    })

    if (error) throw error

    // E-mail de confirmacao para o cliente
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const prodLabel = variant_label ? `${product_name} — ${variant_label}` : product_name
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: `Aviso cadastrado — ${prodLabel}`,
        html: `
          <p>Oi ${nome},</p>
          <p>Seu aviso foi cadastrado com sucesso para o produto <strong>${prodLabel}</strong>.</p>
          <p>Assim que estiver disponível, você receberá uma notificação neste e-mail${whatsapp ? ' e no WhatsApp' : ''}.</p>
          <br>
          <p>Taschibra Store</p>
        `
      })

      // Notificacao interna
      if (process.env.STOCK_ALERT_NOTIFY_EMAIL) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.STOCK_ALERT_NOTIFY_EMAIL,
          subject: `[Stock Alert] ${prodLabel}`,
          html: `
            <p>Novo aviso de estoque cadastrado:</p>
            <ul>
              <li>Produto: ${prodLabel}</li>
              <li>Cliente: ${nome} (${email})</li>
              ${whatsapp ? `<li>WhatsApp: ${whatsapp}</li>` : ''}
            </ul>
          `
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('stock-alert error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
