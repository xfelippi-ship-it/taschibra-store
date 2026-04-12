/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Download, RefreshCw, Mail, Trash2, Filter, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewsletterTab() {
  const [inscritos, setInscritos] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [busca, setBusca]         = useState('')
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
    setInscritos(data || [])
    setLoading(false)
  }

  async function excluir(id: string, email: string) {
    if (!confirm(`Remover ${email} da newsletter?`)) return
    await supabase.from('newsletter_subscribers').delete().eq('id', id)
    carregar()
  }

  const filtrados = inscritos.filter(i => {
    if (busca && !i.email?.toLowerCase().includes(busca.toLowerCase()) && !i.name?.toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroDataDe && new Date(i.created_at) < new Date(filtroDataDe + 'T00:00:00')) return false
    if (filtroDataAte && new Date(i.created_at) > new Date(filtroDataAte + 'T23:59:59')) return false
    return true
  })

  const filtrosAtivos = filtroDataDe !== '' || filtroDataAte !== ''

  function exportarCSV() {
    const headers = ['E-mail', 'Nome', 'Data de Inscrição']
    const rows = filtrados.map(i => [
      i.email || '',
      i.name  || '',
      i.created_at ? new Date(i.created_at).toLocaleDateString('pt-BR') : ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `newsletter_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Newsletter</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtrados.length} inscrito{filtrados.length !== 1 ? 's' : ''}{busca || filtrosAtivos ? ' filtrado' + (filtrados.length !== 1 ? 's' : '') : ' no total'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportarCSV}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportar CSV
          </button>
          <button onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`flex items-center gap-2 text-sm font-bold px-3 py-2.5 rounded-lg border transition-colors ${filtrosAtivos ? 'bg-green-600 text-white border-green-600' : 'text-gray-500 border-gray-200 hover:border-green-300'}`}>
            <Filter size={14} />
          </button>
          <button onClick={carregar}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 border border-gray-200 px-3 py-2.5 rounded-lg hover:border-green-300 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por e-mail ou nome..."
          className={`flex-1 ${inputCls}`} />
        {(busca || filtrosAtivos) && (
          <button onClick={() => { setBusca(''); setFiltroDataDe(''); setFiltroDataAte('') }}
            className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 px-3 rounded-lg hover:bg-red-50">
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {filtrosAbertos && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Inscrito a partir de</label>
            <input type="date" value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Até</label>
            <input type="date" value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhum inscrito encontrado.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Data de Inscrição</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase w-16">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i, idx) => (
                <tr key={i.id} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-5 py-4 text-sm text-blue-600 font-semibold">{i.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{i.name || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(i.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => excluir(i.id, i.email)} className="text-red-300 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-5 py-3 text-xs font-black text-gray-500 uppercase">
                  {filtrados.length} inscrito{filtrados.length !== 1 ? 's' : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
