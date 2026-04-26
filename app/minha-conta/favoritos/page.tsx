'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getImageUrl } from '@/lib/imageUrl'
import { useCart } from '@/contexts/CartContext'

export default function FavoritosPage() {
  const router = useRouter()
  const { addItem } = useCart()
  const [favoritos, setFavoritos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clienteId, setClienteId] = useState<string|null>(null)

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_logado')
    if (!salvo) { router.push('/minha-conta'); return }
    const c = JSON.parse(salvo)
    setClienteId(c.id)
    carregarFavoritos(c.id)
  }, [])

  async function carregarFavoritos(id: string) {
    const { data } = await (supabase.from as any)('favorites')
      .select('id, product_id, products(id, name, slug, price, promo_price, main_image, stock_qty)')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
    setFavoritos(data || [])
    setLoading(false)
  }

  async function removerFavorito(favId: string) {
    await (supabase.from as any)('favorites').delete().eq('id', favId)
    setFavoritos(prev => prev.filter(f => f.id !== favId))
  }

  function fmt(v: number) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }

  return (
    <><Header />
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/minha-conta" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">Meus Favoritos</h1>
        {!loading && <span className="text-sm text-gray-400">({favoritos.length} produto{favoritos.length !== 1 ? 's' : ''})</span>}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-semibold mb-2">Nenhum favorito ainda</p>
          <p className="text-sm text-gray-400 mb-6">Salve produtos que você gostou para comprar depois</p>
          <Link href="/produtos" className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoritos.map(fav => {
            const p = fav.products
            if (!p) return null
            const preco = p.promo_price && p.promo_price > 0 ? p.promo_price : p.price
            const semEstoque = p.stock_qty !== null && p.stock_qty <= 0
            return (
              <div key={fav.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md transition-all relative group">
                <button
                  onClick={() => removerFavorito(fav.id)}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow-sm text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart size={14} fill="currentColor" />
                </button>
                <Link href={`/produto/${p.slug}`}>
                  <div className="bg-gray-50 flex items-center justify-center h-40">
                    {p.main_image
                      ? <img src={getImageUrl(p.main_image, 400)} loading="lazy" alt={p.name} className="h-36 object-contain" />
                      : <span className="text-5xl">💡</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-800 line-clamp-2 mb-2 min-h-[2rem]">{p.name}</p>
                    {preco > 0 && (
                      <p className="text-sm font-black text-green-700 mb-2">R$ {fmt(preco)}</p>
                    )}
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  {semEstoque ? (
                    <div className="w-full text-center text-xs font-bold text-gray-400 border border-gray-200 rounded-lg py-2">
                      Indisponível
                    </div>
                  ) : preco <= 0 ? (
                    <div className="w-full text-center text-xs font-bold text-gray-400 border border-gray-200 rounded-lg py-2">
                      Em Atualização
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price, promo_price: p.promo_price ?? 0, emoji: '💡' })}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                      <ShoppingCart size={12} /> Comprar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    <Footer /></>
  )
}
