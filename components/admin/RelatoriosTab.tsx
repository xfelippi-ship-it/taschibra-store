/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TrendingUp, ShoppingBag, Package, Truck, BarChart2, Printer } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Periodo = 'hoje' | 'ontem' | '7d' | '30d' | 'ano' | 'custom'

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'custom', label: 'Personalizado' },
  { id: 'hoje',   label: 'Hoje' },
  { id: 'ontem',  label: 'Ontem' },
  { id: '7d',     label: 'Últimos 7 dias' },
  { id: '30d',    label: 'Últimos 30 dias' },
  { id: 'ano',    label: 'Último ano' },
]

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function getPeriodoRange(p: Periodo, customDe?: string, customAte?: string): [Date, Date] {
  const now = new Date()
  const hoje = new Date(now); hoje.setHours(0,0,0,0)
  const fimHoje = new Date(now); fimHoje.setHours(23,59,59,999)

  switch (p) {
    case 'hoje':  return [hoje, fimHoje]
    case 'ontem': {
      const d = new Date(hoje); d.setDate(d.getDate() - 1)
      const f = new Date(d);    f.setHours(23,59,59,999)
      return [d, f]
    }
    case '7d': {
      const d = new Date(hoje); d.setDate(d.getDate() - 6)
      return [d, fimHoje]
    }
    case '30d': {
      const d = new Date(hoje); d.setDate(d.getDate() - 29)
      return [d, fimHoje]
    }
    case 'ano': {
      const d = new Date(hoje); d.setFullYear(d.getFullYear() - 1)
      return [d, fimHoje]
    }
    case 'custom': {
      const de  = customDe  ? new Date(customDe + 'T00:00:00')  : new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const ate = customAte ? new Date(customAte + 'T23:59:59') : fimHoje
      return [de, ate]
    }
  }
}

