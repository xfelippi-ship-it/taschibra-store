import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { snapshots } = body

    if (!snapshots || !Array.isArray(snapshots) || snapshots.length === 0) {
      return NextResponse.json({ error: 'snapshots array obrigatório' }, { status: 400 })
    }

    // Insere snapshots em lote
    const { error } = await supabase
      .from('market_price_snapshots' as any)
      .insert(snapshots)

    if (error) {
      console.error('[market-prices/ingest]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verifica alertas para cada snapshot
    const alertasDisparados = []
    for (const snap of snapshots) {
      const { data: alertas } = await supabase
        .from('market_alerts' as any)
        .select('*')
        .eq('sku', snap.sku)
        .eq('active', true)
        .or(`source.eq.${snap.source},source.is.null`)

      for (const alerta of (alertas || [])) {
        const deveDisparar =
          (alerta.tipo === 'preco_abaixo' && snap.price <= alerta.threshold) ||
          (alerta.tipo === 'preco_acima'  && snap.price >= alerta.threshold)

        if (deveDisparar) {
          alertasDisparados.push({
            sku: snap.sku,
            source: snap.source,
            price: snap.price,
            threshold: alerta.threshold,
            tipo: alerta.tipo,
            email: alerta.email_notificar,
          })
          // Atualiza ultimo_disparo
          await supabase
            .from('market_alerts' as any)
            .update({ ultimo_disparo: new Date().toISOString() })
            .eq('id', alerta.id)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      inseridos: snapshots.length,
      alertas_disparados: alertasDisparados.length,
      alertas: alertasDisparados,
    })
  } catch (err: any) {
    console.error('[market-prices/ingest]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
