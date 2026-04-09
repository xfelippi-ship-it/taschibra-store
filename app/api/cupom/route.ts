import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { code, subtotal, subtotal_apos_fixos, items: subtotalItems = [] } = await req.json()
  // Se ja houve desconto fixo, aplica percentual sobre o saldo
  const baseCalculo = subtotal_apos_fixos ?? subtotal

  if (!code) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })

  const { data: cupom, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('active', true)
    .single()

  if (error || !cupom) return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })

  const now = new Date()
  if (cupom.starts_at && new Date(cupom.starts_at) > now)
    return NextResponse.json({ error: 'Cupom ainda não está ativo' }, { status: 400 })

  if (cupom.ends_at && new Date(cupom.ends_at) < now)
    return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 })

  if (cupom.usage_limit && cupom.used_count >= cupom.usage_limit)
    return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 })

  if (cupom.min_order_value && subtotal < cupom.min_order_value)
    return NextResponse.json({
      error: `Pedido mínimo de R$ ${Number(cupom.min_order_value).toFixed(2).replace('.', ',')} para este cupom`
    }, { status: 400 })

  // Validar escopo
  if (cupom.scope && cupom.scope !== 'all' && cupom.scope_ids?.length > 0) {
    const targets = cupom.scope_ids as string[]
    const items = subtotalItems as { sku?: string; category?: string; family?: string; slug?: string }[]
    const match = items.some(item => {
      if (cupom.scope === 'product') return targets.includes(item.sku || '') || targets.includes(item.slug || '')
      if (cupom.scope === 'category') return targets.includes(item.category || '')
      if (cupom.scope === 'family') return targets.some(t => (item.family || '').toLowerCase().includes(t.toLowerCase()))
      return false
    })
    if (!match) return NextResponse.json({ error: 'Cupom valido apenas para produtos especificos' }, { status: 400 })
  }

  let discount = 0
  if (cupom.discount_type === 'percent' || cupom.discount_type === 'percentage') {
    discount = baseCalculo * (cupom.discount_value / 100)
  } else {
    discount = cupom.discount_value
  }

  if (cupom.max_discount_value) discount = Math.min(discount, cupom.max_discount_value)
  discount = Math.min(discount, subtotal)

  return NextResponse.json({
    valid: true,
    code: cupom.code,
    description: cupom.description,
    discount_type: cupom.discount_type,
    discount_value: cupom.discount_value,
    discount_amount: Number(discount.toFixed(2)),
    free_shipping: cupom.free_shipping || false,
    scope: cupom.scope || 'all',
  })
}