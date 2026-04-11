'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies-accepted')
    if (!accepted) setShow(true)
  }, [])

  function aceitar() {
    localStorage.setItem('cookies-accepted', 'true')
    setShow(false)
  }

  function recusar() {
    localStorage.setItem('cookies-accepted', 'false')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 md:py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
        <div className="flex-1 text-sm text-gray-200 leading-relaxed">
          🍪 Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo.
          Ao continuar navegando, você concorda com nossa{' '}
          <Link href="/privacidade" className="underline text-green-400 hover:text-green-300">
            Política de Privacidade
          </Link>.
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={recusar}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors">
            Recusar
          </button>
          <button onClick={aceitar}
            className="px-5 py-2 text-xs font-black bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>
  )
}
