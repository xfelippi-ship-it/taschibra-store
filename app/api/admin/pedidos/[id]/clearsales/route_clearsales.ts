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

    // Busca pedido completo
    const { data: pedido, error: errBusca } = await supabase
      .from('orders')
      .select(`
        id, order_number, total, payment_method, payment_id,
        customer_name, customer_email, customer_cpf, customer_phone,
        shipping_address, billing_address,
        order_items ( product_name, sku, quantity, unit_price ),
        created_at
      `)
      .eq('id', id)
      .single()

    if (errBusca || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const shipping = pedido.shipping_address as any || {}
    const billing  = pedido.billing_address  as any || {}

    // Monta payload ClearSales (modelo SendOrder v1)
    const payload = {
      SessionID: pedido.order_number,
      Origine: 'SITE',
      IsGift: false,
      TotalOrder: Number(pedido.total),
      TotalItems: pedido.order_items?.length || 1,
      TotalShipping: 0,
      Ip: '0.0.0.0',
      OrderDate: pedido.created_at,
      Email: pedido.customer_email,
      BillingData: {
        Name:    pedido.customer_name,
        CPF:     pedido.customer_cpf || '',
        Phone:   pedido.customer_phone || '',
        Address: billing.street || shipping.street || '',
        Number:  billing.number || shipping.number || '',
        Comp:    billing.complement || '',
        City:    billing.city || shipping.city || '',
        State:   billing.state || shipping.state || '',
        ZipCode: billing.zip || shipping.zip || '',
        Country: 'BR',
      },
      ShippingData: {
        Name:    pedido.customer_name,
        Phone:   pedido.customer_phone || '',
        Address: shipping.street || '',
        Number:  shipping.number || '',
        Comp:    shipping.complement || '',
        City:    shipping.city || '',
        State:   shipping.state || '',
        ZipCode: shipping.zip || '',
        Country: 'BR',
        ShippingType: 'Normal',
        Price: 0,
      },
      PaymentData: [
        {
          Type:           pedido.payment_method === 'credit_card' ? 'CreditCard' : 'Boleto',
          Amount:         Number(pedido.total),
          Installments:   1,
          PaymentStatus:  'Approved',
          TransactionID:  pedido.payment_id || '',
        },
      ],
      Cart: (pedido.order_items || []).map((item: any) => ({
        Sku:      item.sku || '',
        Name:     item.product_name || '',
        Qty:      item.quantity,
        UnitCost: item.unit_price,
        TotalCost: item.quantity * item.unit_price,
      })),
    }

    const csRes = await fetch('https://api.clearsale.com.br/order', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.CLEARSALE_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    const csData = await csRes.json()

    if (!csRes.ok) {
      console.error('[clearsales/route] ClearSales error:', csData)
      return NextResponse.json(
        { error: csData.message || 'Erro ao enviar para ClearSales' },
        { status: 502 }
      )
    }

    // Score retornado: APA = aprovado, APM = aprovado manual, RPM = reprovado manual, REP = reprovado
    const score  = csData.Orders?.[0]?.Score ?? null
    const status = csData.Orders?.[0]?.Status ?? null

    // Salva resultado no pedido
    await supabase.from('orders').update({
      clearsales_score:  score,
      clearsales_status: status,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    // Auditoria
    await supabase.from('audit_logs').insert({
      executed_by: executedBy || 'admin',
      action:      'enviado_clearsales',
      entity:      'orders',
      entity_id:   id,
      details:     `Pedido ${pedido.order_number} | score: ${score} | status: ${status}`,
      created_at:  new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, score, status, clearsales: csData })
  } catch (err: any) {
    console.error('[clearsales/route]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}