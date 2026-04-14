'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type GalleryItem = {
  id: string
  titulo: string
  url_imagem: string
  url_link: string
  ordem: number
  ativo: boolean
}

export default function GaleriaHome() {
  const [itens, setItens] = useState<GalleryItem[]>([])

  useEffect(() => {
    supabase
      .from('image_gallery')
      .select('*')
      .eq('ativo', true)
      .order('ordem')
      .then(({ data }) => setItens((data || []) as GalleryItem[]))
  }, [])

  if (!itens.length) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className={`grid gap-4 ${itens.length === 1 ? 'grid-cols-1' : itens.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
        {itens.map(item => (
          item.url_link ? (
            <Link key={item.id} href={item.url_link} className="block group rounded-2xl overflow-hidden relative">
              <img
                src={item.url_imagem}
                alt={item.titulo || ''}
                className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.titulo && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white font-black text-sm md:text-base">{item.titulo}</p>
                </div>
              )}
            </Link>
          ) : (
            <div key={item.id} className="block rounded-2xl overflow-hidden relative">
              <img
                src={item.url_imagem}
                alt={item.titulo || ''}
                className="w-full h-48 md:h-64 object-cover"
              />
              {item.titulo && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white font-black text-sm md:text-base">{item.titulo}</p>
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </section>
  )
}
