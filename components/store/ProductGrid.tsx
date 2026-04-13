'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'

type Produto = {
  id: string
  name: string
  slug: string
  price: number
  promo_price: number
  category_slug: string
  main_image?: string
  badge?: string
  badges?: string[]
}

const badgeMap: Record<string, string> = {
  lancamentos: 'novo', smart: 'smart', outlet: 'oferta', exclusivos: 'exclusivo',
}
const badgeColors: Record<string, string> = {
  novo: 'bg-green-600', smart: 'bg-blue-500', oferta: 'bg-red-500', exclusivo: 'bg-purple-600',
  lancamento: 'bg-purple-600', promocao: 'bg-orange-500', kit: 'bg-teal-500',
}
const badgeLabels: Record<string, string> = {
  lancamento: 'Lançamento', exclusivo: 'Exclusivo', oferta: 'Oferta',
  promocao: 'Promoção', smart: 'Smart', kit: 'Kit', novo: 'Novo',
}

function ProdCard({ p }: { p: Produto }) {
  const { addItem } = useCart()
  const badge = badgeMap[p.category_slug]
  const badges = (p.badges && p.badges.length > 0) ? p.badges : (badge ? [badge] : [])
  const desconto = Math.round((1 - p.promo_price / p.price) * 100)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price, promo_price: p.promo_price, emoji: '💡' })
  }

  return (
    <Link href={`/produto/${p.slug}`}
      className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md hover:-translate-y-1 transition-all relative group block bg-white">
      {badge && (
        <span className={`absolute top-2 left-2 z-10 ${badgeColors[badge]} text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}>
          {badge}
        </span>
      )}
      <div className="bg-gray-50 flex items-center justify-center h-44 text-7xl group-hover:scale-105 transition-transform">
        {badges.length > 0 && badges.slice(0,1).map((b: string) => badgeColors[b] ? (
          <span key={b} className={"absolute top-2 left-2 z-10 text-white text-xs font-black px-2 py-0.5 rounded " + badgeColors[b]}>
            {badgeLabels[b] || b}
          </span>
        ) : null)}
        {p.main_image ? <img src={p.main_image} alt={p.name} className="h-40 object-contain" /> : '💡'}
      </div>
      <div className="p-4 flex flex-col">
        <p className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">{p.name.toLowerCase().replace(/(?:^|\s|\/|-)\S/g, l => l.toUpperCase())}</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
          <span className="text-lg font-black text-green-700">R$ {p.promo_price.toFixed(2).replace('.', ',')}</span>
          {desconto > 0 && (
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-{desconto}%</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">ou <strong>R$ {p.price.toFixed(2).replace('.', ',')}</strong> no cartão</p>
        <button onClick={handleAdd}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black text-xs py-2.5 rounded-md transition-colors mt-auto">
          COMPRAR
        </button>
      </div>
    </Link>
  )
}

export default function ProductGrid({ title, categorySlug, limit = 8 }: { title: string; categorySlug?: string; limit?: number }) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      let q = supabase
        .from('products')
        .select('id, name, slug, price, promo_price, category_slug, main_image, badge, badges')
      if (categorySlug) {
        q = categorySlug === 'lancamentos' ? q.eq('is_lancamento', true) : q.eq('category_slug', categorySlug)
      }
      const { data } = await q.limit(limit)
      setProdutos((data || []) as any)
      setLoading(false)
    }
    load()
  }, [title, categorySlug, limit])

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-800">{title}</h2>
          <div className="w-9 h-0.5 bg-green-600 mt-1.5 rounded" />
        </div>
        <Link href={categorySlug ? `/produtos/${categorySlug}` : "/produtos"} className="text-sm font-bold text-green-600">Ver todos →</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-xl h-72 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {produtos.map(p => <ProdCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  )
}
