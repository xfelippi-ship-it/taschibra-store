import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const formato  = searchParams.get('exportar') || 'csv'
  const search   = searchParams.get('search') || ''
  const status   = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  const ativo    = searchParams.get('ativo') || ''
  const tipo     = searchParams.get('tipo') || ''

  let query = supabase
    .from('products')
    .select('sku, ean, name, slug, main_image, images, active, category_slug')
    .order('name')

  if (search)   query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,ean.ilike.%${search}%`)
  if (category) query = query.eq('category_slug', category)
  if (ativo === 'true')        query = query.eq('active', true)
  if (ativo === 'false')       query = query.eq('active', false)
  if (status === 'com_imagem') query = query.not('main_image', 'is', null)
  if (status === 'sem_imagem') query = query.is('main_image', null)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map(p => {
    const extras = Array.isArray(p.images) ? p.images
      : typeof p.images === 'string' && p.images ? p.images.split('|').filter(Boolean) : []
    const slots = [p.main_image || '', ...Array(7).fill('').map((_, i) => extras[i] || '')]
    const isPai = /^[A-Z_]/.test(p.sku || '')
    const ocupados = slots.filter(Boolean).length
    return {
      SKU: p.sku,
      EAN: p.ean || '',
      Nome: p.name,
      Tipo: isPai ? 'Pai' : 'Simples',
      Categoria: p.category_slug || '',
      Ativo: p.active ? 'Sim' : 'Não',
      Status_imagem: p.main_image ? 'Com imagem' : 'Sem imagem',
      Fotos_ocupadas: ocupados,
      Foto_1: slots[0], Foto_2: slots[1], Foto_3: slots[2], Foto_4: slots[3],
      Foto_5: slots[4], Foto_6: slots[5], Foto_7: slots[6], Foto_8: slots[7],
    }
  })

  if (formato === 'csv') {
    const headers = Object.keys(rows[0] || {}).join(',')
    const lines = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [headers, ...lines].join('\n')
    return new NextResponse('\uFEFF' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="midias.csv"',
      }
    })
  }

  // XLSX simples via CSV com extensão xlsx (LibreOffice abre normalmente)
  const headers = Object.keys(rows[0] || {}).join('\t')
  const lines = rows.map(r => Object.values(r).join('\t'))
  const tsv = [headers, ...lines].join('\n')
  return new NextResponse('\uFEFF' + tsv, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': 'attachment; filename="midias.xlsx"',
    }
  })
}