// ─── Mini gráfico de barras ────────────────────────────────────────────────
function MiniGrafico({ dados, cor = 'bg-green-500' }: { dados: { label: string; value: number }[]; cor?: string }) {
  const max = Math.max(...dados.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-0.5 h-20 mt-4">
      {dados.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div
            className={`w-full ${cor} rounded-sm hover:opacity-80 transition-opacity cursor-pointer`}
            style={{ height: `${Math.max((d.value / max) * 76, d.value > 0 ? 3 : 1)}px` }}
          />
          {d.value > 0 && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
              {d.label}: R$ {fmt(d.value)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Abas de período ──────────────────────────────────────────────────────
function AbasPeriodo({
  ativo, onChange, customDe, customAte, onCustomDe, onCustomAte
}: {
  ativo: Periodo
  onChange: (p: Periodo) => void
  customDe: string; customAte: string
  onCustomDe: (v: string) => void; onCustomAte: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 mb-6">
      {PERIODOS.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${
            ativo === p.id
              ? 'bg-green-600 text-white border-green-600'
              : 'text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600'
          }`}>
          {p.label}
        </button>
      ))}
      {ativo === 'custom' && (
        <div className="flex items-center gap-2 ml-2">
          <input type="date" value={customDe} onChange={e => onCustomDe(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
          <span className="text-gray-400 text-sm">até</span>
          <input type="date" value={customAte} onChange={e => onCustomAte(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// RELATÓRIO 1 — Volume de Faturamento
// ══════════════════════════════════════════════════════════════════════════
function RelatorioVolume() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [customDe, setCustomDe]   = useState('')
  const [customAte, setCustomAte] = useState('')
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const [de, ate] = getPeriodoRange(periodo, customDe, customAte)
    const { data } = await supabase
      .from('orders')
      .select('total, shipping_total, created_at, status, payment_status')
      .gte('created_at', de.toISOString())
      .lte('created_at', ate.toISOString())
      .in('payment_status', ['paid', 'captured'])
    setPedidos(data || [])
    setLoading(false)
  }, [periodo, customDe, customAte])

  useEffect(() => { carregar() }, [carregar])

  const totalPagamentos = pedidos.reduce((s, p) => s + Number(p.total || 0), 0)
  const totalTransporte = pedidos.reduce((s, p) => s + Number(p.shipping_total || 0), 0)
  const totalPedidos    = pedidos.length
  const totalItens      = totalPedidos // sem order_items aqui
  const ticketMedio     = totalPedidos > 0 ? totalPagamentos / totalPedidos : 0

  // Gráfico por dia
  const [de, ate] = getPeriodoRange(periodo, customDe, customAte)
  const dias = Math.min(Math.ceil((ate.getTime() - de.getTime()) / 86400000) + 1, 60)
  const graficoDados = Array.from({ length: dias }, (_, i) => {
    const d = new Date(de); d.setDate(d.getDate() + i); d.setHours(0,0,0,0)
    const f = new Date(d); f.setHours(23,59,59,999)
    const total = pedidos
      .filter(p => { const c = new Date(p.created_at); return c >= d && c <= f })
      .reduce((s, p) => s + Number(p.total || 0), 0)
    return { label: `${d.getDate()}/${d.getMonth()+1}`, value: total }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-gray-800">Relatório » Volume de Faturamento</h2>
        <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <Printer size={14} /> Imprimir
        </button>
      </div>
      <AbasPeriodo ativo={periodo} onChange={setPeriodo} customDe={customDe} customAte={customAte} onCustomDe={setCustomDe} onCustomAte={setCustomAte} />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <div className="text-2xl font-black text-gray-800">R$ {fmt(totalPagamentos)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Pagamentos confirmados</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <Truck size={16} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-gray-800">R$ {fmt(totalTransporte)}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Transporte · {totalPagamentos > 0 ? ((totalTransporte / totalPagamentos) * 100).toFixed(1) : 0}% dos pagamentos
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <ShoppingBag size={16} className="text-purple-600" />
              </div>
              <div className="text-2xl font-black text-gray-800">{totalPedidos}</div>
              <div className="text-xs text-gray-500 mt-0.5">Pedidos pagos</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                <BarChart2 size={16} className="text-orange-600" />
              </div>
              <div className="text-2xl font-black text-gray-800">R$ {fmt(ticketMedio)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Ticket médio por pedido</div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-black text-gray-700 mb-1 text-sm uppercase tracking-wide">Pedidos por Período</h3>
            <p className="text-xs text-gray-400 mb-2">* Agrupados pela data de confirmação do pagamento</p>
            {pedidos.length === 0 ? (
              <div className="text-center py-8 text-gray-300 text-sm">Sem dados no período selecionado</div>
            ) : (
              <MiniGrafico dados={graficoDados} cor="bg-green-500" />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// RELATÓRIO 2 — Ticket Médio
// ══════════════════════════════════════════════════════════════════════════
function RelatorioTicket() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [customDe, setCustomDe]   = useState('')
  const [customAte, setCustomAte] = useState('')
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const [de, ate] = getPeriodoRange(periodo, customDe, customAte)
    const { data } = await supabase
      .from('orders')
      .select('total, created_at')
      .gte('created_at', de.toISOString())
      .lte('created_at', ate.toISOString())
      .in('payment_status', ['paid', 'captured'])
    setPedidos(data || [])
    setLoading(false)
  }, [periodo, customDe, customAte])

  useEffect(() => { carregar() }, [carregar])

  const totalFat    = pedidos.reduce((s, p) => s + Number(p.total || 0), 0)
  const qtdPedidos  = pedidos.length
  const ticketMedio = qtdPedidos > 0 ? totalFat / qtdPedidos : 0

  const [de, ate] = getPeriodoRange(periodo, customDe, customAte)
  const dias = Math.min(Math.ceil((ate.getTime() - de.getTime()) / 86400000) + 1, 60)
  const graficoDados = Array.from({ length: dias }, (_, i) => {
    const d = new Date(de); d.setDate(d.getDate() + i); d.setHours(0,0,0,0)
    const f = new Date(d); f.setHours(23,59,59,999)
    const arr = pedidos.filter(p => { const c = new Date(p.created_at); return c >= d && c <= f })
    const ticket = arr.length > 0 ? arr.reduce((s, p) => s + Number(p.total || 0), 0) / arr.length : 0
    return { label: `${d.getDate()}/${d.getMonth()+1}`, value: ticket }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-gray-800">Relatório » Ticket Médio</h2>
        <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <Printer size={14} /> Imprimir
        </button>
      </div>
      <AbasPeriodo ativo={periodo} onChange={setPeriodo} customDe={customDe} customAte={customAte} onCustomDe={setCustomDe} onCustomAte={setCustomAte} />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <p className="text-xs font-black text-gray-500 uppercase mb-3">Ticket médio por pedido</p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-black text-gray-800">R$ {fmt(totalFat)}</div>
                <div className="text-xs text-gray-400">em pagamentos confirmados</div>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-800">{qtdPedidos}</div>
                <div className="text-xs text-gray-400">pedidos pagos</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-700">R$ {fmt(ticketMedio)}</div>
                <div className="text-xs text-gray-400">ticket médio</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-black text-gray-700 mb-1 text-sm uppercase tracking-wide">Ticket por Período</h3>
            <p className="text-xs text-gray-400 mb-2">* Agrupados pela data de confirmação do pagamento</p>
            {pedidos.length === 0 ? (
              <div className="text-center py-8 text-gray-300 text-sm">Sem dados no período selecionado</div>
            ) : (
              <MiniGrafico dados={graficoDados} cor="bg-blue-500" />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// RELATÓRIO 3 — Produtos mais Vendidos
// ══════════════════════════════════════════════════════════════════════════
function RelatorioProdutos() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [customDe, setCustomDe]   = useState('')
  const [customAte, setCustomAte] = useState('')
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const [de, ate] = getPeriodoRange(periodo, customDe, customAte)

    // Buscar order_items dos pedidos pagos no período
    const { data: pedidos } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', de.toISOString())
      .lte('created_at', ate.toISOString())
      .in('payment_status', ['paid', 'captured'])

    if (!pedidos || pedidos.length === 0) {
      setItens([]); setLoading(false); return
    }

    const ids = pedidos.map(p => p.id)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('name_snapshot, quantity, total_price, sku')
      .in('order_id', ids)

    // Agrupar por produto
    const mapa: Record<string, { name: string; sku: string; qtd: number; total: number }> = {}
    for (const item of (orderItems || [])) {
      const key = item.sku || item.name_snapshot
      if (!mapa[key]) mapa[key] = { name: item.name_snapshot, sku: item.sku || '—', qtd: 0, total: 0 }
      mapa[key].qtd   += Number(item.quantity) || 0
      mapa[key].total += Number(item.total_price) || 0
    }

    const sorted = Object.values(mapa).sort((a, b) => b.total - a.total)
    setItens(sorted)
    setLoading(false)
  }, [periodo, customDe, customAte])

  useEffect(() => { carregar() }, [carregar])

  const itensFiltrados = busca
    ? itens.filter(i => i.name?.toLowerCase().includes(busca.toLowerCase()) || i.sku?.includes(busca))
    : itens

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-gray-800">Relatório » Produtos mais Vendidos</h2>
        <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <Printer size={14} /> Imprimir
        </button>
      </div>
      <AbasPeriodo ativo={periodo} onChange={setPeriodo} customDe={customDe} customAte={customAte} onCustomDe={setCustomDe} onCustomAte={setCustomAte} />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          <div className="mb-3">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produto ou SKU..."
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 w-72"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {itensFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-300 text-sm">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                Sem dados no período selecionado
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase w-8">#</th>
                    <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Produto</th>
                    <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">SKU</th>
                    <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Total Vendas</th>
                    <th className="text-right px-5 py-3 text-xs font-black text-gray-500 uppercase">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {itensFiltrados.map((item, i) => (
                    <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-5 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-sm text-gray-800 truncate max-w-xs">{item.name}</p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-black text-gray-800 text-sm">{item.qtd}</span>
                        <span className="text-xs text-gray-400 ml-1">un</span>
                      </td>
                      <td className="px-5 py-3 text-right font-black text-green-700 text-sm">
                        R$ {fmt(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-5 py-3 text-xs font-black text-gray-500 uppercase">
                      {itensFiltrados.length} produto{itensFiltrados.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3 text-center font-black text-gray-700 text-sm">
                      {itensFiltrados.reduce((s, i) => s + i.qtd, 0)} un
                    </td>
                    <td className="px-5 py-3 text-right font-black text-green-700 text-sm">
                      R$ {fmt(itensFiltrados.reduce((s, i) => s + i.total, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════
type Relatorio = 'volume' | 'ticket' | 'produtos'

const RELATORIOS: { id: Relatorio; label: string; icon: React.ReactNode }[] = [
  { id: 'volume',   label: 'Volume de Faturamento', icon: <TrendingUp size={15} /> },
  { id: 'ticket',   label: 'Ticket Médio',           icon: <BarChart2 size={15} /> },
  { id: 'produtos', label: 'Produtos mais Vendidos', icon: <Package size={15} /> },
]

export default function RelatoriosTab() {
  const [ativo, setAtivo] = useState<Relatorio>('volume')

  return (
    <div>
      {/* Navegação entre relatórios */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {RELATORIOS.map(r => (
          <button
            key={r.id}
            onClick={() => setAtivo(r.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              ativo === r.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {ativo === 'volume'   && <RelatorioVolume />}
      {ativo === 'ticket'   && <RelatorioTicket />}
      {ativo === 'produtos' && <RelatorioProdutos />}
    </div>
  )
}
