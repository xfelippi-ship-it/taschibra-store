import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'

const produtos = [
  { nome: 'Refletor LED Inlumix BR 50W 6500K Branco', preco: '17,15', parcela: '19,05', stars: 5, reviews: 123, badge: 'Oferta', emoji: '🔦' },
  { nome: 'Refletor LED Inlumix PT 100W 6500K Preto', preco: '29,21', parcela: '32,45', stars: 5, reviews: 89, badge: '', emoji: '🔦' },
  { nome: 'Refletor TR LED RGB 20W Branco', preco: '33,44', parcela: '37,15', stars: 4, reviews: 44, badge: 'Smart', emoji: '🌈' },
  { nome: 'Refletor LED Solar TR Sun 25W Preto', preco: '247,19', parcela: '54,93', stars: 5, reviews: 31, badge: 'Novo', emoji: '☀️' },
  { nome: 'Refletor TR LED 200W 6500K', preco: '145,94', parcela: '54,05', stars: 4, reviews: 27, badge: '', emoji: '🔦' },
  { nome: 'Refletor LED Verde 50W 127V', preco: '56,84', parcela: '63,15', stars: 5, reviews: 15, badge: '', emoji: '🟢' },
]

const badgeColors: Record<string, string> = {
  Novo: 'bg-green-600', Smart: 'bg-blue-500', Oferta: 'bg-red-500', Exclusivo: 'bg-purple-600',
}

export default function ProdutosPage() {
  return (
    <>
      <Header />
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <a href="/" className="text-green-600 hover:underline">Home</a>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold">Refletores</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <SlidersHorizontal size={15} className="text-green-600" />
              <span className="text-sm font-black text-gray-800">Filtros</span>
            </div>
            {[
              { titulo: 'Potência', opcoes: ['10W a 20W (22)', '50W a 100W (18)', '100W a 200W (14)', '200W+ (9)'] },
              { titulo: 'Temperatura', opcoes: ['3000K Quente (10)', '4000K Neutro (16)', '6500K Frio (30)'] },
              { titulo: 'Cor', opcoes: ['Preto (35)', 'Branco (28)', 'Verde (5)', 'RGB (8)'] },
            ].map((grupo, i) => (
              <div key={i} className="border-b border-gray-100 last:border-0">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{grupo.titulo}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                <div className="px-4 pb-3 space-y-2">
                  {grupo.opcoes.map((op, j) => (
                    <label key={j} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-green-600">
                      <input type="checkbox" className="accent-green-600 w-4 h-4" />
                      {op}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Faixa de Preço</p>
              <div className="flex gap-2 items-center">
                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" placeholder="R$ Min" />
                <span className="text-gray-400">—</span>
                <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" placeholder="R$ Máx" />
              </div>
              <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-2 rounded-lg transition-colors">Filtrar</button>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-black text-gray-800">Refletores</h1>
              <p className="text-sm text-gray-500 mt-0.5"><strong>{produtos.length} produtos</strong> encontrados</p>
            </div>
            <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white outline-none cursor-pointer">
              <option>Mais Relevantes</option>
              <option>Mais Vendidos</option>
              <option>Menor Preço</option>
              <option>Maior Preço</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {produtos.map((p, i) => (
              <a key={i} href="/produto/refletor" className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md hover:-translate-y-1 transition-all relative group block" style={{textDecoration:'none'}}>
                {p.badge && <span className={`absolute top-2 left-2 z-10 ${badgeColors[p.badge]} text-white text-xs font-bold px-3 py-1 rounded-full`}>{p.badge}</span>}
                <div className="bg-gray-50 flex items-center justify-center h-44 text-7xl group-hover:scale-105 transition-transform">{p.emoji}</div>
                <div className="p-4">
                  <p className="text-sm font-bold text-gray-800 leading-snug mb-2">{p.nome}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-400 text-xs">{'★'.repeat(p.stars)}{'☆'.repeat(5-p.stars)}</span>
                    <span className="text-xs text-gray-400">({p.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
                    <span className="text-lg font-black text-green-700">R$ {p.preco}</span>
                  </div>
                  <p className="text-xs text-gray-500">ou <strong>R$ {p.parcela}</strong> no cartão</p>
                  <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 rounded-md transition-colors">COMPRAR</button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
