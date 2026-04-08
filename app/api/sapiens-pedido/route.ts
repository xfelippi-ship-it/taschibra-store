import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SENIOR_URL = process.env.SENIOR_API_URL || 'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest'
const SENIOR_USER = process.env.SENIOR_USER || 'usuario_ficticio'
const SENIOR_PASS = process.env.SENIOR_PASS || 'senha_ficticia'
const SENIOR_TENANT = process.env.SENIOR_TENANT || 'taschibra'

type OrderItem = {
  product_id: string
  sku: string
  name_snapshot: string
  quantity: number
  unit_price: number
  total_price: number
}

type ShippingAddress = {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  cep: string
}

async function getSeniorToken(): Promise<string> {
  const res = await fetch(`${SENIOR_URL}/platform/authentication/actions/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `${SENIOR_USER}@${SENIOR_TENANT}.com.br`,
      password: SENIOR_PASS,
      tenantName: SENIOR_TENANT,
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Senior auth falhou: ${data?.message}`)
  return data.jsonToken?.access_token || data.access_token
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
        id, order_number, total, shipping_total, discount_total,
        shipping_address, shipping_method, payment_method, coupon_code,
        order_items (product_id, quantity, unit_price, total_price, name_snapshot, sku)
      `)
      .eq('id', pedido_id)
      .single()

    if (error || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Busca dados do cliente via payments
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', pedido_id)
      .single()

    const endereco = pedido.shipping_address as ShippingAddress
    const itens = (pedido.order_items as unknown as OrderItem[]) || []

    // Autentica no Senior
    const token = await getSeniorToken()

    // Monta payload do pedido para o Senior
    const payload = {
      pedido: {
        numeroPedido: pedido.order_number || pedido.id.substring(0, 8).toUpperCase(),
        dataPedido: new Date().toISOString().split('T')[0],
        tipoPedido: 'V', // Venda
        situacao: 'A', // Aprovado
        observacao: `Pedido LightSales | Pagamento: ${pedido.payment_method}`,
      },
      cliente: {
        nome: payment?.nome || 'Cliente LightSales',
        cpf: payment?.cpf || '',
        email: payment?.email || '',
        telefone: payment?.telefone || '',
        endereco: {
          logradouro: endereco?.logradouro || '',
          numero: endereco?.numero || '',
          complemento: endereco?.complemento || '',
          bairro: endereco?.bairro || '',
          cidade: endereco?.localidade || '',
          uf: endereco?.uf || '',
          cep: endereco?.cep?.replace(/\D/g, '') || '',
        }
      },
      itens: itens.map(item => ({
        codigoProduto: item.sku || item.product_id,
        descricao: item.name_snapshot,
        quantidade: item.quantity,
        valorUnitario: item.unit_price,
        valorTotal: item.total_price,
      })),
      totais: {
        subtotal: pedido.total - (pedido.shipping_total || 0),
        frete: pedido.shipping_total || 0,
        desconto: pedido.discount_total || 0,
        total: pedido.total,
      },
      entrega: {
        modalidade: pedido.shipping_method || 'PAC',
        endereco: {
          logradouro: endereco?.logradouro || '',
          numero: endereco?.numero || '',
          complemento: endereco?.complemento || '',
          bairro: endereco?.bairro || '',
          cidade: endereco?.localidade || '',
          uf: endereco?.uf || '',
          cep: endereco?.cep?.replace(/\D/g, '') || '',
        }
      }
    }

    // Envia para o Senior
    const seniorRes = await fetch(
      `${SENIOR_URL}/erp/vendas/entities/pedidoVenda`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      }
    )

    const seniorData = await seniorRes.json()

    if (!seniorRes.ok) {
      console.error('Senior pedido erro:', seniorData)
      // Não cancela o pedido se o Sapiens falhar — registra o erro e segue
      await supabase.from('orders').update({
        notes: `Erro Sapiens: ${seniorData?.message || 'falha ao enviar'}`,
        updated_at: new Date().toISOString(),
      }).eq('id', pedido_id)

      return NextResponse.json({
        ok: false,
        error: 'Erro ao enviar para Sapiens',
        detalhe: seniorData?.message
      }, { status: 500 })
    }

    // Salva ID do pedido no Sapiens
    await supabase.from('orders').update({
      sapiens_order_id: seniorData?.id || seniorData?.numeroPedido || null,
      updated_at: new Date().toISOString(),
    }).eq('id', pedido_id)

    return NextResponse.json({
      ok: true,
      pedido_id,
      sapiens_id: seniorData?.id || seniorData?.numeroPedido,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('Sapiens pedido erro:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
