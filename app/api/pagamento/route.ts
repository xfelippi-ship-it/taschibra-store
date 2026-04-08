import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CartItem = {
  id: string
  name: string
  price: number
  promo_price: number
  quantity: number
}

type Cartao = {
  numero: string
  nome: string
  validade: string
  cvv: string
  parcelas: number
}

type Endereco = {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  numero: string
  complemento: string
  cep: string
}

type Frete = {
  id: string
  nome: string
  preco: number
}

type Cupom = {
  code: string
  discount_amount: number
}

type Cliente = {
  nome: string
  email: string
  cpf: string
  telefone: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { metodo, itens, endereco, frete, total, cupom, cartao, cliente }: {
      metodo: string
      itens: CartItem[]
      endereco: Endereco
      frete: Frete
      total: number
      cupom: Cupom | null
      cartao: Cartao | null
      cliente: Cliente
    } = body

    const { data: pedido, error: errPedido } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
        subtotal: total - (frete.preco || 0),
        shipping_total: frete.preco,
        discount_total: cupom?.discount_amount || 0,
        total: total,
        coupon_code: cupom?.code || null,
        shipping_address: endereco,
        shipping_method: frete.nome,
      })
      .select()
      .single()

    if (errPedido || !pedido) {
      console.error('Erro pedido:', errPedido)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    const orderItems = itens.map((item: CartItem) => ({
      order_id: pedido.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.promo_price || item.price,
      total_price: (item.promo_price || item.price) * item.quantity,
    }))

    await supabase.from('order_items').insert(orderItems)

    const pagarmeRes = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.PAGARME_API_KEY + ':').toString('base64'),
      },
      body: JSON.stringify({
        code: pedido.id,
        customer: {
          name: cliente.nome,
          email: cliente.email,
          type: 'individual',
          document: cliente.cpf,
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: cliente.telefone?.substring(0, 2) || '47',
              number: cliente.telefone?.substring(2) || '999999999',
            }
          }
        },
        items: itens.map((item: CartItem) => ({
          amount: Math.round((item.promo_price || item.price) * 100),
          description: item.name,
          quantity: item.quantity,
          code: item.id,
        })),
        payments: metodo === 'pix'
          ? [{ payment_method: 'pix', pix: { expires_in: 3600 } }]
          : [{
              payment_method: 'credit_card',
              credit_card: {
                installments: cartao?.parcelas || 1,
                statement_descriptor: 'TASCHIBRA',
                card: {
                  number: cartao?.numero.replace(/\s/g, ''),
                  holder_name: cartao?.nome,
                  exp_month: parseInt(cartao?.validade.split('/')[0] || '1'),
                  exp_year: parseInt('20' + (cartao?.validade.split('/')[1] || '30')),
                  cvv: cartao?.cvv,
                }
              }
            }],
        shipping: {
          amount: Math.round(frete.preco * 100),
          description: frete.nome,
          address: {
            line_1: endereco.numero + ', ' + endereco.logradouro,
            line_2: endereco.complemento || '',
            zip_code: endereco.cep?.replace(/\D/g, ''),
            city: endereco.localidade,
            state: endereco.uf,
            country: 'BR',
          }
        }
      })
    })

    const pagarmeData = await pagarmeRes.json()

    if (!pagarmeRes.ok) {
      await supabase.from('orders').update({ status: 'failed', payment_status: 'failed' }).eq('id', pedido.id)
      return NextResponse.json({ error: pagarmeData?.message || 'Erro no pagamento' }, { status: 400 })
    }

    const charge = pagarmeData.charges?.[0]
    const pixCode: string | null = charge?.last_transaction?.qr_code || null
    const pixUrl: string | null = charge?.last_transaction?.qr_code_url || null
    const isPaid = pagarmeData.status === 'paid'

    await supabase.from('payments').insert({
      order_id: pedido.id,
      gateway: 'pagarme',
      gateway_id: pagarmeData.id,
      status: pagarmeData.status,
      method: metodo,
      amount: total,
      installments: cartao?.parcelas || 1,
      pix_code: pixCode,
      pix_url: pixUrl,
    })

    await supabase.from('orders').update({
      payment_status: isPaid ? 'paid' : 'pending',
    }).eq('id', pedido.id)

    return NextResponse.json({
      sucesso: true,
      pedido_id: pedido.id,
      status: pagarmeData.status,
      pix_code: pixCode,
      pix_url: pixUrl,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
