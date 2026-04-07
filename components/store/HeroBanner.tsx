'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const slides = [
  {
    badge: '⚡ Nova Coleção 2025',
    title: <>Iluminação que <span className="text-yellow-400">transforma</span> ambientes</>,
    sub: 'Mais de 3.000 produtos para iluminar cada detalhe da sua casa ou negócio.',
    btn1: { label: 'Ver Catálogo Completo', href: '/produtos' },
    btn2: { label: 'Linha SMART →', href: '/produtos?categoria=smart' },
    bg: 'from-green-900 via-green-700 to-green-800',
  },
  {
    badge: '🔵 Tecnologia LED',
    title: <>Economia real na <span className="text-yellow-400">sua conta</span> de luz</>,
    sub: 'LEDs Taschibra consomem até 80% menos energia. Eficiência com qualidade de fábrica.',
    btn1: { label: 'Ver Lâmpadas LED', href: '/produtos?categoria=lampadas' },
    btn2: { label: 'Saiba mais →', href: '/produtos?categoria=lampadas' },
    bg: 'from-blue-950 via-blue-800 to-blue-900',
  },
  {
    badge: '🏭 Outlet exclusivo',
    title: <>Outlet Taschibra <span className="text-yellow-400">até 50% off</span></>,
    sub: 'Produtos de fábrica com preço direto. Estoque limitado — aproveite agora.',
    btn1: { label: 'Ver Ofertas Outlet', href: '/produtos?categoria=outlet' },
    btn2: { label: 'Frete grátis acima R$299 →', href: '/produtos?categoria=outlet' },
    bg: 'from-purple-950 via-purple-800 to-purple-900',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  const goTo = useCallback((n: number) => {
    setCurrent(n)
    setProgress(0)
  }, [])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])

  useEffect(() => {
    setProgress(0)
    const tick = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { next(); return 0 }
        return p + 0.4
      })
    }, 20)
    return () => clearInterval(tick)
  }, [current, next])

  return (
    <div className="relative overflow-hidden" style={{ height: '480px' }}>
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={i} className={`min-w-full h-full bg-gradient-to-br ${s.bg} relative flex items-center`}>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
            <div className="relative z-10 max-w-7xl mx-auto px-12 w-full">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                  {s.badge}
                </div>
                <h1 className="font-black text-5xl text-white leading-tight tracking-tight mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {s.title}
                </h1>
                <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md">{s.sub}</p>
                <div className="flex gap-3">
                  <Link href={s.btn1.href} className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm px-7 py-3.5 rounded-lg transition-all hover:-translate-y-0.5">
                    {s.btn1.label}
                  </Link>
                  <Link href={s.btn2.href} className="bg-transparent hover:bg-white/10 text-white font-bold text-sm px-7 py-3.5 rounded-lg border border-white/30 transition-all">
                    {s.btn2.label}
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-100"
              style={{ width: i === current ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/35 text-white border border-white/30 rounded-full w-10 h-10 flex items-center justify-center transition z-20">
        ←
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/35 text-white border border-white/30 rounded-full w-10 h-10 flex items-center justify-center transition z-20">
        →
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-yellow-400' : 'w-2 bg-white/40'}`} />
        ))}
      </div>
    </div>
  )
}
