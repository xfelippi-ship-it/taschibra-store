import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { cep_destino, produtos } = await req.json()

    if (!cep_destino || cep_destino.replace(/\D/g, '').length !== 8) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 })
    }

    const peso = produtos?.reduce((acc: number, p: { peso?: number; quantity: number }) =>
      acc + (p.peso || 0.3) * p.quantity, 0) || 0.5

    const body = {
      from: { postal_code: '89086180' },
      to: { postal_code: cep_destino.replace(/\D/g, '') },
      package: {
        height: 15,
        width: 20,
        length: 30,
        weight: Math.max(peso, 0.1),
      },
      options: {
        insurance_value: 0,
        receipt: false,
        own_hand: false,
      },
      services: '1,2,3,4,17',
    }

    const res = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MELHORENVIO_TOKEN}`,
        'User-Agent': 'Taschibra Store (xfelippi@gmail.com)',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Melhor Envio erro:', data)
      return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 })
    }

    const opcoes = data
      .filter((op: { error?: string; price?: number }) => !op.error && op.price)
      .map((op: {
        id: number
        name: string
        company: { name: string; picture: string }
        price: number
        delivery_time: number
      }) => ({
        id: op.id,
        nome: `${op.company.name} - ${op.name}`,
        transportadora: op.company.name,
        logo: op.company.picture,
        preco: parseFloat(String(op.price)),
        prazo: `${op.delivery_time} dia${op.delivery_time > 1 ? 's' : ''} útil${op.delivery_time > 1 ? 'is' : ''}`,
        prazo_dias: op.delivery_time,
      }))
      .sort((a: { preco: number }, b: { preco: number }) => a.preco - b.preco)

    return NextResponse.json({ opcoes })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
