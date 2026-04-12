'use client'
import { useState, useEffect } from 'react'
import {
  TrendingUp, ShoppingBag, Package, AlertTriangle,
  ArrowUp, ArrowDown, Users, BarChart2, UserPlus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Pedido = {
  id: string
  created_at: string
  total: number
  status: string
  payment_status?: string
  order_number?: string
  customer_email?: string
  customers?: { name: string; email: string; phone?: string }
}

type Produto = {
  id: string
  name: string
  sku: string
  stock_qty: number
  price: number
  active: boolean
}

type OrderItem = {
  name_snapshot: string
  quantity: number
  total_price: number
}

type Cliente = {
  id: string
  created_at: string
  name?: string
  email?: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Aguardando Pagamento', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed:  { label: 'Confirmado',           bg: 'bg-blue-100',   text: 'text-blue-700'   },
  processing: { label: 'Em Separação',         bg: 'bg-purple-100', text: 'text-purple-700' },
  shipped:    { label: 'Enviado',              bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered:  { label: 'Entregue',             bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled:  { label: 'Cancelado',            bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:   { label: 'Estornado',            bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${text}`}>{label}</span>
}

function EmptyState({ icon, msg, sub }: { icon: string; msg: string; sub?: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-500 text-sm font-semibold">{msg}</p>
      {sub && <p className="text-gray-300 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function KpiCard({
  icon, iconBg, label, value, sub, badge
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub?: string
  badge?: { value: string; positive: boolean } | null
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${badge.positive ? 'text-green-600' : 'text-red-500'}`}>
            {badge.positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {badge.value}
          </span>
        )}
      </div>
      <div className="text-xl font-black text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function DashboardTab() {
  const [pedidos, setPedidos]   = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [topItens, setTopItens] = useState<{ name: string; qtd: number; total: number }[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: ped },
        { data: prod },
        { data: cli },
        { data: items },
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('*, customers(name, email, phone)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('products')
          .select('id,name,sku,stock_qty,price,active')
          .eq('active', true),
        supabase
          .from('customers')
          .select('id, created_at, name, email')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('order_items')
          .select('name_snapshot, quantity, total_price')
          .limit(2000),
      ])

      setPedidos(ped || [])
      setProdutos(prod || [])
      setClientes(cli || [])

      // Top 5 produtos por receita
      const mapa: Record<string, { name: string; qtd: number; total: number }> = {}
      for (const item of (items || []) as OrderItem[]) {
        const key = item.name_snapshot || 'Sem nome'
        if (!mapa[key]) mapa[key] = { name: key, qtd: 0, total: 0 }
        mapa[key].qtd   += item.quantity || 0
        mapa[key].total += Number(item.total_price) || 0
      }
      const sorted = Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5)
      setTopItens(sorted)

      setLoading(false)
    }
    load()
  }, [])

  // ── Datas de referência ───────────────────────────────────────────────────
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const inicioSemana   = new Date(hoje); inicioSemana.setDate(hoje.getDate() - 7)
  const inicioMes      = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicioMesPass  = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const fimMesPass     = new Date(hoje.getFullYear(), hoje.getMonth(), 0)

  // ── Pedidos filtrados ─────────────────────────────────────────────────────
  const pedHoje    = pedidos.filter(p => new Date(p.created_at) >= hoje)
  const pedSemana  = pedidos.filter(p => new Date(p.created_at) >= inicioSemana)
  const pedMes     = pedidos.filter(p => new Date(p.created_at) >= inicioMes)
  const pedMesPass = pedidos.filter(p => {
    const d = new Date(p.created_at)
    return d >= inicioMesPass && d <= fimMesPass
  })

  const fat = (arr: Pedido[]) => arr.reduce((s, p) => s + (Number(p.total) || 0), 0)
  const fatHoje    = fat(pedHoje)
  const fatSemana  = fat(pedSemana)
  const fatMes     = fat(pedMes)
  const fatMesPass = fat(pedMesPass)

  const variacaoMes = fatMesPass > 0
    ? ((fatMes - fatMesPass) / fatMesPass * 100).toFixed(1)
    : null

  const ticketMedio = pedMes.length > 0 ? fatMes / pedMes.length : 0

  // ── Clientes ──────────────────────────────────────────────────────────────
  const cliHoje   = clientes.filter(c => new Date(c.created_at) >= hoje).length
  const cliSemana = clientes.filter(c => new Date(c.created_at) >= inicioSemana).length
  const cliMes    = clientes.filter(c => new Date(c.created_at) >= inicioMes).length

  // ── Estoque ───────────────────────────────────────────────────────────────
  const semEstoque    = produtos.filter(p => p.stock_qty === 0)
  const estoqueCritico = produtos.filter(p => p.stock_qty > 0 && p.stock_qty <= 5)

  // ── Top clientes por valor ────────────────────────────────────────────────
  const topClientes = Object.values(
    pedidos.reduce((acc: Record<string, { nome: string; email: string; total: number; qtd: number }>, p) => {
      const email = p.customers?.email || p.customer_email || 'anônimo'
      const nome  = p.customers?.name  || email
      if (!acc[email]) acc[email] = { nome, email, total: 0, qtd: 0 }
      acc[email].total += Number(p.total) || 0
      acc[email].qtd   += 1
      return acc
    }, {})
  ).sort((a, b) => b.total - a.total).slice(0, 5)

  // ── Gráfico 30 dias ───────────────────────────────────────────────────────
  const ultimos30 = Array.from({ length: 30 }, (_, i) => {
    const d   = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0, 0, 0, 0)
    const fim = new Date(d); fim.setHours(23, 59, 59, 999)
    const total = pedidos
      .filter(p => { const c = new Date(p.created_at); return c >= d && c <= fim })
      .reduce((s, p) => s + (Number(p.total) || 0), 0)
    return { dia: d.getDate(), mes: d.getMonth(), total }
  })
  const maxGrafico = Math.max(...ultimos30.map(d => d.total), 1)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Carregando dashboard...
    </div>
  )

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
        <span className="text-sm text-gray-400">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* ── Resumo de Hoje ──────────────────────────────────────────────── */}
      <div className="bg-green-900 rounded-xl p-4 mb-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-green-400 text-xs font-bold uppercase tracking-wide mb-1">Volume hoje</p>
          <p className="text-white text-xl font-black">R$ {fmt(fatHoje)}</p>
          <p className="text-green-400 text-xs mt-0.5">{pedHoje.length} pedido{pedHoje.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-center border-x border-green-800">
          <p className="text-green-400 text-xs font-bold uppercase tracking-wide mb-1">Novos clientes hoje</p>
          <p className="text-white text-xl font-black">{cliHoje}</p>
          <p className="text-green-400 text-xs mt-0.5">{cliSemana} na semana</p>
        </div>
        <div className="text-center">
          <p className="text-green-400 text-xs font-bold uppercase tracking-wide mb-1">Ticket médio</p>
          <p className="text-white text-xl font-black">R$ {fmt(ticketMedio)}</p>
          <p className="text-green-400 text-xs mt-0.5">{pedMes.length} pedidos no mês</p>
        </div>
      </div>

      {/* ── KPIs principais ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<TrendingUp size={16} className="text-green-600" />}
          iconBg="bg-green-50"
          label="Faturamento do mês"
          value={`R$ ${fmt(fatMes)}`}
          sub={fatMesPass > 0 ? `Mês passado: R$ ${fmt(fatMesPass)}` : undefined}
          badge={variacaoMes ? { value: `${Math.abs(Number(variacaoMes))}%`, positive: Number(variacaoMes) >= 0 } : null}
        />
        <KpiCard
          icon={<TrendingUp size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
          label="Faturamento semana"
          value={`R$ ${fmt(fatSemana)}`}
          sub={`Hoje: R$ ${fmt(fatHoje)}`}
        />
        <KpiCard
          icon={<ShoppingBag size={16} className="text-purple-600" />}
          iconBg="bg-purple-50"
          label="Pedidos este mês"
          value={String(pedMes.length)}
          sub={`Ticket médio: R$ ${fmt(ticketMedio)}`}
        />
        <KpiCard
          icon={<UserPlus size={16} className="text-teal-600" />}
          iconBg="bg-teal-50"
          label="Novos clientes / mês"
          value={String(cliMes)}
          sub={`Total cadastros: ${clientes.length}`}
        />
      </div>

      {/* ── Gráfico 30 dias ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-800 flex items-center gap-2">
            <BarChart2 size={16} className="text-green-600" />
            Faturamento — Últimos 30 dias
          </h2>
          <span className="text-xs text-gray-400">R$ {fmt(fatMes)} no mês</span>
        </div>
        {pedidos.length === 0 ? (
          <EmptyState icon="📈" msg="Aguardando primeiros pedidos" />
        ) : (
          <div className="flex items-end gap-0.5 h-24">
            {ultimos30.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-green-500 rounded-sm hover:bg-green-600 transition-colors cursor-pointer"
                  style={{ height: `${Math.max((d.total / maxGrafico) * 88, d.total > 0 ? 4 : 1)}px` }}
                />
                {d.total > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {d.dia}/{d.mes + 1}: R$ {fmt(d.total)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Últimos pedidos + Estoque crítico ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4">Últimos Pedidos</h2>
          {pedidos.length === 0 ? (
            <EmptyState icon="🛒" msg="Nenhum pedido ainda" />
          ) : pedidos.slice(0, 8).map(p => {
            const st = STATUS_CONFIG[p.status] || { label: p.status, bg: 'bg-gray-100', text: 'text-gray-600' }
            return (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800">
                    {p.order_number || `#${p.id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.customers?.name || p.customer_email || '—'} ·{' '}
                    {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge label={st.label} bg={st.bg} text={st.text} />
                <span className="font-black text-green-700 text-sm whitespace-nowrap">
                  R$ {fmt(Number(p.total || 0))}
                </span>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-orange-500" /> Estoque Crítico
          </h2>
          {estoqueCritico.length === 0 && semEstoque.length === 0 ? (
            <EmptyState icon="✅" msg="Tudo OK" sub="Nenhum produto com estoque crítico." />
          ) : (
            <div className="space-y-2">
              {[...semEstoque, ...estoqueCritico].slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</p>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                    p.stock_qty === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {p.stock_qty === 0 ? 'SEM ESTOQUE' : `${p.stock_qty} un`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Produtos + Top Clientes + Novos Clientes ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Top 5 Produtos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4">🏆 Top 5 Produtos Vendidos</h2>
          {topItens.length === 0 ? (
            <EmptyState icon="📦" msg="Aguardando vendas" sub="Aparecerá após os primeiros pedidos." />
          ) : topItens.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{p.name}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs font-black text-green-700">R$ {fmt(p.total)}</p>
                <p className="text-xs text-gray-400">{p.qtd} un</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <Users size={15} className="text-blue-500" /> Top Clientes
          </h2>
          {topClientes.length === 0 ? (
            <EmptyState icon="👥" msg="Aguardando clientes" />
          ) : topClientes.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{c.nome}</p>
                <p className="text-xs text-gray-400">{c.qtd} pedido{c.qtd > 1 ? 's' : ''}</p>
              </div>
              <p className="text-xs font-black text-green-700 flex-shrink-0 ml-2">
                R$ {fmt(c.total)}
              </p>
            </div>
          ))}
        </div>

        {/* Novos Clientes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={15} className="text-teal-500" /> Novos Clientes
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Hoje',    value: cliHoje,   bg: 'bg-teal-100',   text: 'text-teal-700'   },
              { label: 'Semana',  value: cliSemana, bg: 'bg-blue-100',   text: 'text-blue-700'   },
              { label: 'Mês',     value: cliMes,    bg: 'bg-purple-100', text: 'text-purple-700' },
              { label: 'Total',   value: clientes.length, bg: 'bg-gray-100', text: 'text-gray-700' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-xs font-bold text-gray-600">{row.label}</p>
                <span className={`text-sm font-black px-3 py-0.5 rounded-full ${row.bg} ${row.text}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          {clientes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-black text-gray-500 mb-2">Últimos cadastros</p>
              {clientes.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <p className="text-xs text-gray-600 truncate max-w-[150px]">{c.name || c.email || '—'}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Pedidos por Status ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-black text-gray-800 mb-4">Pedidos por Status — Este Mês</h2>
        {pedMes.length === 0 ? (
          <EmptyState icon="📋" msg="Sem pedidos este mês" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(
              pedMes.reduce((acc: Record<string, number>, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1
                return acc
              }, {})
            ).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' }
              return (
                <div key={status} className={`rounded-xl p-4 text-center ${cfg.bg} ${cfg.text}`}>
                  <div className="text-2xl font-black">{count}</div>
                  <div className="text-xs font-bold mt-0.5 leading-tight">{cfg.label}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
