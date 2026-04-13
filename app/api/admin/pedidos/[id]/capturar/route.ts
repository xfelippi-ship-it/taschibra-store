import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { executedBy } = await req.json()

    const { data: pedido, error: errBusca } = await supabase
      .from('orders')
      .select('id, order_number, payment_status, pagarme_transaction_id')
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // TODO: Chamada real PagarMe API quando tiver chave produção
    // const pagarmeKey = process.env.PAGARME_API_KEY
    // const res = await fetch(`https://api.pagar.me/core/v5/charges/${pedido.pagarme_transaction_id}/capture`, { ... })

    const { error: errUpdate } = await supabase
      .from('orders')
      .update({
        payment_status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (errUpdate) throw errUpdate

    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'pagamento_capturado',
      entity: 'orders',
      entity_id: id,
      details: `Pedido ${pedido.order_number}: pagamento capturado`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, order_number: pedido.order_number })
  } catch (err: any) {
    console.error('[capturar/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
