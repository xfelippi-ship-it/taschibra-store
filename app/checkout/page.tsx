'use client'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import Link from 'next/link'
import { ChevronRight, MapPin, Truck, CreditCard, CheckCircle, Copy } from 'lucide-react'

type Step = 'endereco' | 'frete' | 'pagamento' | 'confirmado'

const freteOpcoes = [
  { id: 'pac', nome: 'PAC', prazo: '8 a 12 dias úteis', preco: 18.90, icon: '📦' },
  { id: 'sedex', nome: 'SEDEX', prazo: '2 a 4 dias úteis', preco: 34.50, icon: '⚡' },
  { id: 'sedex10', nome: 'SEDEX 10', prazo: 'Até 10h do dia seguinte', preco: 52.00, icon: '🚀' },
]

export default function CheckoutPage() {
  const { items, total, count, clearCart, cupom } = useCart()
  const [step, setStep] = useState<Step>('endereco')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState<Record<string, string> | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [freteEscolhido, setFreteEscolhido] = useState(freteOpcoes[0])
  const [pagamento, setPagamento] = useState<'pix' | 'cartao'>('pix')
  const [pixCopiado, setPixCopiado] = useState(false)

  const desconto = cupom?.discount_amount || 0
  const totalComFrete = total - desconto + freteEscolhido.preco
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136taschibra@loja.com.br5204000053039865802BR5913TASCHIBRA LTDA6008INDAIAL62070503***6304${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`

  async function buscarCep() {
    if (cep.replace(/\D/g, '').length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
      const data = await res.json()
      if (!data.erro) setEndereco(data)
    } catch {}
    setLoadingCep(false)
  }

  function copiarPix() {
    navigator.clipboard.writeText(pixCode)
    setPixCopiado(true)
    setTimeout(() => setPixCopiado(false), 3000)
  }

  function finalizarPedido() {
    clearCart()
    setStep('confirmado')
  }

  if (items.length === 0 && step !== 'confirmado') {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-gray-500 mb-6">Seu carrinho está vazio.</p>
          <Link href="/produtos" className="bg-green-600 text-white font-black px-8 py-3 rounded-lg">Ver Produtos</Link>
        </div>
        <Footer />
      </>
    )
  }

  if (step === 'confirmado') {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <CheckCircle size={72} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-800 mb-3">Pedido confirmado! 🎉</h1>
          <p className="text-gray-500 mb-2">Obrigado pela sua compra na Taschibra Store.</p>
          <p className="text-gray-500 mb-8">Você receberá um e-mail com os detalhes do pedido em breve.</p>
          <Link href="/" className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3 rounded-lg transition-colors">
            Voltar para a loja
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
        <div className="max-w-7xl mx-auto text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <ChevronRight size={12} />
          <Link href="/carrinho" className="text-green-600 hover:underline">Carrinho</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-semibold">Checkout</span>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2">
          {[
            { id: 'endereco', label: 'Endereço', icon: <MapPin size={14} /> },
            { id: 'frete', label: 'Frete', icon: <Truck size={14} /> },
            { id: 'pagamento', label: 'Pagamento', icon: <CreditCard size={14} /> },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                step === s.id ? 'bg-green-600 text-white' :
                ['endereco','frete','pagamento'].indexOf(step) > i ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s.icon} {s.label}
              </div>
              {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">

          {/* STEP 1 — Endereço */}
          {step === 'endereco' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-green-600" /> Endereço de entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">CEP</label>
                  <div className="flex gap-2">
                    <input value={cep} onChange={e => setCep(e.target.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2'))}
                      placeholder="00000-000" maxLength={9}
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                    <button onClick={buscarCep} disabled={loadingCep}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 rounded-lg transition-colors disabled:opacity-50">
                      {loadingCep ? '...' : 'Buscar'}
                    </button>
                  </div>
                  <a href="https://buscacepinter.correios.com.br" target="_blank" className="text-xs text-green-600 underline mt-1 block">
                    Não sei meu CEP
                  </a>
                </div>
                {endereco && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Rua</label>
                        <input value={endereco.logradouro} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Número</label>
                        <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 123"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Complemento</label>
                        <input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, bloco..."
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Bairro</label>
                        <input value={endereco.bairro} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Cidade</label>
                        <input value={endereco.localidade} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Estado</label>
                        <input value={endereco.uf} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none" />
                      </div>
                    </div>
                    <button onClick={() => setStep('frete')} disabled={!numero}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3.5 rounded-lg transition-colors mt-2 disabled:opacity-50">
                      Continuar para Frete →
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Frete */}
          {step === 'frete' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-black text-gray-800 mb-2 flex items-center gap-2">
                <Truck size={18} className="text-green-600" /> Opções de entrega
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Entregando em: <strong>{endereco?.logradouro}, {numero} — {endereco?.localidade}/{endereco?.uf}</strong>
              </p>
              <div className="space-y-3 mb-6">
                {freteOpcoes.map(op => (
                  <label key={op.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    freteEscolhido.id === op.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="frete" checked={freteEscolhido.id === op.id}
                      onChange={() => setFreteEscolhido(op)} className="accent-green-600" />
                    <span className="text-2xl">{op.icon}</span>
                    <div className="flex-1">
                      <div className="font-black text-gray-800 text-sm">{op.nome}</div>
                      <div className="text-xs text-gray-500">{op.prazo}</div>
                    </div>
                    <div className="font-black text-green-700">R$ {op.preco.toFixed(2).replace('.', ',')}</div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('endereco')} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  ← Voltar
                </button>
                <button onClick={() => setStep('pagamento')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors">
                  Continuar para Pagamento →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Pagamento */}
          {step === 'pagamento' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
                <CreditCard size={18} className="text-green-600" /> Forma de pagamento
              </h2>
              <div className="flex gap-3 mb-6">
                <button onClick={() => setPagamento('pix')}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors ${pagamento === 'pix' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                  📱 PIX
                </button>
                <button onClick={() => setPagamento('cartao')}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors ${pagamento === 'cartao' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                  💳 Cartão de Crédito
                </button>
              </div>

              {pagamento === 'pix' && (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-4">
                    <div className="text-4xl mb-3">📱</div>
                    <p className="font-black text-gray-800 text-lg mb-1">Pague com PIX</p>
                    <p className="text-sm text-gray-500 mb-4">Aprovação imediata. Pague e receba a confirmação na hora.</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-400 mb-1">Código PIX Copia e Cola</p>
                      <p className="text-xs text-gray-600 break-all font-mono">{pixCode.substring(0, 60)}...</p>
                    </div>
                    <button onClick={copiarPix}
                      className={`flex items-center gap-2 mx-auto px-6 py-2.5 rounded-lg font-bold text-sm transition-colors ${pixCopiado ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                      <Copy size={14} /> {pixCopiado ? 'Copiado! ✓' : 'Copiar código PIX'}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('frete')} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      ← Voltar
                    </button>
                    <button onClick={finalizarPedido}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors">
                      Confirmar Pedido ✓
                    </button>
                  </div>
                </div>
              )}

              {pagamento === 'cartao' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1.5 block">Número do cartão</label>
                    <input placeholder="0000 0000 0000 0000" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nome no cartão</label>
                    <input placeholder="NOME SOBRENOME" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Validade</label>
                      <input placeholder="MM/AA" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">CVV</label>
                      <input placeholder="123" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1.5 block">Parcelas</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 bg-white">
                      {Array.from({length: 10}, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>
                          {n}x de R$ {(totalComFrete / n).toFixed(2).replace('.', ',')} {n === 1 ? '(à vista)' : 'sem juros'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setStep('frete')} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      ← Voltar
                    </button>
                    <button onClick={finalizarPedido}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors">
                      Confirmar Pedido ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumo do pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h3 className="font-black text-gray-800 mb-4 text-sm">Resumo ({count} {count === 1 ? 'item' : 'itens'})</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-gray-800">
                    R$ {((item.promo_price || item.price) * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              {cupom && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Cupom ({cupom.code})</span>
                  <span>- R$ {desconto.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Frete ({freteEscolhido.nome})</span>
                <span>R$ {freteEscolhido.preco.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between font-black text-gray-800 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-green-700 text-lg">R$ {totalComFrete.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}