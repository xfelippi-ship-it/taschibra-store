'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Package, AlertTriangle, ArrowUp, ArrowDown, Users, BarChart2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'


type Pedido = {
  id: string
  created_at: string
  total: number
  status: string
  order_number?: string
  customer_email?: string
}

type Produto = {
  id: string
  name: string
  sku: string
  stock_qty: number
  price: number
  promo_price: number
  active: boolean
  category_slug: string
}

const statusCores: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-600',
}

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
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

function Badge({ label, cor }: { label: string; cor: string }) {
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cor}`}>{label}</span>
}

export default function DashboardTab() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: ped }, { data: prod }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('products').select('id,name,sku,stock_qty,price,promo_price,active,category_slug').eq('active', true),
      ])
      setPedidos(ped || [])
      setProdutos(prod || [])
      setLoading(false)
    }
    load()
  }, [])

  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - 7)
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0)

  const pedidosHoje = pedidos.filter(p => new Date(p.created_at) >= hoje)
  const pedidosSemana = pedidos.filter(p => new Date(p.created_at) >= inicioSemana)
  const pedidosMes = pedidos.filter(p => new Date(p.created_at) >= inicioMes)
  const pedidosMesPassado = pedidos.filter(p => {
    const d = new Date(p.created_at)
    return d >= inicioMesPassado && d <= fimMesPassado
  })

  const fat = (arr: Pedido[]) => arr.reduce((s, p) => s + (Number(p.total) || 0), 0)
  const faturamentoHoje = fat(pedidosHoje)
  const faturamentoSemana = fat(pedidosSemana)
  const faturamentoMes = fat(pedidosMes)
  const faturamentoMesPassado = fat(pedidosMesPassado)
  const variacaoMes = faturamentoMesPassado > 0
    ? ((faturamentoMes - faturamentoMesPassado) / faturamentoMesPassado * 100).toFixed(1)
    : null
  const ticketMedio = pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0

  const estoqueCritico = produtos.filter(p => p.stock_qty <= 5 && p.stock_qty > 0)
  const semEstoque = produtos.filter(p => p.stock_qty === 0)

  // Gráfico 30 dias
  const ultimos30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0,0,0,0)
    const fim = new Date(d); fim.setHours(23,59,59,999)
    const total = pedidos.filter(p => {
      const c = new Date(p.created_at)
      return c >= d && c <= fim
    }).reduce((s, p) => s + (Number(p.total) || 0), 0)
    return { dia: d.getDate(), total }
  })
  const maxGrafico = Math.max(...ultimos30.map(d => d.total), 1)

  // Top 5 produtos vendidos (simulado por orders_items — agora mostra placeholder)
  const topProdutos: { name: string; qtd: number; total: number }[] = []

  // Top clientes
  const topClientes = Object.values(
    pedidos.reduce((acc: Record<string, { email: string; total: number; pedidos: number }>, p) => {
      const email = p.customer_email || 'anônimo'
      if (!acc[email]) acc[email] = { email, total: 0, pedidos: 0 }
      acc[email].total += Number(p.total) || 0
      acc[email].pedidos += 1
      return acc
    }, {})
  ).sort((a, b) => b.total - a.total).slice(0, 5)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Carregando dashboard...</div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      {/* FATURAMENTO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            {variacaoMes && (
              <span className={`text-xs font-bold flex items-center gap-0.5 ${Number(variacaoMes) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Number(variacaoMes) >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{Math.abs(Number(variacaoMes))}%
              </span>
            )}
          </div>
          <div className="text-xl font-black text-gray-800">R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500">Faturamento do mês</div>
          {faturamentoMesPassado > 0 && <div className="text-xs text-gray-400 mt-0.5">Mês passado: R$ {faturamentoMesPassado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>}
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div className="text-xl font-black text-gray-800">R$ {faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500">Hoje</div>
          <div className="text-xs text-gray-400 mt-0.5">Semana: R$ {faturamentoSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag size={16} className="text-purple-600" />
          </div>
          <div className="text-xl font-black text-gray-800">{pedidosMes.length}</div>
          <div className="text-xs text-gray-500">Pedidos este mês</div>
          <div className="text-xs text-gray-400 mt-0.5">Ticket médio: R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
            <Package size={16} className="text-orange-600" />
          </div>
          <div className="text-xl font-black text-gray-800">{produtos.length}</div>
          <div className="text-xs text-gray-500">Produtos ativos</div>
          {semEstoque.length > 0 && <div className="text-xs text-red-500 font-bold mt-0.5">{semEstoque.length} sem estoque</div>}
        </div>
      </div>

      {/* GRÁFICO 30 DIAS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-800 flex items-center gap-2"><BarChart2 size={16} className="text-green-600" /> Faturamento — Últimos 30 dias</h2>
          <span className="text-xs text-gray-400">R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no total</span>
        </div>
        {pedidos.length === 0 ? (
          <EmptyState icon="📈" msg="Aguardando primeiros pedidos" sub="O gráfico será preenchido automaticamente após a integração com Mercado Pago." />
        ) : (
          <div className="flex items-end gap-0.5 h-24">
            {ultimos30.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-green-500 rounded-sm hover:bg-green-600 transition-colors cursor-pointer"
                  style={{ height: `${Math.max((d.total / maxGrafico) * 88, d.total > 0 ? 4 : 1)}px` }}
                />
                {d.total > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    Dia {d.dia}: R$ {d.total.toFixed(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ÚLTIMOS PEDIDOS */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4">Últimos Pedidos</h2>
          {pedidos.length === 0 ? (
            <EmptyState icon="🛒" msg="Nenhum pedido ainda" sub="Os pedidos aparecerão aqui após integração com Mercado Pago." />
          ) : pedidos.slice(0, 8).map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-bold text-sm text-gray-800">{p.order_number || p.id.slice(0,8)}</p>
                <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</p>
              </div>
              <Badge label={statusLabel[p.status] || p.status} cor={statusCores[p.status] || 'bg-gray-100 text-gray-600'} />
              <span className="font-black text-green-700 text-sm">R$ {Number(p.total||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>

        {/* ESTOQUE CRÍTICO */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-orange-500" /> Estoque Crítico
          </h2>
          {estoqueCritico.length === 0 && semEstoque.length === 0 ? (
            <EmptyState icon="✅" msg="Tudo OK" sub="Nenhum produto com estoque crítico." />
          ) : (
            <div className="space-y-2">
              {[...semEstoque, ...estoqueCritico].slice(0,10).map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</p>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${p.stock_qty === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {p.stock_qty === 0 ? 'SEM ESTOQUE' : `${p.stock_qty} un`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* TOP 5 PRODUTOS */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4">🏆 Top 5 Produtos Vendidos</h2>
          {topProdutos.length === 0 ? (
            <EmptyState icon="📦" msg="Aguardando vendas" sub="Disponível após primeiros pedidos com Mercado Pago." />
          ) : topProdutos.slice(0,5).map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center justify-center">{i+1}</span>
                <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{p.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-green-700">R$ {p.total.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{p.qtd} un</p>
              </div>
            </div>
          ))}
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2"><Users size={15} className="text-blue-500" /> Top Clientes</h2>
          {topClientes.length === 0 ? (
            <EmptyState icon="👥" msg="Aguardando clientes" sub="Disponível após primeiros pedidos." />
          ) : topClientes.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{c.email}</p>
                <p className="text-xs text-gray-400">{c.pedidos} pedido{c.pedidos > 1 ? 's' : ''}</p>
              </div>
              <p className="text-xs font-black text-green-700">R$ {c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>

        {/* MÉTRICAS FUTURAS */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4">📊 Métricas Avançadas</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-700">Taxa de Conversão</p>
                <p className="text-xs text-gray-400">Requer Google Analytics</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">Em breve</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-700">Receita por Canal</p>
                <p className="text-xs text-gray-400">Requer UTMs configurados</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">Em breve</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-700">Carrinhos Abandonados</p>
                <p className="text-xs text-gray-400">Requer login do cliente</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">Em breve</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-gray-700">Novos Clientes</p>
                <p className="text-xs text-gray-400">Hoje / semana / mês</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">Em breve</span>
            </div>
          </div>
        </div>
      </div>

      {/* PEDIDOS POR STATUS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-black text-gray-800 mb-4">Pedidos por Status — Este Mês</h2>
        {pedidosMes.length === 0 ? (
          <EmptyState icon="📋" msg="Sem pedidos este mês" sub="Os status aparecerão automaticamente com os primeiros pedidos." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(
              pedidosMes.reduce((acc: Record<string,number>, p: Pedido) => {
                acc[p.status] = (acc[p.status] || 0) + 1
                return acc
              }, {})
            ).map(([status, count]) => (
              <div key={status} className={`rounded-xl p-4 text-center ${statusCores[status] || 'bg-gray-100 text-gray-600'}`}>
                <div className="text-2xl font-black">{count}</div>
                <div className="text-xs font-bold mt-0.5">{statusLabel[status] || status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
