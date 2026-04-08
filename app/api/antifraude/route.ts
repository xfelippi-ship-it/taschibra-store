import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CLEARSALE_TOKEN = process.env.CLEARSALE_TOKEN || 'token_ficticio_clearsale'
const CLEARSALE_URL = 'https://api.clearsale.com.br/v1'

type ItemPedido = {
  product_id: string
  name?: string
  name_snapshot?: string
  unit_price: number
  quantity: number
}

type EnderecoEntrega = {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  cep: string
}

async function analisarClearSale(pedido: {
  order_id: string
  total: number
  cliente: { nome: string; email: string; cpf: string; telefone: string }
  endereco: EnderecoEntrega
  itens: ItemPedido[]
  metodo_pagamento: string
  ip?: string
}): Promise<{ aprovado: boolean; score: number; status: string }> {

  const body = {
    Orders: [{
      OrderID: pedido.order_id,
      Date: new Date().toISOString(),
      Email: pedido.cliente.email,
      TotalValue: pedido.total,
      TotalItems: pedido.itens.length,
      Payments: [{
        TypeID: pedido.metodo_pagamento === 'pix' ? 'PIX' : 'CreditCard',
        Value: pedido.total,
      }],
      BillingData: {
        Name: pedido.cliente.nome,
        CPF: pedido.cliente.cpf,
        Phone: [{
          Type: 'Cellular',
          Number: pedido.cliente.telefone,
        }],
        Address: {
          Street: pedido.endereco.logradouro,
          Number: pedido.endereco.numero,
          Comp: pedido.endereco.complemento || '',
          District: pedido.endereco.bairro,
          City: pedido.endereco.localidade,
          State: pedido.endereco.uf,
          ZipCode: pedido.endereco.cep?.replace(/\D/g, ''),
          Country: 'BR',
        }
      },
      ShippingData: {
        Name: pedido.cliente.nome,
        Address: {
          Street: pedido.endereco.logradouro,
          Number: pedido.endereco.numero,
          Comp: pedido.endereco.complemento || '',
          District: pedido.endereco.bairro,
          City: pedido.endereco.localidade,
          State: pedido.endereco.uf,
          ZipCode: pedido.endereco.cep?.replace(/\D/g, ''),
          Country: 'BR',
        }
      },
      Items: pedido.itens.map(item => ({
        ItemID: item.product_id,
        ItemName: item.name,
        UnitCost: item.unit_price,
        Qty: item.quantity,
        TotalCost: item.unit_price * item.quantity,
      })),
      IP: pedido.ip || '0.0.0.0',
    }]
  }

  const res = await fetch(`${CLEARSALE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLEARSALE_TOKEN}`,
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    // Se ClearSale falhar, aprova por padrão para não travar vendas
    console.error('ClearSale erro:', res.status)
    return { aprovado: true, score: 0, status: 'ANA' }
  }

  const data = await res.json()
  const order = data.Orders?.[0]
  const status = order?.Status || 'ANA'
  const score = order?.Score || 0

  // APA = aprovado, ARE = reprovado, ANA = em análise, SUS = suspeito
  const aprovado = ['APA', 'ANA'].includes(status)

  return { aprovado, score, status }
}

export async function POST(req: NextRequest) {
  try {
    const { pedido_id } = await req.json()

    if (!pedido_id) {
      return NextResponse.json({ error: 'pedido_id obrigatório' }, { status: 400 })
    }

    // Busca pedido completo no Supabase
    const { data: pedido, error } = await supabase
      .from('orders')
      .select(`
        id, total, shipping_address, payment_method, coupon_code,
        order_items (product_id, quantity, unit_price, name_snapshot)
      `)
      .eq('id', pedido_id)
      .single()

    if (error || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Busca dados do pagamento para pegar dados do cliente
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', pedido_id)
      .single()

    const endereco = pedido.shipping_address as EnderecoEntrega
    const itens = (pedido.order_items as unknown as ItemPedido[]) || []

    // Chama ClearSale
    const resultado = await analisarClearSale({
      order_id: pedido.id,
      total: pedido.total,
      cliente: {
        nome: endereco?.logradouro ? 'Cliente' : 'Cliente',
        email: payment?.email || 'cliente@email.com',
        cpf: payment?.cpf || '00000000000',
        telefone: payment?.telefone || '47999999999',
      },
      endereco,
      itens: itens.map(i => ({
        product_id: i.product_id,
        name: i.name_snapshot || 'Produto',
        unit_price: i.unit_price,
        quantity: i.quantity,
      })),
      metodo_pagamento: pedido.payment_method || 'pix',
      ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
    })

    // Atualiza status do pedido conforme resultado
    await supabase
      .from('orders')
      .update({
        status: resultado.aprovado ? 'approved' : 'cancelled',
        payment_status: resultado.aprovado ? 'paid' : 'rejected',
        notes: `ClearSale: ${resultado.status} | Score: ${resultado.score}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pedido_id)

    return NextResponse.json({
      pedido_id,
      aprovado: resultado.aprovado,
      score: resultado.score,
      status: resultado.status,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
