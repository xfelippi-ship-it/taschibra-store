'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type GalleryItem = {
  id: string
  titulo: string
  subtitulo: string
  badge: string
  btn_label: string
  btn_href: string
  url_imagem: string | null
  url_link: string
  bg_color: string
  modo: string
  ordem: number
  ativo: boolean
  starts_at: string | null
  ends_at: string | null
}

function BlocoImagem({ item }: { item: GalleryItem }) {
  const inner = (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden group cursor-pointer">
      {item.url_imagem
        ? <img src={item.url_imagem} alt={item.titulo || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        : <div className="w-full h-full bg-gray-100" />
      }
      {(item.titulo || item.subtitulo) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6">
          {item.titulo && <p className="text-white font-black text-sm md:text-lg leading-tight">{item.titulo}</p>}
          {item.subtitulo && <p className="text-white/80 text-xs md:text-sm mt-0.5">{item.subtitulo}</p>}
        </div>
      )}
    </div>
  )
  if (item.url_link) return <Link href={item.url_link}>{inner}</Link>
  return inner
}

function BlocoTexto({ item }: { item: GalleryItem }) {
  const inner = (
    <div className={`relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r ${item.bg_color} flex items-center px-6 md:px-10 group cursor-pointer`}>
      {item.url_imagem && (
        <img src={item.url_imagem} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-25 transition-opacity duration-300" />
      )}
      <div className="relative z-10">
        {item.badge && (
          <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-black px-2.5 py-1 rounded-full mb-3">
            {item.badge}
          </span>
        )}
        {item.titulo && (
          <p className="text-white font-black text-xl md:text-3xl leading-tight mb-1">{item.titulo}</p>
        )}
        {item.subtitulo && (
          <p className="text-white/80 text-sm md:text-base mb-4">{item.subtitulo}</p>
        )}
        {item.btn_label && (
          <span className="inline-block bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black text-sm px-5 py-2.5 rounded-full transition-colors">
            {item.btn_label}
          </span>
        )}
      </div>
    </div>
  )
  const href = item.url_link || item.btn_href
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

export default function GaleriaHome() {
  const [itens, setItens] = useState<GalleryItem[]>([])

  useEffect(() => {
    const now = new Date().toISOString()
    supabase
      .from('image_gallery')
      .select('*')
      .eq('ativo', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('ordem')
      .then(({ data }) => setItens((data || []) as GalleryItem[]))
  }, [])

  if (!itens.length) return null

  const cols =
    itens.length === 1
      ? 'grid-cols-1'
      : itens.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3'

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className={`grid gap-4 ${cols}`}>
        {itens.map(item =>
          item.modo === 'texto'
            ? <BlocoTexto key={item.id} item={item} />
            : <BlocoImagem key={item.id} item={item} />
        )}
      </div>
    </section>
  )
}
