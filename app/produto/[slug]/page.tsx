'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ShoppingCart, Heart, Truck, Shield } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Produto = {
  id: string
  name: string
  slug: string
  price: number
  promo_price: number
  category_slug: string
  sku?: string
  description?: string
  main_image?: string
}

export default function ProdutoPage() {
  const { slug } = useParams<{ slug: string }>()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()
      setProduto(data)
      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  if (loading) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400">Carregando produto...</div>
      <Footer />
    </>
  )

  if (!produto) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        <Link href="/produtos" className="text-green-600 font-bold underline">Ver todos os produtos</Link>
      </div>
      <Footer />
    </>
  )

  const desconto = Math.round((1 - produto.promo_price / produto.price) * 100)
  const parcela = (produto.price / 10).toFixed(2).replace('.', ',')

  function handleAdd() {
    addItem({ id: produto!.id, slug: produto!.slug, name: produto!.name, price: produto!.price, promo_price: produto!.promo_price, emoji: '💡' })
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/produtos" className="text-green-600 hover:underline">Produtos</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold line-clamp-1">{produto.name}</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* Imagem */}
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center h-96 mb-3 overflow-hidden">
            {produto.main_image
              ? <img src={produto.main_image} alt={produto.name} className="h-80 object-contain" />
              : <span className="text-9xl">💡</span>
            }
          </div>
        </div>
        {/* Detalhes */}
        <div>
          <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">TASCHIBRA</p>
          <h1 className="text-2xl font-black text-gray-800 leading-tight mb-2">{produto.name}</h1>
          {produto.sku && <p className="text-xs text-gray-400 mb-3">SKU: {produto.sku}</p>}
          {/* Preço */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-5">
            <p className="text-sm text-gray-600 mb-1">No cartão em até <strong className="text-gray-800 text-lg">10x de R$ {parcela}</strong> sem juros</p>
            <div className="flex items-center gap-3 pt-3 border-t border-green-100 mt-3">
              <span className="bg-teal-500 text-white text-xs font-black px-2 py-1 rounded">PIX</span>
              <span className="text-3xl font-black text-green-700">R$ {produto.promo_price.toFixed(2).replace('.', ',')}</span>
              {desconto > 0 && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">-{desconto}%</span>}
            </div>
          </div>
          {/* Qty + Comprar */}
          <div className="flex gap-3 mb-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">−</button>
              <span className="w-12 h-12 flex items-center justify-center text-sm font-black border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">+</button>
            </div>
            <button onClick={handleAdd}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={18} /> ADICIONAR AO CARRINHO
            </button>
          </div>
          <div className="flex gap-3 mb-5">
            <button className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:border-green-500 hover:text-green-600 flex items-center justify-center gap-2 transition-colors">
              <Heart size={15} /> Favoritar
            </button>
          </div>
          {/* Frete */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-black text-gray-800 flex items-center gap-2 mb-3">
              <Truck size={16} className="text-green-600" /> Calcule o frete
            </p>
            <div className="flex gap-2">
              <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" placeholder="00000-000" />
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 rounded-lg transition-colors">OK</button>
            </div>
          </div>
          {/* Descrição */}
          {produto.description && (
            <div className="border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-black text-gray-800 mb-2">Descrição</p>
              <p className="text-sm text-gray-600 leading-relaxed">{produto.description}</p>
            </div>
          )}
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-gray-600">
            <Shield size={16} className="text-green-600 flex-shrink-0" />
            <span><strong>Garantia:</strong> Defeito de fabricação — Taschibra</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
