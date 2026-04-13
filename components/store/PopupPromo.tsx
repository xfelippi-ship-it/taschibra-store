'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type PopupData = {
  id: string; title: string; subtitle: string | null
  image_url: string | null; button_text: string
  button_link: string; bg_color: string
}

export default function PopupPromo() {
  const [popup, setPopup] = useState<PopupData | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('popup_dismissed')
    if (dismissed) return

    supabase.from('popup_promos').select('*').eq('active', true).limit(1).single()
      .then(({ data }) => {
        if (data) {
          setPopup(data as any)
          setTimeout(() => setVisible(true), 2000)
        }
      })
  }, [])

  function fechar() {
    setVisible(false)
    sessionStorage.setItem('popup_dismissed', '1')
  }

  if (!popup || !visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={fechar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{ background: popup.bg_color || '#1e7a3c' }}>
        <button onClick={fechar}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10">
          <X size={16} />
        </button>
        {popup.image_url && (
          <div className="w-full h-48 overflow-hidden">
            <img src={popup.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-black text-white leading-tight mb-2">{popup.title}</h2>
          {popup.subtitle && (
            <p className="text-sm text-white/80 leading-relaxed mb-5">{popup.subtitle}</p>
          )}
          <Link href={popup.button_link} onClick={fechar}
            className="inline-block bg-white text-green-700 font-black text-sm px-8 py-3 rounded-full hover:bg-green-50 transition-colors">
            {popup.button_text}
          </Link>
        </div>
      </div>
    </div>
  )
}
