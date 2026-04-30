import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''

  if (q.length >= 2) {
    const eanRes = await supabase.from('product_variants').select('product_id').ilike('ean', '%' + q + '%')
    const eanIds: string[] = (eanRes.data || []).map((r: any) => r.product_id)

    const orStr = 'name.ilike.%' + q + '%,sku.ilike.%' + q + '%,short_description.ilike.%' + q + '%'
    const { data, error } = await supabase.from('products').select('id, name, sku, brand_id').or(orStr).order('name').limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const base: any[] = data || []
    if (eanIds.length > 0) {
      const { data: eanProds } = await supabase.from('products').select('id, name, sku, brand_id').in('id', eanIds)
      for (const p of (eanProds || [])) {
        if (!base.find((x: any) => x.id === p.id)) base.push(p)
      }
    }
    return NextResponse.json({ data: base })
  }

  const { data, error } = await supabase.from('products').select('id, name, sku, brand_id').order('name').limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const { brand_id, product_ids } = await req.json()
  if (!brand_id || !product_ids?.length) {
    return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 })
  }
  const { error } = await supabase.from('products').update({ brand_id }).in('id', product_ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
