/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Save } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const REDES = [
  { id: 'instagram', label: 'Instagram',  icon: '📸', placeholder: 'https://instagram.com/taschibra' },
  { id: 'facebook',  label: 'Facebook',   icon: '👤', placeholder: 'https://facebook.com/Taschibra' },
  { id: 'youtube',   label: 'YouTube',    icon: '▶️', placeholder: 'https://youtube.com/channel/...' },
  { id: 'linkedin',  label: 'LinkedIn',   icon: '💼', placeholder: 'https://linkedin.com/company/taschibra' },
  { id: 'twitter',   label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/taschibra' },
  { id: 'whatsapp',  label: 'WhatsApp',   icon: '💬', placeholder: 'https://wa.me/5547999999999' },
  { id: 'tiktok',    label: 'TikTok',     icon: '🎵', placeholder: 'https://tiktok.com/@taschibra' },
]

export default function MidiasSociaisTab() {
  const [links, setLinks]     = useState<Record<string, { url: string; active: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg]         = useState<'ok' | 'erro' | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('social_links').select('*')
    const mapa: Record<string, { url: string; active: boolean }> = {}
    for (const r of REDES) mapa[r.id] = { url: '', active: false }
    for (const row of (data || [])) {
      mapa[row.network] = { url: row.url || '', active: row.active ?? true }
    }
    setLinks(mapa)
    setLoading(false)
  }

  async function salvar() {
    setSalvando(true)
    setMsg(null)
    try {
      for (const r of REDES) {
        const val = links[r.id]
        await supabase.from('social_links').upsert({
          network: r.id,
          url:     val?.url || '',
          active:  val?.active ?? false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'network' })
      }
      setMsg('ok')
    } catch {
      setMsg('erro')
    } finally {
      setSalvando(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  function update(id: string, field: 'url' | 'active', value: any) {
    setLinks(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Mídias Sociais</h1>
          <p className="text-xs text-gray-400 mt-0.5">Links exibidos no rodapé do site</p>
        </div>
        <button onClick={salvar} disabled={salvando || loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Save size={15} /> {salvando ? 'Salvando...' : 'Salvar tudo'}
        </button>
      </div>

      {msg === 'ok' && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-3 rounded-xl mb-4">
          ✅ Links salvos com sucesso!
        </div>
      )}
      {msg === 'erro' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl mb-4">
          ❌ Erro ao salvar. Tente novamente.
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Rede Social</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Link</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase w-24">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {REDES.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.icon}</span>
                      <span className="font-bold text-sm text-gray-800">{r.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <input
                      value={links[r.id]?.url || ''}
                      onChange={e => update(r.id, 'url', e.target.value)}
                      placeholder={r.placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                    />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button type="button"
                      onClick={() => update(r.id, 'active', !links[r.id]?.active)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${links[r.id]?.active ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${links[r.id]?.active ? 'translate-x-5' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
