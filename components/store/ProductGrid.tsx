const produtos = [
  { nome: 'Pilha Alcalina AAA Taschibra Blister 2', preco: '5,39', parcela: '5,87', stars: 5, reviews: 42, badge: 'Novo', emoji: '🔋' },
  { nome: 'Smart Lâmpada Wi-fi LED 6W RGB Bolinha', preco: '57,86', parcela: '30,45', stars: 5, reviews: 87, badge: 'Smart', emoji: '💡' },
  { nome: 'Refletor LED Inlumix BR 50W 6500K Branco', preco: '17,15', parcela: '19,05', stars: 4, reviews: 123, badge: 'Oferta', emoji: '🔦' },
  { nome: 'Plafon Taschibra Seven 7XG9 Exclusivo', preco: '467,91', parcela: '51,99', stars: 5, reviews: 19, badge: 'Exclusivo', emoji: '🏮' },
]

const badgeColors: Record<string, string> = {
  Novo: 'bg-green-600',
  Smart: 'bg-blue-500',
  Oferta: 'bg-red-500',
  Exclusivo: 'bg-purple-600',
}

export default function ProductGrid({ title }: { title: string }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>{title}</h2>
          <div className="w-9 h-0.5 bg-green-600 mt-1.5 rounded" />
        </div>
        <a href="#" className="text-sm font-bold text-green-600 hover:gap-3 transition-all flex items-center gap-1">Ver todos →</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {produtos.map((p, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer relative group">
            {p.badge && (
              <span className={`absolute top-2 left-2 z-10 ${badgeColors[p.badge]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {p.badge}
              </span>
            )}
            <div className="bg-gray-50 flex items-center justify-center h-44 text-7xl group-hover:scale-105 transition-transform">
              {p.emoji}
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2">{p.nome}</p>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-400 text-xs">{'★'.repeat(p.stars)}{'☆'.repeat(5-p.stars)}</span>
                <span className="text-xs text-gray-400">({p.reviews})</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
                <span className="text-lg font-black text-green-700" style={{fontFamily:'Nunito,sans-serif'}}>R$ {p.preco}</span>
              </div>
              <p className="text-xs text-gray-500">ou <strong>R$ {p.parcela}</strong> no cartão</p>
              <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 rounded-md transition-colors tracking-wide">
                COMPRAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
