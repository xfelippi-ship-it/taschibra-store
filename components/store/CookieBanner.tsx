'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CookiePrefs {
  essenciais: boolean
  analiticos: boolean
  marketing: boolean
}

const VERSAO = '1.0'
const KEY = 'taschibra_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const [prefs, setPrefs] = useState<CookiePrefs>({ essenciais: true, analiticos: false, marketing: false })

  useEffect(() => {
    const salvo = localStorage.getItem(KEY)
    if (!salvo) {
      // Delay para nao competir com o LCP da pagina
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  async function salvarConsentimento(escolha: CookiePrefs) {
    const sessionId = Math.random().toString(36).slice(2)
    localStorage.setItem(KEY, JSON.stringify({ ...escolha, versao: VERSAO, data: new Date().toISOString() }))
    setVisible(false)
    await (supabase.from as any)('cookie_consents').insert({
      session_id: sessionId,
      essenciais: true,
      analiticos: escolha.analiticos,
      marketing: escolha.marketing,
      versao_politica: VERSAO,
    })
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5" data-nosnippet>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">🍪</span>
          <div className="flex-1">
            <p className="font-black text-gray-800 text-sm mb-1">Privacidade e Cookies</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Usamos cookies para melhorar sua experiência. Os essenciais são necessários para o funcionamento do site.
              Os demais são opcionais e nos ajudam a entender como você usa o site e a mostrar anúncios relevantes.
            </p>
          </div>
        </div>

        {expandido && (
          <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-black text-gray-800">Essenciais</p>
                <p className="text-xs text-gray-500">Necessários para o funcionamento do site. Sempre ativos.</p>
              </div>
              <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-black text-gray-800">Analíticos</p>
                <p className="text-xs text-gray-500">Google Analytics — nos ajudam a entender o tráfego do site.</p>
              </div>
              <button onClick={() => setPrefs(p => ({ ...p, analiticos: !p.analiticos }))}
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${prefs.analiticos ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-black text-gray-800">Marketing</p>
                <p className="text-xs text-gray-500">Meta Pixel, Google Ads — permitem anúncios personalizados.</p>
              </div>
              <button onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${prefs.marketing ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={() => setExpandido(!expandido)}
            className="text-xs text-gray-500 hover:text-gray-700 underline px-3 py-2">
            {expandido ? 'Ocultar opções' : 'Personalizar'}
          </button>
          <button onClick={() => salvarConsentimento({ essenciais: true, analiticos: false, marketing: false })}
            className="text-xs font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
            Recusar opcionais
          </button>
          {expandido && (
            <button onClick={() => salvarConsentimento(prefs)}
              className="text-xs font-bold bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors">
              Salvar preferências
            </button>
          )}
          <button onClick={() => salvarConsentimento({ essenciais: true, analiticos: true, marketing: true })}
            className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  )
}
