'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Banner = {
  id: string
  title: string
  subtitle: string
  badge: string
  btn1_label: string
  btn1_href: string
  btn2_label: string
  btn2_href: string
  image_url?: string
  bg_color: string
  position: number
}

export default function HeroBanner() {
  const [slides, setSlides] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function load() {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('position')
      setSlides(data || [])
    }
    load()
  }, [])

  const goTo = useCallback((n: number) => {
    setCurrent(n)
    setProgress(0)
  }, [])

  const next = useCallback(() => {
    if (slides.length === 0) return
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  useEffect(() => {
    if (slides.length === 0) return
    setProgress(0)
    const tick = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { next(); return 0 }
        return p + 0.4
      })
    }, 20)
    return () => clearInterval(tick)
  }, [current, slides.length, next])

  if (slides.length === 0) return (
    <div className="bg-green-800" style={{ height: 'clamp(220px, 35vw, 380px)' }} />
  )

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(220px, 35vw, 380px)' }}>
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={s.id} className={`min-w-full h-full bg-gradient-to-br ${s.bg_color} relative flex items-center`}>
            {s.image_url && (
              <img src={s.image_url} alt={s.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40" />
            )}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
            <div className="relative z-10 w-full px-6 md:px-12 max-w-7xl mx-auto">
              <div className="max-w-xl">
                {s.badge && (
                  <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 md:mb-6">
                    {s.badge}
                  </div>
                )}
                <h1 className="font-black text-2xl md:text-5xl text-white leading-tight tracking-tight mb-2 md:mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {s.title}
                </h1>
                {s.subtitle && (
                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-4 md:mb-8 max-w-md hidden sm:block">{s.subtitle}</p>
                )}
                <div className="flex gap-2 md:gap-3">
                  {s.btn1_label && (
                    <Link href={s.btn1_href || '/produtos'} className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs md:text-sm px-4 md:px-7 py-2.5 md:py-3.5 rounded-lg transition-all">
                      {s.btn1_label}
                    </Link>
                  )}
                  {s.btn2_label && (
                    <Link href={s.btn2_href || '/produtos'} className="bg-transparent hover:bg-white/10 text-white font-bold text-xs md:text-sm px-4 md:px-7 py-2.5 md:py-3.5 rounded-lg border border-white/30 transition-all">
                      {s.btn2_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-100"
              style={{ width: i === current ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/35 text-white border border-white/30 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition z-20 text-sm">
            ←
          </button>
          <button onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/35 text-white border border-white/30 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition z-20 text-sm">
            →
          </button>
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-yellow-400' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
