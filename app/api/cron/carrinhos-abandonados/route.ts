import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Busca configurações
    const { data: settings } = await supabase
      .from('cart_recovery_settings')
      .select('*')
      .limit(1)
      .single()

    if (!settings || settings.mode !== 'automatic') {
      return NextResponse.json({ ok: true, msg: 'Modo manual — cron ignorado' })
    }

    const now = new Date()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taschibra-store.vercel.app'

    // Busca carrinhos não convertidos
    const threshold = new Date(Date.now() - 1 * 3600000).toISOString()
    const { data: carrinhos } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('converted', false)
      .lt('updated_at', threshold)
      .not('customer_email', 'is', null)

    if (!carrinhos || carrinhos.length === 0) {
      return NextResponse.json({ ok: true, disparos: 0 })
    }

    let disparos = 0

    for (const cart of carrinhos) {
      const abandonedAt = new Date(cart.updated_at).getTime()
      const horasPassadas = (now.getTime() - abandonedAt) / 3600000

      // Disparo 1
      if (settings.d1_enabled && !cart.d1_sent_at && horasPassadas >= settings.d1_delay_hours) {
        await dispararEmail(cart, 1, settings, siteUrl)
        disparos++
        continue
      }

      // Disparo 2
      if (settings.d2_enabled && cart.d1_sent_at && !cart.d2_sent_at && horasPassadas >= settings.d2_delay_hours) {
        await dispararEmail(cart, 2, settings, siteUrl)
        disparos++
        continue
      }

      // Disparo 3
      if (settings.d3_enabled && cart.d2_sent_at && !cart.d3_sent_at && horasPassadas >= settings.d3_delay_hours) {
        await dispararEmail(cart, 3, settings, siteUrl)
        disparos++
      }
    }

    return NextResponse.json({ ok: true, disparos, carrinhos: carrinhos.length })
  } catch (err: any) {
    console.error('[cron/carrinhos]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function dispararEmail(cart: any, disparo: number, settings: any, siteUrl: string) {
  await fetch(`${siteUrl}/api/carrinho-lembrete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cart_id: cart.id,
      email: cart.customer_email,
      disparo,
      settings,
    }),
  })
}
