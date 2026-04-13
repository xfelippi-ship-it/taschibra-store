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

    // Busca pedido
    const { data: pedido, error: errBusca } = await supabase
      .from('orders')
      .select('id, order_number, payment_id, payment_status, total')
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (!pedido.payment_id) {
      return NextResponse.json({ error: 'Pedido sem payment_id PagarMe' }, { status: 400 })
    }

    if (pedido.payment_status === 'captured') {
      return NextResponse.json({ error: 'Pagamento já foi capturado' }, { status: 400 })
    }

    // Captura na PagarMe
    const pagarmeRes = await fetch(
      `https://api.pagar.me/core/v5/charges/${pedido.payment_id}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(process.env.PAGARME_API_KEY! + ':').toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(Number(pedido.total) * 100) }),
      }
    )

    const pagarmeData = await pagarmeRes.json()

    if (!pagarmeRes.ok) {
      console.error('[capturar/route] PagarMe error:', pagarmeData)
      return NextResponse.json(
        { error: pagarmeData.message || 'Erro na PagarMe ao capturar' },
        { status: 502 }
      )
    }

    // Atualiza pedido
    await supabase.from('orders').update({
      payment_status: 'captured',
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    // Auditoria
    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'pagamento_capturado',
      entity: 'orders',
      entity_id: id,
      details: `Pedido ${pedido.order_number} | charge_id: ${pedido.payment_id} | valor: R$ ${pedido.total}`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, pagarme: pagarmeData })
  } catch (err: any) {
    console.error('[capturar/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}