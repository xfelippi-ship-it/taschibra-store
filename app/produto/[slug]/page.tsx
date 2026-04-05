import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ShoppingCart, Heart, Bell, Truck, Shield } from 'lucide-react'

export default function ProdutoPage() {
  return (
    <>
      <Header />
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <a href="/" className="text-green-600 hover:underline">Home</a>
          <span className="mx-2">›</span>
          <a href="/produtos" className="text-green-600 hover:underline">Refletores</a>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold">Plafon Taschibra Seven 7XG9</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 gap-16 items-start">
        {/* Galeria */}
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center h-96 text-9xl mb-3 relative">
            <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">EXCLUSIVO NO SITE</span>
            🏮
          </div>
          <div className="flex gap-3">
            {['🏮','🔆','📐','🏠'].map((e, i) => (
              <div key={i} className={`w-18 h-18 bg-gray-50 border-2 ${i===0?'border-green-500':'border-gray-200'} rounded-xl flex items-center justify-center text-3xl cursor-pointer p-4 hover:border-green-400 transition-colors`}>
                {e}
              </div>
            ))}
          </div>
        </div>
        {/* Detalhes */}
        <div>
          <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">TASCHIBRA</p>
          <h1 className="text-2xl font-black text-gray-800 leading-tight mb-2">Plafon Taschibra Seven 7XG9</h1>
          <p className="text-xs text-gray-400 mb-3">Ref.: 65050933 · Modelo: TAS-SEVEN-7XG9</p>
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100 mb-5">
            <span className="text-yellow-400 text-base">★★★★★</span>
            <span className="text-sm font-black text-gray-800">5.0</span>
            <a href="#reviews" className="text-sm text-green-600 underline">(19 avaliações)</a>
          </div>
          {/* Preço */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-5">
            <p className="text-sm text-gray-600 mb-1">No cartão em até <strong className="text-gray-800 text-lg">10x de R$ 51,99</strong> sem juros</p>
            <div className="flex items-center gap-3 pt-3 border-t border-green-100 mt-3">
              <span className="bg-teal-500 text-white text-xs font-black px-2 py-1 rounded">PIX</span>
              <span className="text-3xl font-black text-green-700">R$ 467,91</span>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">-10%</span>
            </div>
            <a href="#" className="text-xs text-green-600 underline mt-2 block">+ Formas de pagamento</a>
          </div>
          {/* Variante */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Acabamento:</p>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-green-500">
              <option>Preto Fosco / Dourado</option>
              <option>Branco / Cromado</option>
            </select>
          </div>
          {/* Qty + Comprar */}
          <div className="flex gap-3 mb-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">−</button>
              <span className="w-12 h-12 flex items-center justify-center text-sm font-black border-x border-gray-200">1</span>
              <button className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">+</button>
            </div>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={18} /> ADICIONAR AO CARRINHO
            </button>
          </div>
          {/* Ações secundárias */}
          <div className="flex gap-3 mb-5">
            <button className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:border-green-500 hover:text-green-600 flex items-center justify-center gap-2 transition-colors">
              <Heart size={15} /> Favoritar
            </button>
            <button className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:border-green-500 hover:text-green-600 flex items-center justify-center gap-2 transition-colors">
              <Bell size={15} /> Alerta de preço
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
            <a href="#" className="text-xs text-green-600 underline mt-2 block">Não sei meu CEP</a>
          </div>
          {/* Garantia */}
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
