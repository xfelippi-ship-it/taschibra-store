/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShoppingCart, Mail, RefreshCw, Filter, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STEPS = ['cart', 'address', 'shipping', 'payment']
const STEP_LABELS: Record<string, string> = {
  cart:     'Carrinho',
  address:  'Endereço',
  shipping: 'Frete',
  payment:  'Pagamento',
}
const STEP_COLORS: Record<string, string> = {
  cart:     'bg-gray-400',
  address:  'bg-yellow-400',
  shipping: 'bg-blue-400',
  payment:  'bg-red-500',
}

function ProgressBar({ step }: { step: string }) {
  const idx = STEPS.indexOf(step)
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / STEPS.length) * 100)
  const color = STEP_COLORS[step] || 'bg-gray-300'
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap font-bold w-16">
        {STEP_LABELS[step] || step}
      </span>
    </div>
  )
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function tempoRelativo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `há ${d} dia${d > 1 ? 's' : ''}`
  if (h > 0) return `há ${h}h`
  const m = Math.floor(diff / 60000)
  return `há ${m}min`
}

export default function CarrinhosAbandonadosTab() {
  const [carrinhos, setCarrinhos]     = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [enviando, setEnviando]       = useState<Record<string, boolean>>({})
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  // Filtros
  const [busca,       setBusca]       = useState('')
  const [filtroStep,  setFiltroStep]  = useState('todos')
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    // Carrinhos = registros não convertidos atualizados há mais de 4h
    const limite = new Date(Date.now() - 4 * 3600000).toISOString()
    const { data } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('converted', false)
      .lt('updated_at', limite)
      .order('updated_at', { ascending: false })
      .limit(200)
    setCarrinhos(data || [])
    setLoading(false)
  }

  async function enviarLembrete(carrinho: any) {
    if (!carrinho.customer_email) return
    setEnviando(e => ({ ...e, [carrinho.id]: true }))
    try {
      await fetch('/api/carrinho-lembrete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: carrinho.id, email: carrinho.customer_email })
      })
      await supabase.from('abandoned_carts').update({
        reminder_sent_at: new Date().toISOString(),
        reminder_count: (carrinho.reminder_count || 0) + 1
      }).eq('id', carrinho.id)
      carregar()
    } finally {
      setEnviando(e => ({ ...e, [carrinho.id]: false }))
    }
  }

  async function enviarEmMassa() {
    if (selecionados.size === 0) return
    if (!confirm(`Enviar e-mail lembrete para ${selecionados.size} cliente(s)?`)) return
    const lista = carrinhosFiltrados.filter(c => selecionados.has(c.id) && c.customer_email)
    for (const c of lista) await enviarLembrete(c)
    setSelecionados(new Set())
  }

  function toggleSelecionado(id: string) {
    const novo = new Set(selecionados)
    novo.has(id) ? novo.delete(id) : novo.add(id)
    setSelecionados(novo)
  }

  function toggleTodos() {
    if (selecionados.size === carrinhosFiltrados.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(carrinhosFiltrados.map(c => c.id)))
    }
  }

  const carrinhosFiltrados = carrinhos.filter(c => {
    if (busca) {
      const b = busca.toLowerCase()
      if (
        !c.customer_name?.toLowerCase().includes(b) &&
        !c.customer_email?.toLowerCase().includes(b) &&
        !c.customer_cpf?.includes(b)
      ) return false
    }
    if (filtroStep !== 'todos' && c.last_step_reached !== filtroStep) return false
    if (filtroDataDe) {
      const de = new Date(filtroDataDe); de.setHours(0,0,0,0)
      if (new Date(c.created_at) < de) return false
    }
    if (filtroDataAte) {
      const ate = new Date(filtroDataAte); ate.setHours(23,59,59,999)
      if (new Date(c.created_at) > ate) return false
    }
    return true
  })

  const totalSelecionado = carrinhosFiltrados
    .filter(c => selecionados.has(c.id))
    .reduce((s, c) => s + (Number(c.total) || 0), 0)

  const totalGeral = carrinhosFiltrados
    .reduce((s, c) => s + (Number(c.total) || 0), 0)

  const filtrosAtivos = filtroStep !== 'todos' || filtroDataDe !== '' || filtroDataAte !== ''

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
  const selectCls = `${inputCls} bg-white`

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Carrinhos Abandonados</h1>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {carrinhosFiltrados.length} carrinho{carrinhosFiltrados.length !== 1 ? 's' : ''}
              {' · '}
              <span className="text-green-700 font-bold">R$ {fmt(totalGeral)}</span>
              {' · '}
              <span className="text-gray-400 text-xs">Sem alteração nas últimas 4h</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selecionados.size > 0 && (
            <button
              onClick={enviarEmMassa}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
              <Mail size={14} /> Enviar lembrete ({selecionados.size})
            </button>
          )}
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`flex items-center gap-2 text-sm font-bold px-3 py-2.5 rounded-lg border transition-colors ${
              filtrosAtivos ? 'bg-green-600 text-white border-green-600' : 'text-gray-500 border-gray-200 hover:border-green-300'
            }`}>
            <Filter size={14} /> Filtros
          </button>
          <button
            onClick={carregar}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 border border-gray-200 px-3 py-2.5 rounded-lg hover:border-green-300 transition-colors">
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="flex gap-2 mb-3">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF..."
          className={`flex-1 ${inputCls}`}
        />
        {(busca || filtrosAtivos) && (
          <button
            onClick={() => { setBusca(''); setFiltroStep('todos'); setFiltroDataDe(''); setFiltroDataAte('') }}
            className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 px-3 rounded-lg hover:bg-red-50 transition-colors">
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {/* Filtros avançados */}
      {filtrosAbertos && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Etapa do Checkout</label>
            <select value={filtroStep} onChange={e => setFiltroStep(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todas</option>
              {STEPS.map(s => <option key={s} value={s}>{STEP_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">A partir de</label>
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
          <div className="text-center py-16 text-gray-400 text-sm">Carregando carrinhos...</div>
        ) : carrinhosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhum carrinho abandonado.</p>
            <p className="text-xs mt-1 text-gray-300">Carrinhos sem alteração há mais de 4 horas aparecem aqui.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selecionados.size === carrinhosFiltrados.length && carrinhosFiltrados.length > 0}
                    onChange={toggleTodos}
                    className="w-4 h-4 accent-green-600 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Criado</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Atualizado</th>
                <th className="text-right px-4 py-3 text-xs font-black text-gray-500 uppercase">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Etapa do Checkout</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Último Envio</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {carrinhosFiltrados.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selecionados.has(c.id)}
                      onChange={() => toggleSelecionado(c.id)}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400 font-mono">#{i + 1}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-sm text-gray-800">{c.customer_name || '—'}</p>
                    {c.customer_phone && <p className="text-xs text-gray-400">{c.customer_phone}</p>}
                    {c.customer_email && (
                      <p className="text-xs text-blue-500 truncate max-w-[180px]">{c.customer_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    <p>{new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
                    <p className="text-gray-300">{new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {tempoRelativo(c.updated_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-black text-green-700 text-sm">
                      R$ {fmt(Number(c.total || 0))}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ProgressBar step={c.last_step_reached || 'cart'} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    {c.reminder_sent_at ? (
                      <div className="text-center">
                        <span className="text-xs text-gray-400">{tempoRelativo(c.reminder_sent_at)}</span>
                        {c.reminder_count > 0 && (
                          <p className="text-xs text-gray-300">{c.reminder_count}x enviado</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {c.customer_email && (
                      <button
                        onClick={() => enviarLembrete(c)}
                        disabled={enviando[c.id]}
                        title="Enviar e-mail lembrete"
                        className="text-green-500 hover:text-green-700 disabled:opacity-40 transition-colors">
                        {enviando[c.id]
                          ? <RefreshCw size={15} className="animate-spin" />
                          : <Mail size={15} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Rodapé */}
            {carrinhosFiltrados.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                    {selecionados.size > 0
                      ? `${selecionados.size} selecionado${selecionados.size > 1 ? 's' : ''} · R$ ${fmt(totalSelecionado)}`
                      : `${carrinhosFiltrados.length} carrinho${carrinhosFiltrados.length !== 1 ? 's' : ''}`}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-green-700 text-sm">
                    R$ {fmt(totalGeral)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}
