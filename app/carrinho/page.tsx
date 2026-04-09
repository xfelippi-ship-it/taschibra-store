'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@supabase/supabase-js'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, Tag, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CarrinhoPage() {
  const { items, removeItem, updateQty, total, count, clearCart, cupons, addCupom, removeCupom, totalDesconto, freeShipping } = useCart()
  const [cupomInput, setCupomInput] = useState('')
  const [cupomErro, setCupomErro] = useState('')
  const [cupomLoading, setCupomLoading] = useState(false)
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<any[]>([])
  const totalFinal = Math.max(0, total - totalDesconto)

  // Busca cupons relevantes — genericos + especificos dos SKUs no carrinho
  useEffect(() => {
    async function loadCupons() {
      const { data } = await supabase
        .from('coupons')
        .select('code, description, discount_type, discount_value, scope, scope_ids')
        .eq('active', true)
      if (!data) return

      const skus = items.map(i => i.id)
      const categorias = items.map(i => (i as any).category).filter(Boolean)

      const relevantes = data.filter(c => {
        if (!c.scope || c.scope === 'all') return true
        if (c.scope === 'product' && c.scope_ids?.some((id: string) => skus.includes(id))) return true
        if (c.scope === 'category' && c.scope_ids?.some((id: string) => categorias.includes(id))) return true
        return false
      })

      setCuponsDisponiveis(relevantes.slice(0, 6))
    }
    if (items.length > 0) loadCupons()
  }, [items])

  async function aplicarCupom() {
    if (!cupomInput.trim()) return
    const code = cupomInput.trim().toUpperCase()
    if (cupons.find(c => c.code === code)) {
      setCupomErro('Este cupom já foi aplicado')
      return
    }
    setCupomLoading(true)
    setCupomErro('')
    try {
      const res = await fetch('/api/cupom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: total, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCupomErro(data.error || 'Cupom inválido')
      } else {
        addCupom(data)
        setCupomInput('')
        setCupomErro('')
      }
    } catch {
      setCupomErro('Erro ao validar cupom')
    }
    setCupomLoading(false)
  }

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
            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-semibold">Limpar tudo</button>
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

            {/* Cupons aplicados */}
            {cupons.length > 0 && (
              <div className="space-y-2 mb-4">
                {cupons.map(c => (
                  <div key={c.code} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-green-700">{c.code}
                          {c.scope && c.scope !== 'all' && (
                            <span className="ml-1.5 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-bold">específico</span>
                          )}
                        </p>
                        <p className="text-xs text-green-600">
                          - R$ {c.discount_amount.toFixed(2).replace('.', ',')}
                          {c.free_shipping && ' + Frete grátis'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeCupom(c.code)} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input cupom */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  value={cupomInput}
                  onChange={e => setCupomInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && aplicarCupom()}
                  placeholder="Cupom de desconto"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 uppercase"
                />
                <button onClick={aplicarCupom} disabled={cupomLoading || !cupomInput.trim()}
                  className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold text-sm px-4 rounded-lg transition-colors">
                  {cupomLoading ? '...' : 'OK'}
                </button>
              </div>
              {cupomErro && <p className="text-red-500 text-xs mt-1.5">{cupomErro}</p>}

              {/* Cupons sugeridos */}
              {cuponsDisponiveis.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                    <Tag size={11} /> Cupons disponíveis
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cuponsDisponiveis.map(cp => {
                      const jaAplicado = cupons.find(c => c.code === cp.code)
                      return (
                        <button
                          key={cp.code}
                          onClick={() => { if (!jaAplicado) { setCupomInput(cp.code) } }}
                          disabled={!!jaAplicado}
                          className={`flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-full border transition-colors ${
                            jaAplicado
                              ? 'bg-green-100 border-green-300 text-green-700 cursor-default'
                              : 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-400 text-green-700'
                          }`}
                        >
                          <Tag size={9} />
                          {cp.code}
                          {cp.scope && cp.scope !== 'all' && <span className="text-green-500 font-normal">•específico</span>}
                          <span className="font-normal text-green-600">
                            {cp.discount_type === 'percentage' ? ` ${cp.discount_value}% off` : ` R$ ${Number(cp.discount_value).toFixed(0)} off`}
                          </span>
                          {jaAplicado && <span className="text-green-500">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                  {cupons.some(c => c.scope && c.scope !== 'all') && cupons.some(c => !c.scope || c.scope === 'all') && (
                    <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                      ✅ Cupons cumulativos aplicados!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Valores */}
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({count} itens)</span>
                <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              {cupons.map(c => (
                <div key={c.code} className="flex justify-between text-sm text-green-600 font-semibold">
                  <span className="flex items-center gap-1"><Tag size={12} /> {c.code}</span>
                  <span>- R$ {c.discount_amount.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              {totalDesconto > 0 && cupons.length > 1 && (
                <div className="flex justify-between text-sm text-green-700 font-black border-t border-green-100 pt-2">
                  <span>Total de descontos</span>
                  <span>- R$ {totalDesconto.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frete</span>
                <span className={freeShipping ? 'text-green-600 font-black' : 'text-green-600 font-semibold'}>
                  {freeShipping ? 'GRÁTIS 🎉' : 'Calcular'}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-800">
                <span>Total</span>
                <span className="text-xl text-green-700">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
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
