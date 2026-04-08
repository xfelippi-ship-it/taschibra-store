'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TrendingUp, ShoppingBag, Package, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardTab() {
  const [pedidos, setPedidos] = useState<Record<string,unknown>[]>([])
  const [produtos, setProdutos] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: ped }, { data: prod }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('products').select('id, name, sku, stock_qty, price, promo_price, active, category_slug').eq('active', true),
      ])
      setPedidos(ped || [])
      setProdutos(prod || [])
      setLoading(false)
    }
    load()
  }, [])

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0)

  const pedidosHoje = pedidos.filter(p => new Date(p.created_at) >= hoje)
  const pedidosMes = pedidos.filter(p => new Date(p.created_at) >= inicioMes)
  const pedidosMesPassado = pedidos.filter(p => {
    const d = new Date(p.created_at)
    return d >= inicioMesPassado && d <= fimMesPassado
  })

  const faturamentoHoje = pedidosHoje.reduce((s, p) => s + (Number(p.total) || 0), 0)
  const faturamentoMes = pedidosMes.reduce((s, p) => s + (Number(p.total) || 0), 0)
  const faturamentoMesPassado = pedidosMesPassado.reduce((s, p) => s + (Number(p.total) || 0), 0)
  const variacaoMes = faturamentoMesPassado > 0
    ? ((faturamentoMes - faturamentoMesPassado) / faturamentoMesPassado * 100).toFixed(1)
    : null

  const ticketMedio = pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0
  const estoqueCritico = produtos.filter(p => p.stock_qty <= 5)
  const semEstoque = produtos.filter(p => p.stock_qty === 0)

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

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Carregando dashboard...</div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            {variacaoMes && (
              <span className={`text-xs font-bold flex items-center gap-0.5 ${Number(variacaoMes) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Number(variacaoMes) >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(Number(variacaoMes))}%
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-gray-800">R$ {faturamentoMes.toFixed(2).replace('.', ',')}</div>
          <div className="text-xs text-gray-500 mt-0.5">Faturamento do mês</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-800">R$ {faturamentoHoje.toFixed(2).replace('.', ',')}</div>
          <div className="text-xs text-gray-500 mt-0.5">Faturamento hoje</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-800">{pedidosMes.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Pedidos este mês</div>
          <div className="text-xs text-gray-400">Ticket médio: R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
            <Package size={18} className="text-orange-600" />
          </div>
          <div className="text-2xl font-black text-gray-800">{produtos.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Produtos ativos</div>
          {semEstoque.length > 0 && (
            <div className="text-xs text-red-500 font-bold mt-0.5">{semEstoque.length} sem estoque</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Últimos pedidos */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4">Últimos Pedidos</h2>
          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400 text-sm">Nenhum pedido ainda.</p>
              <p className="text-gray-300 text-xs mt-1">Os pedidos aparecerão aqui após a integração com Mercado Pago.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {pedidos.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{p.order_number || p.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusCores[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[p.status] || p.status}
                  </span>
                  <span className="font-black text-green-700 text-sm">R$ {Number(p.total || 0).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de estoque */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            Estoque Crítico
          </h2>
          {estoqueCritico.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-green-500 font-bold text-sm">✅ Tudo OK</p>
              <p className="text-gray-400 text-xs mt-1">Nenhum produto com estoque crítico.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {estoqueCritico.slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-[160px]">{p.name}</p>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${p.stock_qty === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {p.stock_qty === 0 ? 'SEM ESTOQUE' : `${p.stock_qty} un`}
                  </span>
                </div>
              ))}
              {estoqueCritico.length > 8 && (
                <p className="text-xs text-gray-400 text-center pt-1">+ {estoqueCritico.length - 8} produtos</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resumo por status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-black text-gray-800 mb-4">Pedidos por Status — Este Mês</h2>
        {pedidosMes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Sem pedidos este mês ainda.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(
              pedidosMes.reduce((acc: Record<string,number>, p: Record<string,unknown>) => {
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
