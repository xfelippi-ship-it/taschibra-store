/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { registrarAuditoria } from '@/lib/auditLog'
import {
  ChevronDown, ChevronRight, Package, XCircle,
  CreditCard, RefreshCw, AlertTriangle, Filter, X
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Aguardando Pagamento', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed:  { label: 'Confirmado',           bg: 'bg-blue-100',   text: 'text-blue-700'   },
  processing: { label: 'Em Separação',         bg: 'bg-purple-100', text: 'text-purple-700' },
  shipped:    { label: 'Enviado',              bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered:  { label: 'Entregue',             bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled:  { label: 'Cancelado',            bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:   { label: 'Estornado',            bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

const PAYMENT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Aguardando', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  paid:      { label: 'Pago',       bg: 'bg-green-100',  text: 'text-green-700'  },
  failed:    { label: 'Falhou',     bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:  { label: 'Estornado',  bg: 'bg-gray-100',   text: 'text-gray-500'   },
  captured:  { label: 'Capturado',  bg: 'bg-green-100',  text: 'text-green-700'  },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card:  'Cartão de Débito',
  pix:         'PIX',
  boleto:      'Boleto',
  free:        'Gratuito',
}

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

function Badge({ cfg }: { cfg: { label: string; bg: string; text: string } }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function ERPBadge({ integrado, sapiensId }: { integrado?: boolean; sapiensId?: string }) {
  if (integrado || sapiensId) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Integrado
      </span>
    )
  }
  return <span className="text-xs text-gray-300 font-bold">—</span>
}

export default function PedidosTab({ meuEmail = 'admin' }: { meuEmail?: string }) {
  const [pedidos, setPedidos]           = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [expandido, setExpandido]       = useState<string | null>(null)
  const [acao, setAcao]                 = useState<Record<string, boolean>>({})
  const [trackingEdit, setTrackingEdit] = useState<Record<string, string>>({})
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [busca,          setBusca]          = useState('')
  const [filtroStatus,   setFiltroStatus]   = useState('todos')
  const [filtroPgto,     setFiltroPgto]     = useState('todos')
  const [filtroMetodo,   setFiltroMetodo]   = useState('todos')
  const [filtroCupom,    setFiltroCupom]    = useState('')
  const [filtroCPF,      setFiltroCPF]      = useState('')
  const [filtroDataDe,   setFiltroDataDe]   = useState('')
  const [filtroDataAte,  setFiltroDataAte]  = useState('')
  const [filtroERP,      setFiltroERP]      = useState('todos')

  const filtrosAtivos =
    filtroStatus !== 'todos' || filtroPgto !== 'todos' || filtroMetodo !== 'todos' ||
    filtroCupom !== '' || filtroCPF !== '' || filtroDataDe !== '' ||
    filtroDataAte !== '' || filtroERP !== 'todos'

  function limparFiltros() {
    setFiltroStatus('todos'); setFiltroPgto('todos'); setFiltroMetodo('todos')
    setFiltroCupom(''); setFiltroCPF(''); setFiltroDataDe('')
    setFiltroDataAte(''); setFiltroERP('todos'); setBusca('')
  }

  async function carregar() {
    setLoading(true)
    let q = supabase
      .from('orders')
      .select('*, customers(name, email, phone, cpf)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (filtroStatus !== 'todos')  q = q.eq('status', filtroStatus)
    if (filtroPgto  !== 'todos')   q = q.eq('payment_status', filtroPgto)
    if (filtroMetodo !== 'todos')  q = q.eq('payment_method', filtroMetodo)
    const { data } = await q
    setPedidos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [filtroStatus, filtroPgto, filtroMetodo])

  // ── Filtros client-side (busca, cupom, cpf, data, erp) ───────────────────
  const pedidosFiltrados = pedidos.filter(p => {
    if (busca) {
      const b = busca.toLowerCase()
      if (
        !p.order_number?.toLowerCase().includes(b) &&
        !p.customers?.name?.toLowerCase().includes(b) &&
        !p.customers?.email?.toLowerCase().includes(b) &&
        !p.customers?.cpf?.includes(b)
      ) return false
    }
    if (filtroCupom && !p.coupon_code?.toLowerCase().includes(filtroCupom.toLowerCase())) return false
    if (filtroCPF   && !p.customers?.cpf?.includes(filtroCPF)) return false
    if (filtroDataDe) {
      const de = new Date(filtroDataDe); de.setHours(0,0,0,0)
      if (new Date(p.created_at) < de) return false
    }
    if (filtroDataAte) {
      const ate = new Date(filtroDataAte); ate.setHours(23,59,59,999)
      if (new Date(p.created_at) > ate) return false
    }
    if (filtroERP === 'integrado'     && !p.sapiens_order_id && !p.erp_integrated) return false
    if (filtroERP === 'nao_integrado' && (p.sapiens_order_id || p.erp_integrated))  return false
    return true
  })

  const totalFiltrado = pedidosFiltrados.reduce((s, p) => s + (Number(p.total) || 0), 0)

  // ── Ações ────────────────────────────────────────────────────────────────
  async function atualizarStatus(pedido: any, novoStatus: string) {
    setAcao(a => ({ ...a, [pedido.id + '_status']: true }))
    await supabase.from('orders').update({ status: novoStatus, updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'pedido_status_alterado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number} | ${pedido.status} → ${novoStatus}` })
    setAcao(a => ({ ...a, [pedido.id + '_status']: false }))
    carregar()
  }

  async function capturarPagamento(pedido: any) {
    setAcao(a => ({ ...a, [pedido.id + '_capturar']: true }))
    await supabase.from('orders').update({ payment_status: 'captured', updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'pagamento_capturado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number}` })
    setAcao(a => ({ ...a, [pedido.id + '_capturar']: false }))
    carregar()
  }

  async function estornarPedido(pedido: any) {
    if (!confirm(`Confirma o estorno do pedido ${pedido.order_number}? Esta ação não pode ser desfeita.`)) return
    setAcao(a => ({ ...a, [pedido.id + '_estorno']: true }))
    await supabase.from('orders').update({ status: 'refunded', payment_status: 'refunded', updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'pedido_estornado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number}` })
    setAcao(a => ({ ...a, [pedido.id + '_estorno']: false }))
    carregar()
  }

  async function enviarClearSales(pedido: any) {
    setAcao(a => ({ ...a, [pedido.id + '_clearsale']: true }))
    await registrarAuditoria({ executedBy: meuEmail, acao: 'enviado_clearsales', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number}` })
    alert(`Pedido ${pedido.order_number} enviado para análise ClearSales.`)
    setAcao(a => ({ ...a, [pedido.id + '_clearsale']: false }))
  }

  async function salvarTracking(pedido: any) {
    const codigo = trackingEdit[pedido.id] ?? pedido.tracking_code ?? ''
    await supabase.from('orders').update({ tracking_code: codigo, updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'tracking_atualizado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number} | Código: ${codigo}` })
    carregar()
  }

  const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white"
  const inputCls  = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"

  return (
    <div>
      {/* ── Cabeçalho ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Pedidos</h1>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
              {filtrosAtivos || busca ? ` encontrado${pedidosFiltrados.length !== 1 ? 's' : ''}` : ' no total'}
              {pedidosFiltrados.length > 0 && (
                <span className="ml-2 text-green-700 font-bold">
                  · R$ {totalFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg border transition-colors ${
              filtrosAtivos
                ? 'bg-green-600 text-white border-green-600'
                : 'text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600'
            }`}>
            <Filter size={14} />
            Filtros
            {filtrosAtivos && (
              <span className="bg-white text-green-700 text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            onClick={carregar}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-green-300 transition-colors">
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {/* ── Barra de busca rápida ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-3">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por número do pedido, nome, e-mail ou CPF..."
          className={`flex-1 ${inputCls}`}
        />
        {(busca || filtrosAtivos) && (
          <button
            onClick={limparFiltros}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-3 rounded-lg hover:bg-red-50 transition-colors">
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {/* ── Painel de filtros avançados ───────────────────────────────────── */}
      {filtrosAbertos && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Status do pedido */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Status do Pedido</label>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Status do pagamento */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Status do Pagamento</label>
            <select value={filtroPgto} onChange={e => setFiltroPgto(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Forma de pagamento */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Forma de Pagamento</label>
            <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todas</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* ERP */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">ERP / Sapiens</label>
            <select value={filtroERP} onChange={e => setFiltroERP(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              <option value="integrado">Integrado</option>
              <option value="nao_integrado">Não integrado</option>
            </select>
          </div>

          {/* Cupom */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Cupom de Desconto</label>
            <input
              value={filtroCupom}
              onChange={e => setFiltroCupom(e.target.value)}
              placeholder="Ex: PASCOA20"
              className={`w-full ${inputCls} font-mono uppercase`}
            />
          </div>

          {/* CPF */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">CPF / CNPJ</label>
            <input
              value={filtroCPF}
              onChange={e => setFiltroCPF(e.target.value)}
              placeholder="Ex: 000.000.000-00"
              className={`w-full ${inputCls}`}
            />
          </div>

          {/* Data de */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Pedidos a partir de</label>
            <input
              type="date"
              value={filtroDataDe}
              onChange={e => setFiltroDataDe(e.target.value)}
              className={`w-full ${inputCls}`}
            />
          </div>

          {/* Data até */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Pedidos até</label>
            <input
              type="date"
              value={filtroDataAte}
              onChange={e => setFiltroDataAte(e.target.value)}
              className={`w-full ${inputCls}`}
            />
          </div>
        </div>
      )}

      {/* ── Tabela ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhum pedido encontrado.</p>
            {(filtrosAtivos || busca) && (
              <button onClick={limparFiltros} className="mt-2 text-xs text-green-600 hover:underline font-bold">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Pedido</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Data</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Pagamento</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Pgto</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">ERP</th>
                <th className="text-right px-4 py-3 text-xs font-black text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <>
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandido(expandido === p.id ? null : p.id)}>
                    <td className="px-3 py-4 text-gray-400">
                      {expandido === p.id
                        ? <ChevronDown size={16} />
                        : <ChevronRight size={16} />}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-black text-sm text-gray-800">{p.order_number}</p>
                      {p.coupon_code && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          🏷️ {p.coupon_code}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-sm text-gray-800">{p.customers?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{p.customers?.email || ''}</p>
                      {p.customers?.cpf && (
                        <p className="text-xs text-gray-300 font-mono">{p.customers.cpf}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      <p className="text-xs text-gray-300">
                        {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method || '—'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge cfg={STATUS_LABELS[p.status] || { label: p.status, bg: 'bg-gray-100', text: 'text-gray-600' }} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge cfg={PAYMENT_LABELS[p.payment_status] || { label: p.payment_status || '—', bg: 'bg-gray-100', text: 'text-gray-500' }} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ERPBadge integrado={p.erp_integrated} sapiensId={p.sapiens_order_id} />
                    </td>
                    <td className="px-4 py-4 text-right font-black text-green-700 whitespace-nowrap">
                      R$ {Number(p.total).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>

                  {/* ── Detalhe expandido ─────────────────────────────────── */}
                  {expandido === p.id && (
                    <tr key={p.id + '_detail'} className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={9} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                          {/* Endereço */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Endereço de Entrega</p>
                            {p.shipping_address ? (
                              <div className="text-sm text-gray-700 space-y-0.5">
                                <p className="font-bold">{p.shipping_address.logradouro}, {p.shipping_address.numero}</p>
                                {p.shipping_address.complemento && <p>{p.shipping_address.complemento}</p>}
                                <p>{p.shipping_address.bairro}</p>
                                <p>{p.shipping_address.localidade} — {p.shipping_address.uf}</p>
                                <p className="font-mono text-gray-500">{p.shipping_address.cep}</p>
                              </div>
                            ) : <p className="text-sm text-gray-400">Não informado</p>}
                            {p.shipping_method && (
                              <p className="mt-2 text-xs text-gray-500">
                                Frete: <span className="font-bold text-gray-700">{p.shipping_method}</span>
                              </p>
                            )}
                            {p.coupon_code && (
                              <p className="text-xs text-gray-500 mt-1">
                                Cupom: <span className="font-bold text-green-700">{p.coupon_code}</span>
                              </p>
                            )}
                            {p.sapiens_order_id && (
                              <p className="text-xs text-gray-500 mt-1">
                                Sapiens ID: <span className="font-mono font-bold text-gray-700">{p.sapiens_order_id}</span>
                              </p>
                            )}
                          </div>

                          {/* Valores */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Valores</p>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-bold">R$ {Number(p.subtotal || 0).toFixed(2).replace('.', ',')}</span>
                              </div>
                              {p.discount_total > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Desconto</span>
                                  <span className="font-bold text-red-600">-R$ {Number(p.discount_total).toFixed(2).replace('.', ',')}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-500">Frete</span>
                                <span className="font-bold">R$ {Number(p.shipping_total || 0).toFixed(2).replace('.', ',')}</span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                <span className="font-black text-gray-800">Total</span>
                                <span className="font-black text-green-700">R$ {Number(p.total).toFixed(2).replace('.', ',')}</span>
                              </div>
                            </div>
                            {/* Tracking */}
                            <div className="mt-3">
                              <p className="text-xs font-black text-gray-500 uppercase mb-1">Código de Rastreio</p>
                              <div className="flex gap-2">
                                <input
                                  value={trackingEdit[p.id] ?? p.tracking_code ?? ''}
                                  onChange={e => setTrackingEdit(t => ({ ...t, [p.id]: e.target.value }))}
                                  placeholder="Ex: BR123456789BR"
                                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs font-mono outline-none focus:border-green-500"
                                />
                                <button
                                  onClick={() => salvarTracking(p)}
                                  className="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Ações</p>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Alterar status:</p>
                                <div className="flex flex-wrap gap-1">
                                  {STATUS_FLOW.filter(s => s !== p.status).map(s => (
                                    <button
                                      key={s}
                                      disabled={acao[p.id + '_status']}
                                      onClick={e => { e.stopPropagation(); atualizarStatus(p, s) }}
                                      className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${STATUS_LABELS[s].bg} ${STATUS_LABELS[s].text} border-current hover:opacity-80 disabled:opacity-50`}>
                                      → {STATUS_LABELS[s].label}
                                    </button>
                                  ))}
                                  <button
                                    disabled={acao[p.id + '_status']}
                                    onClick={e => { e.stopPropagation(); atualizarStatus(p, 'cancelled') }}
                                    className="text-xs font-bold px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">
                                    Cancelar
                                  </button>
                                </div>
                              </div>

                              {p.payment_status === 'paid' && (
                                <button
                                  disabled={acao[p.id + '_capturar']}
                                  onClick={e => { e.stopPropagation(); capturarPagamento(p) }}
                                  className="w-full flex items-center gap-2 text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                  <CreditCard size={13} />
                                  {acao[p.id + '_capturar'] ? 'Capturando...' : 'Capturar Pagamento'}
                                </button>
                              )}

                              {(p.status === 'confirmed' || p.status === 'pending') && (
                                <button
                                  disabled={acao[p.id + '_clearsale']}
                                  onClick={e => { e.stopPropagation(); enviarClearSales(p) }}
                                  className="w-full flex items-center gap-2 text-xs font-bold bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                                  <AlertTriangle size={13} />
                                  {acao[p.id + '_clearsale'] ? 'Enviando...' : 'Enviar p/ ClearSales'}
                                </button>
                              )}

                              {['confirmed', 'processing', 'paid'].includes(p.status) && (
                                <button
                                  disabled={acao[p.id + '_estorno']}
                                  onClick={e => { e.stopPropagation(); estornarPedido(p) }}
                                  className="w-full flex items-center gap-2 text-xs font-bold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                  <XCircle size={13} />
                                  {acao[p.id + '_estorno'] ? 'Estornando...' : 'Estornar Pedido'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>

            {/* Rodapé com total */}
            {pedidosFiltrados.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                    {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-green-700 text-sm">
                    R$ {totalFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}
