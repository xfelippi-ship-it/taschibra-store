export default function PromoBanner() {
  const cupons = [
    { pct: '10%', desc: 'acima de R$ 500', code: 'PASCOA10' },
    { pct: '20%', desc: 'acima de R$ 1.000', code: 'PASCOA20' },
    { pct: '30%', desc: 'acima de R$ 1.500', code: 'PASCOA30' },
  ]
  return (
    <div className="mx-6 my-2 rounded-2xl bg-gradient-to-r from-green-800 to-green-600 p-10 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden max-w-7xl md:mx-auto">
      <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-yellow-400 opacity-10 -translate-y-1/4 translate-x-1/4" />
      <div>
        <h3 className="text-2xl font-black text-white mb-2" style={{fontFamily:'Nunito,sans-serif'}}>🎉 Páscoa Iluminada</h3>
        <p className="text-green-200 text-sm max-w-sm">Descontos progressivos em toda a loja. Use os cupons e ilumine seu lar.</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {cupons.map((c, i) => (
          <div key={i} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-4 text-center min-w-[110px]">
            <div className="text-3xl font-black text-yellow-400 leading-none" style={{fontFamily:'Nunito,sans-serif'}}>{c.pct}</div>
            <div className="text-xs text-green-200 my-1">{c.desc}</div>
            <div className="text-xs font-black text-white bg-yellow-400 bg-opacity-20 px-2 py-0.5 rounded tracking-wide">{c.code}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
