'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Search, Filter, RefreshCw, ChevronDown, ChevronUp,
  CreditCard, RotateCcw, ShieldCheck, Bell, MessageSquare,
  Truck, CheckCircle, Clock, XCircle, Package, Send,
  Loader2, AlertTriangle, Plus, Trash2,
} from 'lucide-react'



// ── Tipos ────────────────────────────────────────────────────────────────────
type Pedido = {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  payment_id: string | null
  total: number
  customer_name: string
  customer_email: string
  customer_cpf: string
  customer_phone: string
  tracking_code: string | null
  seller_code: string | null
  coupon_code: string | null
  clearsales_score: number | null
  clearsales_status: string | null
  erp_integrated: boolean
  sapiens_order_id: string | null
  created_at: string
  order_items?: OrderItem[]
}

type OrderItem = {
  id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
}

type Note = {
  id: string
  note: string
  created_by: string
  created_at: string
}

// ── Labels e cores ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  pending:           { label: 'Aguardando Pagamento', bg: 'bg-yellow-50',  text: 'text-yellow-700', icon: Clock },
  awaiting_payment:  { label: 'Aguardando Pagamento', bg: 'bg-yellow-50',  text: 'text-yellow-700', icon: Clock },
  confirmed:         { label: 'Confirmado',           bg: 'bg-blue-50',    text: 'text-blue-700',   icon: CheckCircle },
  awaiting_shipment: { label: 'Ag. Expedição',        bg: 'bg-indigo-50',  text: 'text-indigo-700', icon: Package },
  shipped:           { label: 'Enviado',              bg: 'bg-purple-50',  text: 'text-purple-700', icon: Truck },
  delivered:         { label: 'Entregue',             bg: 'bg-green-50',   text: 'text-green-700',  icon: CheckCircle },
  cancelled:         { label: 'Cancelado',            bg: 'bg-red-50',     text: 'text-red-700',    icon: XCircle },
  refunded:          { label: 'Estornado',            bg: 'bg-gray-100',   text: 'text-gray-600',   icon: RotateCcw },
}

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendente',  color: 'text-yellow-600' },
  paid:      { label: 'Pago',      color: 'text-green-600' },
  captured:  { label: 'Capturado', color: 'text-blue-600' },
  refunded:  { label: 'Estornado', color: 'text-gray-500' },
  failed:    { label: 'Falhou',    color: 'text-red-600' },
}

const PAYMENT_METHOD: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card:  'Cartão de Débito',
  boleto:      'Boleto',
  pix:         'PIX',
}

const FLUXO_STATUS = [
  'pending', 'confirmed', 'awaiting_shipment', 'shipped', 'delivered',
]

