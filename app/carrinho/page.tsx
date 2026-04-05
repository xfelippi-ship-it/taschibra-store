'use client'
import { useCart } from '@/contexts/CartContext'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CarrinhoPage() {
  const { items, removeItem, updateQty, total, count, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <ShoppingBag size={64} className="text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-gray-800 mb-3">Seu carrinho está vazio</h1>
          <p className="text-gray-500 mb-8">Adicione produtos e eles aparecerão aqui.</p>
          <Link href="/produtos" className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3 rounded-lg transition-colors">
            Ver Produtos
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold">Carrinho</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itens */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-black text-gray-800">Carrinho ({count} {count === 1 ? 'item' : 'itens'})</h1>
            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-semibold">
              Limpar tudo
            </button>
          </div>
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{item.name}</p>
                <div className="flex items-center gap-2">
                  <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
                  <span className="font-black text-green-700">R$ {(item.promo_price || item.price).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center text-sm font-black border-x border-gray-200">
                    {item.quantity}
                  </span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <span className="font-black text-gray-800 w-20 text-right text-sm">
                  R$ {((item.promo_price || item.price) * item.quantity).toFixed(2).replace('.', ',')}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-black text-gray-800 mb-5">Resumo do pedido</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({count} itens)</span>
                <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frete</span>
                <span className="text-green-600 font-semibold">Calcular</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-800">
                <span>Total</span>
                <span className="text-xl text-green-700">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex gap-2">
                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" placeholder="Cupom de desconto" />
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-4 rounded-lg transition-colors">OK</button>
              </div>
            </div>
            <Link href="/checkout" className="block w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-4 rounded-lg text-center transition-colors">
              FINALIZAR COMPRA →
            </Link>
            <Link href="/produtos" className="block w-full text-center text-sm text-green-600 font-semibold mt-3 hover:underline">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}