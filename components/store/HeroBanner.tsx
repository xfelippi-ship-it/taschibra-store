export default function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-br from-green-900 via-green-700 to-green-800 overflow-hidden" style={{height: '480px'}}>
      <div className="absolute inset-0" style={{background: 'radial-gradient(circle at 70% 50%, rgba(39,163,79,0.25) 0%, transparent 60%)'}} />
      <div className="relative z-10 max-w-7xl mx-auto px-12 h-full flex items-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-yellow-400 bg-opacity-20 border border-yellow-400 border-opacity-40 text-yellow-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            ⚡ Nova Coleção 2025
          </div>
          <h1 className="font-black text-5xl text-white leading-tight tracking-tight mb-4" style={{fontFamily: 'Nunito, sans-serif'}}>
            Iluminação que<br/>
            <span className="text-yellow-400">transforma</span><br/>
            ambientes
          </h1>
          <p className="text-green-200 text-base leading-relaxed mb-8 max-w-md">
            Mais de 3.000 produtos para iluminar cada detalhe da sua casa ou negócio. Tecnologia LED com eficiência e estilo.
          </p>
          <div className="flex gap-3">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm px-7 py-3.5 rounded-lg transition-all hover:-translate-y-0.5">
              Ver Catálogo Completo
            </button>
            <button className="bg-transparent hover:bg-white hover:bg-opacity-10 text-white font-bold text-sm px-7 py-3.5 rounded-lg border border-white border-opacity-30 transition-all">
              Linha SMART →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