const CS_STATUS: Record<string, { label: string; color: string }> = {
  APA: { label: 'Aprovado Auto',   color: 'text-green-600' },
  APM: { label: 'Aprovado Manual', color: 'text-blue-600' },
  RPM: { label: 'Rep. Manual',     color: 'text-orange-600' },
  REP: { label: 'Reprovado',       color: 'text-red-600' },
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PedidosPage() {
  const [pedidos, setPedidos]           = useState<Pedido[]>([])
  const [loading, setLoading]           = useState(true)
  const [busca, setBusca]               = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPagamento, setFiltroPgmt]= useState('')
  const [filtroERP, setFiltroERP]       = useState('')
  const [dataInicio, setDataInicio]     = useState('')
  const [dataFim, setDataFim]           = useState('')
  const [expandido, setExpandido]       = useState<string | null>(null)
  const [acao, setAcao]                 = useState<Record<string, boolean>>({})
  const [trackingEdit, setTrackingEdit] = useState<Record<string, string>>({})
  const [motivoEstorno, setMotivoEstorno]= useState<Record<string, string>>({})
  const [notes, setNotes]               = useState<Record<string, Note[]>>({})
  const [novaNota, setNovaNota]         = useState<Record<string, string>>({})
  const [meuEmail, setMeuEmail]         = useState('admin')
  const [toast, setToast]               = useState<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

  // ── Toast helper ─────────────────────────────────────────────────────────
  function showToast(msg: string, tipo: 'ok' | 'erro' = 'ok') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Carrega pedidos ───────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(200)
    setPedidos((data as any as Pedido[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setMeuEmail(data.user.email)
    })
  }, [carregar])

  // ── Filtragem ─────────────────────────────────────────────────────────────
  const filtrados = pedidos.filter(p => {
    if (busca) {
      const b = busca.toLowerCase()
      if (
        !p.order_number?.toLowerCase().includes(b) &&
        !p.customer_name?.toLowerCase().includes(b) &&
        !p.customer_email?.toLowerCase().includes(b) &&
        !p.customer_cpf?.includes(b)
      ) return false
    }
    if (filtroStatus   && p.status         !== filtroStatus)   return false
    if (filtroPagamento && p.payment_status !== filtroPagamento) return false
    if (filtroERP === 'integrado'    && !p.erp_integrated)  return false
    if (filtroERP === 'nao_integrado' && p.erp_integrated)  return false
    if (dataInicio && p.created_at < dataInicio) return false
    if (dataFim    && p.created_at.slice(0, 10) > dataFim) return false
    return true
  })

  const totalFiltrado = filtrados.reduce((s, p) => s + (Number(p.total) || 0), 0)

  // ── API helper ────────────────────────────────────────────────────────────
  async function apiPost(pedidoId: string, rota: string, body?: object) {
    const res = await fetch(`/api/admin/pedidos/${pedidoId}/${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executedBy: meuEmail, ...body }),
    })
    return res.json()
  }

  async function apiPatch(pedidoId: string, rota: string, body: object) {
    const res = await fetch(`/api/admin/pedidos/${pedidoId}/${rota}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executedBy: meuEmail, ...body }),
    })
    return res.json()
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function atualizarStatus(pedido: Pedido, novoStatus: string) {
    if (!confirm(`Alterar status para "${STATUS_CONFIG[novoStatus]?.label}"?`)) return
    const key = pedido.id + '_status'
    setAcao(a => ({ ...a, [key]: true }))
    const res = await apiPatch(pedido.id, 'status', { status: novoStatus })
    setAcao(a => ({ ...a, [key]: false }))
    if (res.ok) {
      showToast(`Status alterado para ${STATUS_CONFIG[novoStatus]?.label}`)
      carregar()
    } else {
      showToast(res.error || 'Erro ao alterar status', 'erro')
    }
  }

  async function capturarPagamento(pedido: Pedido) {
    if (!confirm(`Capturar pagamento do pedido ${pedido.order_number}?`)) return
    const key = pedido.id + '_capturar'
    setAcao(a => ({ ...a, [key]: true }))
    const res = await apiPost(pedido.id, 'capturar')
    setAcao(a => ({ ...a, [key]: false }))
    if (res.ok) {
      showToast('Pagamento capturado com sucesso!')
      carregar()
    } else {
      showToast(res.error || 'Erro ao capturar pagamento', 'erro')
    }
  }

  async function estornarPedido(pedido: Pedido) {
    const motivo = motivoEstorno[pedido.id]?.trim()
    if (!motivo) {
      showToast('Informe o motivo do estorno', 'erro')
      return
    }
    if (!confirm(`Estornar pedido ${pedido.order_number}? Esta ação não pode ser desfeita.`)) return
    const key = pedido.id + '_estorno'
    setAcao(a => ({ ...a, [key]: true }))
    const res = await apiPost(pedido.id, 'estornar', { motivo })
    setAcao(a => ({ ...a, [key]: false }))
    if (res.ok) {
      showToast('Estorno realizado com sucesso!')
      setMotivoEstorno(m => ({ ...m, [pedido.id]: '' }))
      carregar()
    } else {
      showToast(res.error || 'Erro ao estornar', 'erro')
    }
  }

  async function enviarClearSales(pedido: Pedido) {
    const key = pedido.id + '_clearsale'
    setAcao(a => ({ ...a, [key]: true }))
    const res = await apiPost(pedido.id, 'clearsales')
    setAcao(a => ({ ...a, [key]: false }))
    if (res.ok) {
      const label = CS_STATUS[res.status]?.label || res.status
      showToast(`ClearSales: ${label} (score ${res.score ?? 'n/d'})`)
      carregar()
    } else {
      showToast(res.error || 'Erro no ClearSales', 'erro')
    }
  }

  async function notificarCliente(pedido: Pedido, status: string) {
    const key = pedido.id + '_notif'
    setAcao(a => ({ ...a, [key]: true }))
    const res = await apiPost(pedido.id, 'notificar', { status })
    setAcao(a => ({ ...a, [key]: false }))
    if (res.ok) {
      showToast(`E-mail enviado para ${res.email}`)
    } else {
      showToast(res.error || 'Erro ao notificar', 'erro')
    }
  }

  async function salvarTracking(pedido: Pedido) {
    const codigo = trackingEdit[pedido.id] ?? ''
    if (!codigo.trim()) return
    const key = pedido.id + '_tracking'
    setAcao(a => ({ ...a, [key]: true }))
    await supabase.from('orders').update({
      tracking_code: codigo.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', pedido.id)
    setAcao(a => ({ ...a, [key]: false }))
    showToast('Código de rastreio salvo!')
    carregar()
  }

  // ── Anotações ─────────────────────────────────────────────────────────────
  async function carregarNotas(pedidoId: string) {
    const res = await fetch(`/api/admin/pedidos/${pedidoId}/anotacao`)
    const data = await res.json()
    setNotes(n => ({ ...n, [pedidoId]: data.notes || [] }))
  }

  async function salvarNota(pedidoId: string) {
    const nota = novaNota[pedidoId]?.trim()
    if (!nota) return
    const key = pedidoId + '_nota'
    setAcao(a => ({ ...a, [key]: true }))
    const res = await fetch(`/api/admin/pedidos/${pedidoId}/anotacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: nota, createdBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [key]: false }))
    if (data.ok) {
      setNovaNota(n => ({ ...n, [pedidoId]: '' }))
      carregarNotas(pedidoId)
    }
  }

  async function deletarNota(pedidoId: string, noteId: string) {
    await fetch(`/api/admin/pedidos/${pedidoId}/anotacao`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId }),
    })
    carregarNotas(pedidoId)
  }

  // ── Toggle expandir ───────────────────────────────────────────────────────
  function toggleExpandir(id: string) {
    if (expandido === id) {
      setExpandido(null)
    } else {
      setExpandido(id)
      carregarNotas(id)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.tipo === 'ok'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtrados.length} pedido{filtrados.length !== 1 ? 's' : ''} — Total: R$ {totalFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          onClick={carregar}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pedido, nome, e-mail, CPF..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filtroPagamento}
          onChange={e => setFiltroPgmt(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Status pagamento</option>
          {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filtroERP}
          onChange={e => setFiltroERP(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ERP</option>
          <option value="integrado">Integrado</option>
          <option value="nao_integrado">Não integrado</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Nenhum pedido encontrado</div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(p => {
            const sc     = STATUS_CONFIG[p.status] || STATUS_CONFIG['pending']
            const IconSC = sc.icon
            const aberto = expandido === p.id

            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                {/* Linha resumo */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpandir(p.id)}
                >
                  <div className="w-32 shrink-0">
                    <span className="font-mono text-sm font-semibold text-gray-800">
                      #{p.order_number}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.customer_name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.customer_email}</p>
                  </div>

                  <div className="hidden md:block w-36 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <IconSC size={11} />
                      {sc.label}
                    </span>
                  </div>

                  <div className="hidden lg:block w-28 shrink-0">
                    <span className={`text-xs font-medium ${PAYMENT_STATUS[p.payment_status]?.color || 'text-gray-500'}`}>
                      {PAYMENT_STATUS[p.payment_status]?.label || p.payment_status}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {PAYMENT_METHOD[p.payment_method] || p.payment_method}
                    </p>
                  </div>

                  <div className="hidden lg:block w-24 text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      R$ {Number(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {p.erp_integrated && (
                      <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">ERP ✓</span>
                    )}
                  </div>

                  <div className="ml-2 text-gray-400">
                    {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Painel expandido */}
                {aberto && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Col 1: Dados do pedido */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dados do pedido</h3>
                        <dl className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Cliente</dt>
                            <dd className="font-medium text-gray-800">{p.customer_name}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">E-mail</dt>
                            <dd className="text-gray-700">{p.customer_email}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">CPF</dt>
                            <dd className="text-gray-700">{p.customer_cpf || '—'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Telefone</dt>
                            <dd className="text-gray-700">{p.customer_phone || '—'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Cupom</dt>
                            <dd className="text-gray-700">{p.coupon_code || '—'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Vendedor</dt>
                            <dd className="text-gray-700">{p.seller_code || '—'}</dd>
                          </div>
                          {p.clearsales_status && (
                            <div className="flex justify-between">
                              <dt className="text-gray-500">ClearSales</dt>
                              <dd className={`font-medium ${CS_STATUS[p.clearsales_status]?.color || 'text-gray-600'}`}>
                                {CS_STATUS[p.clearsales_status]?.label || p.clearsales_status}
                                {p.clearsales_score ? ` (${p.clearsales_score})` : ''}
                              </dd>
                            </div>
                          )}
                        </dl>

                        {/* Itens do pedido */}
                        {p.order_items && p.order_items.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Itens</h4>
                            <div className="space-y-1">
                              {p.order_items.map(item => (
                                <div key={item.id} className="flex justify-between text-xs text-gray-700">
                                  <span className="truncate max-w-[180px]">{item.product_name}</span>
                                  <span className="shrink-0 ml-2 text-gray-500">
                                    {item.quantity}x R$ {Number(item.unit_price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Col 2: Ações do pedido */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ações</h3>

                        {/* Alterar status */}
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1.5">Alterar status:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {FLUXO_STATUS.filter(s => s !== p.status).map(s => {
                              const sc2 = STATUS_CONFIG[s]
                              const Ico = sc2.icon
                              return (
                                <button
                                  key={s}
                                  disabled={!!acao[p.id + '_status']}
                                  onClick={() => atualizarStatus(p, s)}
                                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${sc2.bg} ${sc2.text} border-current/20 hover:opacity-80 disabled:opacity-50`}
                                >
                                  {acao[p.id + '_status'] ? <Loader2 size={11} className="animate-spin" /> : <Ico size={11} />}
                                  {sc2.label}
                                </button>
                              )
                            })}
                            {p.status !== 'cancelled' && p.status !== 'refunded' && (
                              <button
                                disabled={!!acao[p.id + '_status']}
                                onClick={() => atualizarStatus(p, 'cancelled')}
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle size={11} />
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Capturar pagamento */}
                        {p.payment_method === 'credit_card' && p.payment_status === 'paid' && (
                          <button
                            disabled={!!acao[p.id + '_capturar']}
                            onClick={() => capturarPagamento(p)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-2"
                          >
                            {acao[p.id + '_capturar'] ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                            Capturar Pagamento
                          </button>
                        )}

                        {/* ClearSales */}
                        {['pending', 'confirmed', 'awaiting_payment'].includes(p.status) && !p.clearsales_status && (
                          <button
                            disabled={!!acao[p.id + '_clearsale']}
                            onClick={() => enviarClearSales(p)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 mb-2"
                          >
                            {acao[p.id + '_clearsale'] ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                            Enviar para ClearSales
                          </button>
                        )}

                        {/* Estorno */}
                        {!['cancelled', 'refunded'].includes(p.status) && p.payment_status !== 'refunded' && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Estorno:</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Motivo do estorno..."
                                value={motivoEstorno[p.id] || ''}
                                onChange={e => setMotivoEstorno(m => ({ ...m, [p.id]: e.target.value }))}
                                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                              />
                              <button
                                disabled={!!acao[p.id + '_estorno']}
                                onClick={() => estornarPedido(p)}
                                className="shrink-0 flex items-center gap-1 text-xs font-medium bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                              >
                                {acao[p.id + '_estorno'] ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                                Estornar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Notificar cliente */}
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-1.5">Notificar cliente:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(['confirmed', 'awaiting_shipment', 'shipped', 'delivered'] as string[]).map(s => (
                              <button
                                key={s}
                                disabled={!!acao[p.id + '_notif']}
                                onClick={() => notificarCliente(p, s)}
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                {acao[p.id + '_notif'] ? <Loader2 size={11} className="animate-spin" /> : <Bell size={11} />}
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Col 3: Rastreio + Anotações */}
                      <div>
                        {/* Rastreamento */}
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rastreamento</h3>
                        <div className="flex gap-2 mb-6">
                          <input
                            type="text"
                            placeholder={p.tracking_code || 'Código de rastreio...'}
                            value={trackingEdit[p.id] ?? p.tracking_code ?? ''}
                            onChange={e => setTrackingEdit(t => ({ ...t, [p.id]: e.target.value }))}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <button
                            disabled={!!acao[p.id + '_tracking']}
                            onClick={() => salvarTracking(p)}
                            className="shrink-0 flex items-center gap-1 text-xs font-medium bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                          >
                            {acao[p.id + '_tracking'] ? <Loader2 size={12} className="animate-spin" /> : <Truck size={12} />}
                            Salvar
                          </button>
                        </div>

                        {/* Anotações internas */}
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Anotações internas</h3>

                        {/* Lista notas */}
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                          {(notes[p.id] || []).map(n => (
                            <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs relative group">
                              <p className="text-gray-800 leading-relaxed">{n.note}</p>
                              <p className="text-gray-400 mt-1">{n.created_by} · {new Date(n.created_at).toLocaleString('pt-BR')}</p>
                              <button
                                onClick={() => deletarNota(p.id, n.id)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {(notes[p.id] || []).length === 0 && (
                            <p className="text-xs text-gray-400 italic">Nenhuma anotação ainda.</p>
                          )}
                        </div>

                        {/* Nova nota */}
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            placeholder="Nova anotação interna..."
                            value={novaNota[p.id] || ''}
                            onChange={e => setNovaNota(n => ({ ...n, [p.id]: e.target.value }))}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          />
                          <button
                            disabled={!!acao[p.id + '_nota']}
                            onClick={() => salvarNota(p.id)}
                            className="shrink-0 self-end flex items-center gap-1 text-xs font-medium bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {acao[p.id + '_nota'] ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
