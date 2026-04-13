'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Search } from 'lucide-react'

interface SeoPage {
  id?: string
  rota: string
  titulo: string | null
  descricao: string | null
}

const ROTAS_PADRAO = [
  { rota: '/',            label: 'Home' },
  { rota: '/produtos',    label: 'Produtos' },
  { rota: '/lancamentos', label: 'Lançamentos' },
  { rota: '/outlet',      label: 'Outlet' },
  { rota: '/quem-somos',        label: 'Quem Somos' },
  { rota: '/trocas-devolucoes', label: 'Trocas e Devoluções' },
  { rota: '/seguranca',         label: 'Segurança' },
]

export default function SEOTab() {
  const [paginas, setPaginas] = useState<SeoPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ rota: string; texto: string } | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('seo_pages').select('*')
      const existentes = data || []
      const merged = ROTAS_PADRAO.map(r => {
        const found = existentes.find(e => e.rota === r.rota)
        return found || { rota: r.rota, titulo: '', descricao: '' }
      })
      setPaginas(merged as any)
      setLoading(false)
    }
    load()
  }, [])

  function update(rota: string, campo: 'titulo' | 'descricao', valor: string) {
    setPaginas(prev => prev.map(p => p.rota === rota ? { ...p, [campo]: valor } : p))
  }

  async function salvar(pagina: SeoPage) {
    setSaving(pagina.rota)
    const payload = { rota: pagina.rota, titulo: pagina.titulo, descricao: pagina.descricao, updated_at: new Date().toISOString() }
    let error
    if (pagina.id) {
      ({ error } = await supabase.from('seo_pages').update(payload).eq('id', pagina.id))
    } else {
      const res = await supabase.from('seo_pages').insert(payload).select().single()
      error = res.error
      if (res.data) setPaginas(prev => prev.map(p => p.rota === pagina.rota ? { ...p, id: res.data.id } : p))
    }
    setSaving(null)
    setMsg({ rota: pagina.rota, texto: error ? 'Erro ao salvar' : 'Salvo!' })
    setTimeout(() => setMsg(null), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
      Carregando SEO...
    </div>
  )

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-black text-gray-800">SEO por Página</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">Configure o título e a descrição de cada página para os mecanismos de busca.</p>

      <div className="space-y-3">
        {paginas.map(p => {
          const info = ROTAS_PADRAO.find(r => r.rota === p.rota)
          const isSaving = saving === p.rota
          const msgAtual = msg?.rota === p.rota ? msg.texto : null
          return (
            <div key={p.rota} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                  <Search size={13} className="text-green-700" />
                </div>
                <span className="font-black text-gray-800">{info?.label}</span>
                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{p.rota}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-600">Meta Title</label>
                    <span className={`text-xs font-mono ${p.titulo.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                      {p.titulo.length}/60
                    </span>
                  </div>
                  <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={p.titulo} onChange={e => update(p.rota, 'titulo', e.target.value)}
                    placeholder="Ex: Taschibra Store — Iluminação LED" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-600">Meta Description</label>
                    <span className={`text-xs font-mono ${p.descricao.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                      {p.descricao.length}/160
                    </span>
                  </div>
                  <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none"
                    value={p.descricao} onChange={e => update(p.rota, 'descricao', e.target.value)}
                    placeholder="Ex: Loja oficial Taschibra. Lâmpadas, refletores, fitas LED e mais." />
                </div>
                <div className="flex items-center justify-end gap-3">
                  {msgAtual && <span className={`text-sm font-bold ${msgAtual === 'Salvo!' ? 'text-green-600' : 'text-red-500'}`}>{msgAtual}</span>}
                  <button onClick={() => salvar(p)} disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-4 py-2 rounded-lg transition-colors">
                    <Save size={13} /> {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
              {/* Preview Google */}
              {(p.titulo || p.descricao) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Preview Google</p>
                  <p className="text-blue-600 text-sm font-medium truncate">{p.titulo || 'Sem título'}</p>
                  <p className="text-green-700 text-xs">taschibra-store.vercel.app{p.rota}</p>
                  <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{p.descricao || 'Sem descrição'}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
