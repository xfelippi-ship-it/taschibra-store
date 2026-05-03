import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search') || ''
  const status   = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  const ativo    = searchParams.get('ativo') || ''
  const tipo     = searchParams.get('tipo') || ''
  const page     = parseInt(searchParams.get('page') || '1')
  const limit    = 50
  const offset   = (page - 1) * limit

  const { data: todos } = await supabase
    .from('products')
    .select('sku, main_image, active')
  const r = todos || []
  const summary = {
    total_ativos: r.filter((x: any) => x.active).length,
    com_imagem:   r.filter((x: any) => x.active && x.main_image).length,
    sem_imagem:   r.filter((x: any) => x.active && !x.main_image).length,
  }

  let query = supabase
    .from('products')
    .select('id, sku, ean, name, slug, main_image, images, active, category_slug', { count: 'exact' })
    .order('name')
    .range(offset, offset + limit - 1)

  if (search)   query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,ean.ilike.%${search}%`)
  if (category) query = query.eq('category_slug', category)
  if (ativo === 'true')        query = query.eq('active', true)
  if (ativo === 'false')       query = query.eq('active', false)
  if (status === 'com_imagem') query = query.not('main_image', 'is', null)
  if (status === 'sem_imagem') query = query.is('main_image', null)

  const { data: produtos, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const skusPai = (produtos || [])
    .filter((p: any) => p.sku && /^[A-Z_]/.test(p.sku))
    .map((p: any) => p.sku)

  let variacoes: any[] = []
  if (skusPai.length > 0) {
    const { data } = await supabase
      .from('product_variants')
      .select('sku, sku_pai, ean, main_image, images')
      .in('sku_pai', skusPai)
    variacoes = data || []
  }

  const varMap: Record<string, any[]> = {}
  for (const v of variacoes) {
    if (!varMap[v.sku_pai]) varMap[v.sku_pai] = []
    varMap[v.sku_pai].push(v)
  }

  const resultado = (produtos || []).map((p: any) => {
    const isPai = /^[A-Z_]/.test(p.sku || '')
    const tipo_produto = isPai ? 'pai' : 'simples'

    const extras: string[] = Array.isArray(p.images)
      ? p.images
      : typeof p.images === 'string' && p.images
        ? p.images.split('|').filter(Boolean)
        : []

    const slots: (string | null)[] = [p.main_image || null]
    for (let i = 0; i < 7; i++) slots.push(extras[i] || null)

    const img_status = p.main_image ? 'com_imagem' : 'sem_imagem'

    return {
      id: p.id,
      sku: p.sku,
      ean: p.ean,
      name: p.name,
      slug: p.slug,
      active: p.active,
      category_slug: p.category_slug,
      tipo: tipo_produto,
      main_image: p.main_image,
      img_status,
      slots,
      filhos: isPai ? (varMap[p.sku] || []) : [],
    }
  })

  let filtrado = resultado
  if (tipo === 'pai')    filtrado = filtrado.filter((p: any) => p.tipo === 'pai')
  if (tipo === 'simples') filtrado = filtrado.filter((p: any) => p.tipo === 'simples')

  return NextResponse.json({ data: filtrado, total: count || 0, summary })
}
