'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const FALLBACK = [
  { icon: '🚚', texto: 'Enviamos para todo o Brasil' },
  { icon: '💳', texto: 'Parcele em até 10x sem juros' },
  { icon: '🔒', texto: 'Compra 100% segura' },
  { icon: '🏭', texto: 'Fábrica própria em Indaial/SC' },
]

export default function TrustBar() {
  const [items, setItems] = useState(FALLBACK)

  useEffect(() => {
    supabase.from('benefit_bar' as any).select('icon,texto,sort_order')
      .eq('active', true).order('sort_order')
      .then(({ data }: any) => {
        if (data && data.length > 0) setItems(data)
      })
  }, [])

  return (
    <div className="bg-green-50 border-b border-green-100 py-4 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:flex md:justify-center gap-3 md:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs md:text-sm font-semibold text-green-800">
            <span className="text-lg md:text-xl flex-shrink-0">{item.icon}</span>
            <span>{item.texto}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
