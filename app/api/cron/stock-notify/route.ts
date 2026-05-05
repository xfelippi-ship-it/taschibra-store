import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Verificar authorization do cron
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Buscar alertas pendentes
    const { data: alertas, error } = await supabase
      .from('stock_alerts')
      .select('*')
      .is('notified_at', null)

    if (error) throw error
    if (!alertas || alertas.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 })
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    let notified = 0

    for (const alerta of alertas) {
      // Verificar se produto/variação voltou ao estoque
      let temEstoque = false

      if (alerta.variant_sku) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock_qty')
          .eq('sku', alerta.variant_sku)
          .single()
        temEstoque = variant ? variant.stock_qty > 0 : false
      } else {
        const { data: produto } = await supabase
          .from('products')
          .select('stock_qty')
          .eq('id', alerta.product_id)
          .single()
        temEstoque = produto ? produto.stock_qty > 0 : false
      }

      if (!temEstoque) continue

      // Disparar e-mail
      const prodLabel = alerta.variant_label
        ? `${alerta.product_name} — ${alerta.variant_label}`
        : alerta.product_name

      if (resend) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: alerta.email,
          subject: `${prodLabel} está disponível!`,
          html: `
            <p>Oi ${alerta.nome},</p>
            <p>Boas notícias! O produto <strong>${prodLabel}</strong> que você queria está disponível novamente.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://taschibra-store.vercel.app'}/produtos" style="background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Ver produto</a></p>
            <br>
            <p>Taschibra Store</p>
          `
        })
      }

      // Marcar como notificado
      await supabase
        .from('stock_alerts')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', alerta.id)

      notified++
    }

    return NextResponse.json({ ok: true, notified })
  } catch (err) {
    console.error('stock-notify cron error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
