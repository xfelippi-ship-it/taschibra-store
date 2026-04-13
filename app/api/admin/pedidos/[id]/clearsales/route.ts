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
      .select('id, order_number, total, status')
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // TODO: Chamada real ClearSales API quando tiver token produção
    // const token = process.env.CLEARSALE_TOKEN
    // const res = await fetch('https://api.clearsale.com.br/v1/orders', { ... })

    // Mock: score baseado no valor do pedido (sandbox)
    const mockScore = Number(pedido.total) > 5000 ? 'AMA' : 'APA'
    const mockStatus = mockScore === 'APA' ? 'Aprovado' : 'Análise Manual'

    const { error: errUpdate } = await supabase
      .from('orders')
      .update({
        clearsales_status: mockStatus,
        clearsales_score: mockScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (errUpdate) throw errUpdate

    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action: 'clearsales_enviado',
      entity: 'orders',
      entity_id: id,
      details: `Pedido ${pedido.order_number}: ClearSales ${mockStatus} (${mockScore})`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      order_number: pedido.order_number,
      status: mockStatus,
      score: mockScore,
    })
  } catch (err: any) {
    console.error('[clearsales/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
