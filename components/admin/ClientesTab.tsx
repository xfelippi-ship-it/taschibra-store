/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users, Download, Filter, X, RefreshCw } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  approved:  { label: 'Aprovado',  bg: 'bg-green-100', text: 'text-green-700' },
  pending:   { label: 'Pendente',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
  blocked:   { label: 'Bloqueado', bg: 'bg-red-100',    text: 'text-red-700'   },
}

export default function ClientesTab() {
  const [clientes, setClientes]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  // Filtros
  const [busca,        setBusca]        = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroGenero, setFiltroGenero] = useState('todos')
  const [filtroMesAniv, setFiltroMesAniv] = useState('todos')
  const [filtroDataDe,  setFiltroDataDe]  = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    setClientes(data || [])
    setLoading(false)
  }

  const filtrosAtivos = filtroStatus !== 'todos' || filtroGenero !== 'todos' ||
    filtroMesAniv !== 'todos' || filtroDataDe !== '' || filtroDataAte !== ''

  function limpar() {
    setBusca(''); setFiltroStatus('todos'); setFiltroGenero('todos')
    setFiltroMesAniv('todos'); setFiltroDataDe(''); setFiltroDataAte('')
  }

  const clientesFiltrados = clientes.filter(c => {
    if (busca) {
      const b = busca.toLowerCase()
      if (!c.name?.toLowerCase().includes(b) && !c.email?.toLowerCase().includes(b) &&
          !c.cpf?.includes(b) && !c.phone?.includes(b)) return false
    }
    if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false
    if (filtroGenero !== 'todos' && c.gender !== filtroGenero) return false
    if (filtroMesAniv !== 'todos') {
      if (!c.birthdate) return false
      const mes = new Date(c.birthdate).getMonth() + 1
      if (mes !== parseInt(filtroMesAniv)) return false
    }
    if (filtroDataDe) {
      if (new Date(c.created_at) < new Date(filtroDataDe + 'T00:00:00')) return false
    }
    if (filtroDataAte) {
      if (new Date(c.created_at) > new Date(filtroDataAte + 'T23:59:59')) return false
    }
    return true
  })

  function exportarCSV() {
    const headers = ['Nome', 'E-mail', 'CPF/CNPJ', 'Telefone', 'Status', 'Cadastrado em', 'ERP ID']
    const rows = clientesFiltrados.map(c => [
      c.name || '',
      c.email || '',
      c.cpf || '',
      c.phone || '',
      c.status || '',
      c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '',
      c.erp_customer_id || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
  const selectCls = `${inputCls} bg-white`

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Clientes</h1>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''}
              {filtrosAtivos || busca ? ' encontrado' + (clientesFiltrados.length !== 1 ? 's' : '') : ' no total'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportarCSV}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportar CSV
          </button>
          <button onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`flex items-center gap-2 text-sm font-bold px-3 py-2.5 rounded-lg border transition-colors ${
              filtrosAtivos ? 'bg-green-600 text-white border-green-600' : 'text-gray-500 border-gray-200 hover:border-green-300'
            }`}>
            <Filter size={14} /> Filtros
          </button>
          <button onClick={carregar}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 border border-gray-200 px-3 py-2.5 rounded-lg hover:border-green-300 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="flex gap-2 mb-3">
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail, CPF ou telefone..."
          className={`flex-1 ${inputCls}`} />
        {(busca || filtrosAtivos) && (
          <button onClick={limpar}
            className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 px-3 rounded-lg hover:bg-red-50 transition-colors">
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {/* Filtros avançados */}
      {filtrosAbertos && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Status</label>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              <option value="approved">Aprovado</option>
              <option value="pending">Pendente</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Gênero</label>
            <select value={filtroGenero} onChange={e => setFiltroGenero(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Mês Aniversário</label>
            <select value={filtroMesAniv} onChange={e => setFiltroMesAniv(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Cadastrado de</label>
            <input type="date" value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Até</label>
            <input type="date" value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Carregando clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhum cliente encontrado.</p>
            {(filtrosAtivos || busca) && (
              <button onClick={limpar} className="mt-2 text-xs text-green-600 hover:underline font-bold">Limpar filtros</button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Data Cadastro</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Contato</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Último Pedido</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">ERP</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c, i) => {
                const st = STATUS_CFG[c.status] || { label: c.status || '—', bg: 'bg-gray-100', text: 'text-gray-500' }
                return (
                  <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-sm text-gray-800">{c.name || '—'}</p>
                      <p className="text-xs text-gray-400 font-mono">{c.cpf || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600">{c.email || '—'}</p>
                      {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {c.last_order_at
                        ? new Date(c.last_order_at).toLocaleDateString('pt-BR')
                        : <span className="text-gray-300">Nenhum pedido</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {c.erp_customer_id ? (
                        <span className="flex items-center justify-center gap-1 text-xs font-bold text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          {c.erp_customer_id}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={6} className="px-5 py-3 text-xs font-black text-gray-500 uppercase">
                  {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
