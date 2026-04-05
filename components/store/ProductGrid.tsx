'use client'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

const produtos = [
  { id: '1', name: 'Pilha Alcalina AAA Taschibra Blister 2', slug: 'pilha-alcalina-aaa', price: 5.87, promo_price: 5.39, badge: 'novo', cat: 'material-eletrico' },
  { id: '2', name: 'Smart Lâmpada Wi-fi LED 6W RGB Bolinha G45', slug: 'smart-lampada-wifi', price: 60.90, promo_price: 57.86, badge: 'smart', cat: 'smart' },
  { id: '3', name: 'Refletor LED Inlumix BR 50W 6500K Branco', slug: 'refletor-led-50w', price: 19.05, promo_price: 17.15, badge: 'oferta', cat: 'refletores' },
  { id: '4', name: 'Plafon Taschibra Seven 7XG9 — Exclusivo', slug: 'plafon-seven-7xg9', price: 519.90, promo_price: 467.91, badge: 'exclusivo', cat: 'plafons' },
]

const badgeColors: Record<string, string> = {
  novo: 'bg-green-600', smart: 'bg-blue-500',
  oferta: 'bg-red-500', exclusivo: 'bg-purple-600',
}

const emojis: Record<string, string> = {
  'material-eletrico': '🔋', smart: '💡', refletores: '🔦', plafons: '🏮',
  lampadas: '💡', pendentes: '🕯️', outlet: '🏷️',
}

function ProdCard({ p }: { p: typeof produtos[0] }) {
  const { addItem } = useCart()
  const emoji = emojis[p.cat] || '💡'

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price, promo_price: p.promo_price, emoji })
  }

  return (
    <Link href={`/produto/${p.slug}`}
      className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md hover:-translate-y-1 transition-all relative group block">
      {p.badge && (
        <span className={`absolute top-2 left-2 z-10 ${badgeColors[p.badge]} text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}>
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
          <span className="text-lg font-black text-green-700">R$ {p.promo_price.toFixed(2).replace('.', ',')}</span>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            -{Math.round((1 - p.promo_price / p.price) * 100)}%
          </span>
        </div>
        <p className="text-xs text-gray-500">ou <strong>R$ {p.price.toFixed(2).replace('.', ',')}</strong> no cartão</p>
        <button onClick={handleAdd}
          className="w-full mt-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black text-xs py-2.5 rounded-md transition-colors">
          COMPRAR
        </button>
      </div>
    </Link>
  )
}

export default function ProductGrid({ title }: { title: string }) {
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
        {produtos.map(p => <ProdCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}