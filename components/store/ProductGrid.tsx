import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const badgeColors: Record<string, string> = {
  novo: 'bg-green-600', smart: 'bg-blue-500',
  oferta: 'bg-red-500', exclusivo: 'bg-purple-600',
}

const emojis: Record<string, string> = {
  lampadas: '💡', refletores: '🔦', plafons: '🏮',
  pendentes: '🕯️', smart: '📱', 'material-eletrico': '🔌', outlet: '🏷️',
}

async function getProdutos(title: string) {
  let query = supabase
    .from('products')
    .select('*, categories(slug)')
    .eq('active', true)
    .limit(4)
  if (title === 'Lançamentos') query = query.eq('badge', 'novo')
  else query = query.order('created_at', { ascending: false })
  const { data } = await query
  return data || []
}

export default async function ProductGrid({ title }: { title: string }) {
  const produtos = await getProdutos(title)
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-800">{title}</h2>
          <div className="w-9 h-0.5 bg-green-600 mt-1.5 rounded" />
        </div>
        <Link href="/produtos" className="text-sm font-bold text-green-600">Ver todos →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {produtos.map((p: any) => {
          const emoji = emojis[p.categories?.slug || 'lampadas'] || '💡'
          const preco = p.promo_price || p.price
          return (
            <Link key={p.id} href={`/produto/${p.slug}`}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md hover:-translate-y-1 transition-all relative group block">
              {p.badge && (
                <span className={`absolute top-2 left-2 z-10 ${badgeColors[p.badge] || 'bg-gray-500'} text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}>
                  {p.badge}
                </span>
              )}
              <div className="bg-gray-50 flex items-center justify-center h-44 text-7xl group-hover:scale-105 transition-transform">
                {emoji}
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2">{p.name}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
                  <span className="text-lg font-black text-green-700">R$ {Number(preco).toFixed(2).replace('.', ',')}</span>
                  {p.promo_price && (
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      -{Math.round((1 - p.promo_price / p.price) * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">ou <strong>R$ {Number(p.price).toFixed(2).replace('.', ',')}</strong> no cartão</p>
                <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 rounded-md transition-colors">COMPRAR</button>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}