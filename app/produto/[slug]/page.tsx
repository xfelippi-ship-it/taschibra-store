'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ShoppingCart, Heart, Shield, ChevronRight, Star } from 'lucide-react'
import CalculaFrete from '@/components/store/CalculaFrete'
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
  images?: string[]
  warranty?: string
  weight_kg?: number
}

export default function ProdutoPage() {
  const { slug } = useParams<{ slug: string }>()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [imgAtiva, setImgAtiva] = useState(0)
  const [adicionado, setAdicionado] = useState(false)
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Carregando...</div>
      <Footer />
    </>
  )

  if (!produto) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        <Link href="/produtos" className="text-green-600 font-bold underline">Ver todos os produtos</Link>
      </div>
      <Footer />
    </>
  )

  const desconto = Math.round((1 - produto.promo_price / produto.price) * 100)
  const parcela = (produto.price / 10).toFixed(2).replace('.', ',')
  const imagens = produto.images?.length ? produto.images : produto.main_image ? [produto.main_image] : []

  function handleAdd() {
    addItem({ id: produto!.id, slug: produto!.slug, name: produto!.name, price: produto!.price, promo_price: produto!.promo_price, emoji: '💡' })
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2000)
  }

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto text-xs text-gray-500 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <Link href="/produtos" className="text-green-600 hover:underline">Produtos</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span className="text-gray-700 font-semibold truncate max-w-[200px]">{produto.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 md:grid md:grid-cols-2 md:gap-16 md:items-start pb-24 md:pb-8">

        {/* Imagem */}
        <div className="mb-4 md:mb-0">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center h-64 md:h-96 overflow-hidden mb-3">
            {imagens.length > 0
              ? <img src={imagens[imgAtiva]} alt={produto.name} className="h-56 md:h-80 object-contain" />
              : <span className="text-8xl md:text-9xl">💡</span>
            }
          </div>
          {/* Thumbnails */}
          {imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((img, i) => (
                <button key={i} onClick={() => setImgAtiva(i)}
                  className={`flex-shrink-0 w-14 h-14 border-2 rounded-lg overflow-hidden transition-colors ${imgAtiva === i ? 'border-green-500' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div>
          <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-1">TASCHIBRA</p>
          <h1 className="text-xl md:text-2xl font-black text-gray-800 leading-tight mb-1">{produto.name}</h1>
          {produto.sku && <p className="text-xs text-gray-400 mb-3">SKU: {produto.sku}</p>}

          {/* Avaliação placeholder */}
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />)}
            <span className="text-xs text-gray-500 ml-1">Taschibra Store</span>
          </div>

          {/* Preço */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-600 mb-1">No cartão em até <strong className="text-gray-800">10x de R$ {parcela}</strong> sem juros</p>
            <div className="flex items-center gap-2 pt-2 border-t border-green-100 mt-2">
              <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
              <span className="text-2xl md:text-3xl font-black text-green-700">R$ {produto.promo_price.toFixed(2).replace('.', ',')}</span>
              {desconto > 0 && <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{desconto}%</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">ou R$ {produto.price.toFixed(2).replace('.', ',')} no cartão</p>
          </div>

          {/* Qty + Comprar — visível só em desktop */}
          <div className="hidden md:flex gap-3 mb-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">−</button>
              <span className="w-12 h-12 flex items-center justify-center text-sm font-black border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">+</button>
            </div>
            <button onClick={handleAdd}
              className={`flex-1 font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${adicionado ? 'bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              <ShoppingCart size={18} /> {adicionado ? 'ADICIONADO! ✓' : 'ADICIONAR AO CARRINHO'}
            </button>
          </div>

          <div className="hidden md:flex gap-3 mb-5">
            <button className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:border-green-500 hover:text-green-600 flex items-center justify-center gap-2 transition-colors">
              <Heart size={15} /> Favoritar
            </button>
          </div>

          <CalculaFrete produtoId={produto.id} />

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

      {/* Barra de compra fixa no mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 md:hidden z-50 shadow-lg">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-11 bg-gray-50 text-lg font-bold text-gray-700">−</button>
          <span className="w-9 h-11 flex items-center justify-center text-sm font-black border-x border-gray-200">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="w-9 h-11 bg-gray-50 text-lg font-bold text-gray-700">+</button>
        </div>
        <button onClick={handleAdd}
          className={`flex-1 font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${adicionado ? 'bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
          <ShoppingCart size={16} /> {adicionado ? 'Adicionado! ✓' : 'Comprar'}
        </button>
        <button className="border border-gray-200 rounded-lg px-3 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
          <Heart size={18} />
        </button>
      </div>

      <Footer />
    </>
  )
}
