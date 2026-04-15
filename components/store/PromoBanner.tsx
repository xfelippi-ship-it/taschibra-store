'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Cupom = { pct: string; desc: string; code: string }

type PromoBannerData = {
  id: string
  titulo: string
  subtitulo: string
  emoji: string
  ativo: boolean
  tipo: string
  imagem_url: string | null
  cor_fundo: string
  cupons: Cupom[]
}

export default function PromoBanner() {
  const [banner, setBanner] = useState<PromoBannerData | null>(null)

  useEffect(() => {
    (supabase as any)
      .from('promo_banners' as any)
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setBanner(data as PromoBannerData)
      })
  }, [])

  if (!banner) return null

  if (banner.tipo === 'imagem' && banner.imagem_url) {
    return (
      <div className="mx-6 my-2 max-w-7xl md:mx-auto rounded-2xl overflow-hidden">
        <img src={banner.imagem_url} alt={banner.titulo} className="w-full object-cover" />
      </div>
    )
  }

  return (
    <div className={`mx-6 my-2 rounded-2xl bg-gradient-to-r ${banner.cor_fundo} p-10 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden max-w-7xl md:mx-auto`}>
      <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-yellow-400 opacity-10 -translate-y-1/4 translate-x-1/4" />
      <div>
        <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Nunito,sans-serif' }}>
          {banner.emoji} {banner.titulo}
        </h3>
        {banner.subtitulo && <p className="text-green-200 text-sm max-w-sm">{banner.subtitulo}</p>}
      </div>
      {banner.cupons && banner.cupons.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {banner.cupons.map((c, i) => (
            <div key={i} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-4 text-center min-w-[110px]">
              <div className="text-3xl font-black text-yellow-400 leading-none" style={{ fontFamily: 'Nunito,sans-serif' }}>{c.pct}</div>
              <div className="text-xs text-green-200 my-1">{c.desc}</div>
              <div className="text-xs font-black text-white bg-yellow-400 bg-opacity-20 px-2 py-0.5 rounded tracking-wide">{c.code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
