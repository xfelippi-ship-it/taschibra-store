import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STATUS_VALIDOS = [
  'pending',
  'awaiting_payment',
  'confirmed',
  'awaiting_shipment',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status, executedBy } = await req.json()

    if (!STATUS_VALIDOS.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    // Busca pedido atual
    const { data: pedido, error: errBusca } = await supabase
      .from('orders')
      .select('id, order_number, status, customer_email, customer_name')
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const statusAnterior = pedido.status

    // Atualiza status
    const { error: errUpdate } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (errUpdate) throw errUpdate

    // Auditoria
    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'pedido_status_alterado',
      entity: 'orders',
      entity_id: id,
      details: `Pedido ${pedido.order_number}: ${statusAnterior} → ${status}`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      pedido_id: id,
      order_number: pedido.order_number,
      status_anterior: statusAnterior,
      status_novo: status,
    })
  } catch (err: any) {
    console.error('[status/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
