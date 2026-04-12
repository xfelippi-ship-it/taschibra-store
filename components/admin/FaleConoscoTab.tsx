/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MessageSquare, Download, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  new:        { label: 'Novo',       bg: 'bg-yellow-100', text: 'text-yellow-700' },
  read:       { label: 'Lido',       bg: 'bg-blue-100',   text: 'text-blue-700'   },
  answered:   { label: 'Respondido', bg: 'bg-green-100',  text: 'text-green-700'  },
  archived:   { label: 'Arquivado',  bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

export default function FaleConoscoTab() {
  const [mensagens, setMensagens] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca]         = useState('')

  useEffect(() => { carregar() }, [filtroStatus])

  async function carregar() {
    setLoading(true)
    let q = supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200)
    if (filtroStatus !== 'todos') q = q.eq('status', filtroStatus)
    const { data } = await q
    setMensagens(data || [])
    setLoading(false)
  }

  async function marcarStatus(id: string, status: string) {
    await supabase.from('contact_messages').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    carregar()
  }

  function tempoRelativo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(h / 24)
    if (d > 0) return `há ${d} dia${d > 1 ? 's' : ''}`
    if (h > 0) return `há ${h}h`
    return `há ${Math.floor(diff / 60000)}min`
  }

  const filtradas = mensagens.filter(m => {
    if (!busca) return true
    const b = busca.toLowerCase()
    return m.name?.toLowerCase().includes(b) || m.email?.toLowerCase().includes(b) || m.message?.toLowerCase().includes(b)
  })

  function exportarCSV() {
    const headers = ['Data', 'Nome', 'E-mail', 'Telefone', 'Mensagem', 'Status']
    const rows = filtradas.map(m => [
      new Date(m.created_at).toLocaleDateString('pt-BR'),
      m.name || '', m.email || '', m.phone || '', m.message || '', m.status || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `contatos_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const novas = mensagens.filter(m => m.status === 'new').length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Fale Conosco</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtradas.length} mensagem{filtradas.length !== 1 ? 's' : ''}
            {novas > 0 && <span className="ml-2 text-yellow-600 font-bold">· {novas} nova{novas > 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportarCSV}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportar
          </button>
          <button onClick={carregar}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 border border-gray-200 px-3 py-2.5 rounded-lg hover:border-green-300 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail ou mensagem..."
          className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-500" />
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white font-bold">
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma mensagem encontrada.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Data</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Remetente</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Mensagem</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((m, i) => {
                const st = STATUS_CFG[m.status || 'new']
                const isExp = expandido === m.id
                return (
                  <>
                    <tr key={m.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'} ${m.status === 'new' ? 'font-semibold' : ''}`}
                      onClick={() => { setExpandido(isExp ? null : m.id); if (m.status === 'new') marcarStatus(m.id, 'read') }}>
                      <td className="px-3 py-4 text-gray-400">
                        {isExp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        <p>{new Date(m.created_at).toLocaleDateString('pt-BR')}</p>
                        <p className="text-gray-300">{tempoRelativo(m.created_at)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800">{m.name || '—'}</p>
                        <p className="text-xs text-blue-500">{m.email || ''}</p>
                        {m.phone && <p className="text-xs text-gray-400">{m.phone}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">{m.message}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={m.id + '_exp'} className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={5} className="px-8 py-5">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-black text-gray-500 uppercase mb-2">Mensagem completa</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-500 uppercase mb-2">Alterar status</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_CFG).map(([k, v]) => (
                                  <button key={k}
                                    onClick={e => { e.stopPropagation(); marcarStatus(m.id, k) }}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${m.status === k ? `${v.bg} ${v.text} border-current` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                                    {v.label}
                                  </button>
                                ))}
                              </div>
                              {m.email && (
                                <a href={`mailto:${m.email}`}
                                  className="mt-3 flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-800"
                                  onClick={e => e.stopPropagation()}>
                                  ✉️ Responder por e-mail
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
