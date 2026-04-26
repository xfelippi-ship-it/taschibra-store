'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import { getImageUrl } from '@/lib/imageUrl'

type Produto = {
  id: string
  name: string | null
  slug: string | null
  price: number | null
  promo_price: number | null
  category_slug: string | null
  main_image?: string | null
  badge?: string | null
  badges?: string[] | null
  stock_qty?: number | null
}

const badgeColors: Record<string, string> = {
  novo: 'bg-green-600', smart: 'bg-blue-500', oferta: 'bg-red-500',
  exclusivo: 'bg-purple-600', lancamento: 'bg-purple-600',
  promocao: 'bg-orange-500', kit: 'bg-teal-500',
}
const badgeLabels: Record<string, string> = {
  lancamento: 'Lancamento', exclusivo: 'Exclusivo', oferta: 'Oferta',
  promocao: 'Promocao', smart: 'Smart', kit: 'Kit', novo: 'Novo',
}
const badgeMap: Record<string, string> = {
  lancamentos: 'novo', smart: 'smart', outlet: 'oferta', exclusivos: 'exclusivo',
}

function capitalize(str: string | null): string {
  if (!str) return ''
  return str.toLowerCase().replace(/(?:^|\s|\/|-)\S/g, (l) => l.toUpperCase())
}

function formatPrice(val: number | null | undefined): string {
  return (val ?? 0).toFixed(2).replace('.', ',')
}

function ProdCard({ p }: { p: Produto }) {
  const { addItem } = useCart()
  const nome = p.name || ''
  const slug = p.slug || ''
  const preco = p.price ?? 0
  const precoFinal = p.promo_price && p.promo_price > 0 ? p.promo_price : preco
  const desconto =
    p.promo_price && p.promo_price > 0 && preco > 0
      ? Math.round((1 - p.promo_price / preco) * 100)
      : 0
  const semEstoque = p.stock_qty !== null && p.stock_qty !== undefined && p.stock_qty <= 0
  const semPreco = !preco || preco <= 0

  const badgeCat = p.category_slug ? badgeMap[p.category_slug] : null
  const badges = p.badges && p.badges.length > 0 ? p.badges : badgeCat ? [badgeCat] : []
  const badge = badges[0] || null

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (semEstoque) return
    addItem({ id: p.id, slug, name: nome, price: preco, promo_price: p.promo_price ?? 0, emoji: '💡' })
  }

  return (
    <Link
      href={`/produto/${slug}`}
      className={`border rounded-xl overflow-hidden transition-all relative group block bg-white ${semEstoque ? "border-gray-100 grayscale opacity-60" : "border-gray-200 hover:border-green-500 hover:shadow-md hover:-translate-y-1"}`}
    >
      <div className="bg-gray-50 flex items-center justify-center aspect-square overflow-hidden group-hover:scale-105 transition-transform relative">
        {badge && badgeColors[badge] && (
          <span className={`absolute top-2 left-2 z-10 text-white text-xs font-black px-2 py-0.5 rounded ${badgeColors[badge]}`}>
            {badgeLabels[badge] || badge}
          </span>
        )}
        {p.main_image ? (
          <img src={getImageUrl(p.main_image, 600)} alt={nome} className="w-full h-full object-contain p-3" loading="lazy" />
        ) : (
          <div className="flex items-center justify-center w-full h-40">
            <span className="text-6xl">💡</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <p className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
          {capitalize(nome)}
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-teal-700 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
          <span className="text-lg font-black text-gray-900">R$ {formatPrice(precoFinal)}</span>
          {desconto > 0 && (
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              -{desconto}%
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">
          ou <strong>R$ {formatPrice(preco)}</strong> no cartao
        </p>
        {semEstoque ? null : semPreco ? (
          <button
            disabled
            className="w-full bg-gray-100 text-gray-400 font-black text-xs py-2.5 rounded-md mt-auto cursor-not-allowed border border-gray-200"
          >
            EM ATUALIZAÇÃO
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black text-xs py-2.5 rounded-md transition-colors mt-auto"
          >
            COMPRAR
          </button>
        )}
      </div>
    </Link>
  )
}

export default function ProductGrid({
  title,
  categorySlug,
  limit = 8,
}: {
  title: string
  categorySlug?: string
  limit?: number
}) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        let q = supabase
          .from('products')
          .select('id, name, slug, price, promo_price, category_slug, main_image, badge, badges, stock_qty')
        if (categorySlug) {
          q =
            categorySlug === 'lancamentos'
              ? q.eq('is_lancamento', true)
              : q.eq('category_slug', categorySlug)
        }
        const { data } = await q.limit(limit)
        setProdutos((data || []) as Produto[])
      } catch (err) {
        console.error('ProductGrid error:', err)
        setProdutos([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categorySlug, limit])

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-800">{title}</h2>
          <div className="w-9 h-0.5 bg-green-600 mt-1.5 rounded" />
        </div>
        <Link
          href={categorySlug ? `/produtos?categoria=${categorySlug}` : '/produtos'}
          className="text-sm font-bold text-green-600"
        >
          Ver todos
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-xl h-72 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {produtos.map((p) => (
            <ProdCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  )
}