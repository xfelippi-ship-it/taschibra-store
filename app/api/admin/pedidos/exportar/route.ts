import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status     = searchParams.get('status')
  const dataInicio = searchParams.get('data_inicio')
  const dataFim    = searchParams.get('data_fim')

  let q = supabase
    .from('orders')
    .select('order_number, status, payment_status, payment_method, total, subtotal, discount_total, shipping_total, coupon_code, tracking_code, shipping_method, created_at, customers ( name, email, cpf, phone )')
    .order('created_at', { ascending: false })

  if (status)     q = q.eq('status', status)
  if (dataInicio) q = q.gte('created_at', dataInicio)
  if (dataFim)    q = q.lte('created_at', dataFim + 'T23:59:59')

  const { data, error } = await q.limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const header = ['Nº Pedido','Data','Status','Pagamento','Método','Subtotal','Desconto','Frete','Total','Cupom','Rastreio','Transportadora','Cliente','E-mail','CPF','Telefone'].join(';')

  const rows = (data || []).map((p: any) => {
    const c = p.customers
    return [
      p.order_number,
      new Date(p.created_at).toLocaleDateString('pt-BR'),
      p.status, p.payment_status, p.payment_method,
      Number(p.subtotal||0).toFixed(2).replace('.',','),
      Number(p.discount_total||0).toFixed(2).replace('.',','),
      Number(p.shipping_total||0).toFixed(2).replace('.',','),
      Number(p.total||0).toFixed(2).replace('.',','),
      p.coupon_code||'', p.tracking_code||'', p.shipping_method||'',
      c?.name||'', c?.email||'', c?.cpf||'', c?.phone||'',
    ].map(v => '"'+String(v).replace(/"/g,'""')+'"').join(';')
  })

  const csv = '\uFEFF' + [header, ...rows].join('\n')
  const filename = 'pedidos_' + new Date().toISOString().slice(0,10) + '.csv'

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  })
}
