/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { registrarAuditoria } from '@/lib/auditLog'
import {
  ChevronDown, ChevronRight, Package, XCircle,
  CreditCard, RefreshCw, AlertTriangle, Filter, X,
  Bell, Plus, Trash2, Loader2, Download,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending:           { label: 'Aguardando Pagamento', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  awaiting_shipment: { label: 'Aguardando Expedição', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  processing:        { label: 'Em Separação',         bg: 'bg-purple-100', text: 'text-purple-700' },
  shipped:           { label: 'Aguardando Entrega',   bg: 'bg-indigo-100', text: 'text-indigo-700' },
  awaiting_pickup:   { label: 'Aguardando Retirada',  bg: 'bg-teal-100',   text: 'text-teal-700'   },
  delivered:         { label: 'Finalizado',           bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled:         { label: 'Cancelado',            bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:          { label: 'Estornado',            bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

const PAYMENT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Aguardando', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  waiting:    { label: 'Aguardando', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  processing: { label: 'Processando', bg: 'bg-blue-100', text: 'text-blue-700'   },
  authorized: { label: 'Autorizado', bg: 'bg-blue-100',  text: 'text-blue-700'   },
  paid:       { label: 'Pago',       bg: 'bg-green-100', text: 'text-green-700'  },
  captured:   { label: 'Capturado',  bg: 'bg-green-100', text: 'text-green-700'  },
  failed:     { label: 'Falhou',     bg: 'bg-red-100',   text: 'text-red-700'    },
  refused:    { label: 'Recusado',   bg: 'bg-red-100',   text: 'text-red-700'    },
  refunded:   { label: 'Estornado',  bg: 'bg-gray-100',  text: 'text-gray-500'   },
  chargedback:{ label: 'Chargeback', bg: 'bg-red-100',   text: 'text-red-700'    },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card:  'Cartão de Débito',
  pix:         'PIX',
  boleto:      'Boleto',
  free:        'Gratuito',
}

const STATUS_FLOW = ['pending', 'awaiting_shipment', 'processing', 'shipped', 'awaiting_pickup', 'delivered']

// Máquina de estados: transições permitidas a partir de cada status
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:           ['awaiting_shipment', 'cancelled'],
  awaiting_shipment: ['processing', 'cancelled'],
  processing:        ['shipped', 'awaiting_pickup', 'cancelled'],
  shipped:           ['delivered'],
  awaiting_pickup:   ['delivered'],
  delivered:         [],            // final — só refunded via estorno
  cancelled:         [],            // final
  refunded:          [],            // final
}

const STATUS_FINAIS = ['delivered', 'cancelled', 'refunded']

const NOTIF_STATUS = ['awaiting_shipment', 'processing', 'shipped', 'awaiting_pickup', 'delivered']

type Note = { id: string; note: string; created_by: string; created_at: string }

type HistoryEvent = {
  id: string
  tipo: 'status' | 'nota'
  previous_status?: string | null
  new_status?: string
  note?: string
  changed_by?: string
  created_by?: string
  created_at: string
}

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
  const [motivoEstorno, setMotivoEstorno] = useState<Record<string, string>>({})
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [toast, setToast]               = useState<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

  // Anotações
  const [notes, setNotes]       = useState<Record<string, Note[]>>({})
  const [novaNota, setNovaNota] = useState<Record<string, string>>({})

  // Histórico unificado (status + notas) por pedido
  const [historico, setHistorico] = useState<Record<string, HistoryEvent[]>>({})

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

  function showToast(msg: string, tipo: 'ok' | 'erro' = 'ok') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  async function carregar() {
    setLoading(true)
    let q = supabase
      .from('orders')
      .select('*, customers(first_name, last_name, email, phone, cpf)')
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

  // ── Filtros client-side ───────────────────────────────────────────────────
  const pedidosFiltrados = pedidos.filter(p => {
    if (busca) {
      const b = busca.toLowerCase()
      if (
        !p.order_number?.toLowerCase().includes(b) &&
        !(p.customers?.first_name + ' ' + p.customers?.last_name)?.toLowerCase().includes(b) &&
        !p.customers?.email?.toLowerCase().includes(b) &&
        !p.customers?.cpf?.includes(b)
      ) return false
    }
    if (filtroCupom && !p.coupon_code?.toLowerCase().includes(filtroCupom.toLowerCase())) return false
    if (filtroCPF   && !p.customers?.cpf?.includes(filtroCPF)) return false
    if (filtroDataDe && p.created_at < filtroDataDe) return false
    if (filtroDataAte && p.created_at.slice(0, 10) > filtroDataAte) return false
    if (filtroERP === 'integrado'    && !p.erp_integrated && !p.sapiens_order_id) return false
    if (filtroERP === 'nao_integrado' && (p.erp_integrated || p.sapiens_order_id)) return false
    return true
  })

  const totalFiltrado = pedidosFiltrados.reduce((s: number, p: any) => s + (Number(p.total) || 0), 0)

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function atualizarStatus(pedido: any, novoStatus: string) {
    const permitidos = STATUS_TRANSITIONS[pedido.status] || []
    if (!permitidos.includes(novoStatus)) {
      showToast(`Transição inválida: ${STATUS_LABELS[pedido.status]?.label || pedido.status} → ${STATUS_LABELS[novoStatus]?.label || novoStatus}`, 'erro')
      return
    }
    if (!confirm(`Alterar status para "${STATUS_LABELS[novoStatus]?.label}"?`)) return
    setAcao(a => ({ ...a, [pedido.id + '_status']: true }))
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus, executedBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [pedido.id + '_status']: false }))
    if (data.ok) { showToast(`Status: ${STATUS_LABELS[novoStatus]?.label}`); carregar() }
    else showToast(data.error || 'Erro ao alterar status', 'erro')
  }

  async function capturarPagamento(pedido: any) {
    if (!confirm(`Capturar pagamento do pedido ${pedido.order_number}?`)) return
    setAcao(a => ({ ...a, [pedido.id + '_capturar']: true }))
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/capturar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executedBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [pedido.id + '_capturar']: false }))
    if (data.ok) { showToast('Pagamento capturado!'); carregar() }
    else showToast(data.error || 'Erro ao capturar', 'erro')
  }

  async function enviarClearSales(pedido: any) {
    setAcao(a => ({ ...a, [pedido.id + '_clearsale']: true }))
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/clearsales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executedBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [pedido.id + '_clearsale']: false }))
    if (data.ok) { showToast(`ClearSales: ${data.status} (score ${data.score ?? 'n/d'})`); carregar() }
    else showToast(data.error || 'Erro no ClearSales', 'erro')
  }

  async function estornarPedido(pedido: any) {
    const motivo = motivoEstorno[pedido.id]?.trim()
    if (!motivo) { showToast('Informe o motivo do estorno', 'erro'); return }
    if (!confirm(`Estornar pedido ${pedido.order_number}? Esta ação não pode ser desfeita.`)) return
    setAcao(a => ({ ...a, [pedido.id + '_estorno']: true }))
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/estornar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, executedBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [pedido.id + '_estorno']: false }))
    if (data.ok) {
      showToast('Estorno realizado!')
      setMotivoEstorno(m => ({ ...m, [pedido.id]: '' }))
      carregar()
    } else showToast(data.error || 'Erro ao estornar', 'erro')
  }

  async function notificarCliente(pedido: any, status: string) {
    setAcao(a => ({ ...a, [pedido.id + '_notif']: true }))
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/notificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, executedBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [pedido.id + '_notif']: false }))
    if (data.ok) showToast(`E-mail enviado para ${data.email}`)
    else showToast(data.error || 'Erro ao notificar', 'erro')
  }

  async function salvarTracking(pedido: any) {
    const codigo = trackingEdit[pedido.id] ?? ''
    if (!codigo.trim()) return
    await supabase.from('orders').update({
      tracking_code: codigo.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'tracking_salvo', entidade: 'orders', detalhe: `Pedido ${pedido.order_number}: ${codigo}` })
    showToast('Rastreio salvo!')
    carregar()
  }

  // ── Histórico unificado (status + notas) ─────────────────────────────────
  async function carregarHistorico(pedidoId: string) {
    // Busca status history
    const { data: statusData } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', pedidoId)
      .order('created_at', { ascending: false })

    // Busca notas (mesma fonte que carregarNotas, mas reuso aqui)
    const resNotas = await fetch(`/api/admin/pedidos/${pedidoId}/anotacao`)
    const dataNotas = await resNotas.json()
    const notas: Note[] = dataNotas.notes || []

    // Unifica e ordena por created_at DESC
    const eventos: HistoryEvent[] = [
      ...((statusData as any[] | null) || []).map((s: any) => ({
        id: `s_${s.id}`,
        tipo: 'status' as const,
        previous_status: s.previous_status,
        new_status: s.new_status,
        changed_by: s.changed_by,
        created_at: s.created_at,
      })),
      ...notas.map((n) => ({
        id: `n_${n.id}`,
        tipo: 'nota' as const,
        note: n.note,
        created_by: n.created_by,
        created_at: n.created_at,
      })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at))

    setHistorico((h) => ({ ...h, [pedidoId]: eventos }))
    setNotes((n) => ({ ...n, [pedidoId]: notas })) // mantém compat com UI antiga
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
    setAcao(a => ({ ...a, [pedidoId + '_nota']: true }))
    const res = await fetch(`/api/admin/pedidos/${pedidoId}/anotacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: nota, createdBy: meuEmail }),
    })
    const data = await res.json()
    setAcao(a => ({ ...a, [pedidoId + '_nota']: false }))
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

  function toggleExpandir(id: string) {
    if (expandido === id) {
      setExpandido(null)
    } else {
      setExpandido(id)
      carregarHistorico(id)
    }
  }

  // ── Estilos ───────────────────────────────────────────────────────────────
  const inputCls  = 'border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500'
  const selectCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white'

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-bold transition-all ${
          toast.tipo === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-800">Pedidos</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} —
            Total: R$ {totalFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltrosAbertos(f => !f)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${
              filtrosAtivos ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}>
            <Filter size={14} />
            Filtros {filtrosAtivos && '•'}
          </button>
          <a
            href={`/api/admin/pedidos/exportar${filtroStatus !== "todos" ? "?status=" + filtroStatus : ""}`}
            download
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">
            <Download size={14} />
            Exportar CSV
          </a>
          <button
            onClick={carregar}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* ── Busca ────────────────────────────────────────────────────────── */}
      <input
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Buscar por pedido, nome, e-mail ou CPF..."
        className={`w-full ${inputCls}`}
      />

      {/* ── Filtros avançados ─────────────────────────────────────────────── */}
      {filtrosAbertos && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Status</label>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Pagamento</label>
            <select value={filtroPgto} onChange={e => setFiltroPgto(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Método</label>
            <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">ERP / Sapiens</label>
            <select value={filtroERP} onChange={e => setFiltroERP(e.target.value)} className={`w-full ${selectCls}`}>
              <option value="todos">Todos</option>
              <option value="integrado">Integrado</option>
              <option value="nao_integrado">Não integrado</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Cupom</label>
            <input value={filtroCupom} onChange={e => setFiltroCupom(e.target.value)} placeholder="Ex: PASCOA20" className={`w-full ${inputCls} font-mono uppercase`} />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">CPF / CNPJ</label>
            <input value={filtroCPF} onChange={e => setFiltroCPF(e.target.value)} placeholder="000.000.000-00" className={`w-full ${inputCls}`} />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">De</label>
            <input type="date" value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Até</label>
            <input type="date" value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
          {filtrosAtivos && (
            <div className="col-span-2 md:col-span-4 flex justify-end">
              <button onClick={limparFiltros} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:underline">
                <X size={12} /> Limpar filtros
              </button>
            </div>
          )}
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
              {pedidosFiltrados.map((p: any) => (
                <React.Fragment key={p.id}>
                  <tr
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleExpandir(p.id)}>
                    <td className="px-3 py-4 text-gray-400">
                      {expandido === p.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                      <p className="font-bold text-sm text-gray-800">{[p.customers?.first_name, p.customers?.last_name].filter(Boolean).join(' ') || '—'}</p>
                      <p className="text-xs text-gray-400">{p.customers?.email || ''}</p>
                      {p.customers?.cpf && <p className="text-xs text-gray-300 font-mono">{p.customers.cpf}</p>}
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
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={9} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                          {/* Col 1: Endereço + Valores */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Endereço de Entrega</p>
                            {(() => {
                              const e = p.shipping_address
                              if (!e || typeof e !== 'object') return <p className="text-sm text-gray-400">Não informado</p>
                              const logradouro = e.logradouro || e.street || e.endereco || ''
                              const numero     = e.numero || e.number || ''
                              const compl      = e.complemento || e.complement || ''
                              const bairro     = e.bairro || e.neighborhood || ''
                              const cidade     = e.localidade || e.city || e.cidade || ''
                              const uf         = e.uf || e.state || ''
                              const cep        = e.cep || e.zip || e.zipcode || ''
                              const linha1     = [logradouro, numero].filter(Boolean).join(', ')
                              const linhaCid   = [cidade, uf].filter(Boolean).join(' — ')
                              const vazio      = !linha1 && !bairro && !linhaCid && !cep
                              if (vazio) return <p className="text-sm text-gray-400 italic">Endereço incompleto</p>
                              return (
                                <div className="text-sm text-gray-700 space-y-0.5">
                                  {linha1   && <p className="font-bold">{linha1}</p>}
                                  {compl    && <p>{compl}</p>}
                                  {bairro   && <p>{bairro}</p>}
                                  {linhaCid && <p>{linhaCid}</p>}
                                  {cep      && <p className="font-mono text-gray-500">{cep}</p>}
                                </div>
                              )
                            })()}
                            {p.shipping_method && (
                              <p className="mt-2 text-xs text-gray-500">Frete: <span className="font-bold text-gray-700">{p.shipping_method}</span></p>
                            )}
                            {p.coupon_code && (
                              <p className="text-xs text-gray-500 mt-1">Cupom: <span className="font-bold text-green-700">{p.coupon_code}</span></p>
                            )}
                            {p.sapiens_order_id && (
                              <p className="text-xs text-gray-500 mt-1">Sapiens ID: <span className="font-mono font-bold text-gray-700">{p.sapiens_order_id}</span></p>
                            )}

                            <p className="text-xs font-black text-gray-500 uppercase mt-4 mb-2">Valores</p>
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
                                <button onClick={() => salvarTracking(p)} className="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Ações de status */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Alterar Status</p>
                            {STATUS_FINAIS.includes(p.status) ? (
                              <p className="text-xs text-gray-400 italic mb-3">Status final — não permite alteração.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {(STATUS_TRANSITIONS[p.status] || []).map(s => (
                                  <button
                                    key={s}
                                    disabled={acao[p.id + '_status']}
                                    onClick={e => { e.stopPropagation(); atualizarStatus(p, s) }}
                                    className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${STATUS_LABELS[s].bg} ${STATUS_LABELS[s].text} border-current hover:opacity-80 disabled:opacity-50`}>
                                    → {STATUS_LABELS[s].label}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Capturar */}
                            {p.payment_status === 'paid' && (
                              <button
                                disabled={acao[p.id + '_capturar']}
                                onClick={e => { e.stopPropagation(); capturarPagamento(p) }}
                                className="w-full flex items-center gap-2 text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-2">
                                <CreditCard size={13} />
                                {acao[p.id + '_capturar'] ? 'Capturando...' : 'Capturar Pagamento'}
                              </button>
                            )}

                            {/* ClearSales */}
                            {(p.status === 'awaiting_shipment' || p.status === 'pending') && !p.clearsales_status && (
                              <button
                                disabled={acao[p.id + '_clearsale']}
                                onClick={e => { e.stopPropagation(); enviarClearSales(p) }}
                                className="w-full flex items-center gap-2 text-xs font-bold bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 mb-2">
                                <AlertTriangle size={13} />
                                {acao[p.id + '_clearsale'] ? 'Enviando...' : 'Enviar p/ ClearSales'}
                              </button>
                            )}
                            {p.clearsales_status && (
                              <p className="text-xs text-gray-500 mb-2">
                                ClearSales: <span className="font-bold text-gray-700">{p.clearsales_status} {p.clearsales_score ? `(${p.clearsales_score})` : ''}</span>
                              </p>
                            )}

                            {/* Estorno com motivo */}
                            {!['cancelled', 'refunded'].includes(p.status) && p.payment_status !== 'refunded' && (
                              <div className="mt-2">
                                <p className="text-xs font-black text-gray-500 uppercase mb-1">Estorno</p>
                                <input
                                  value={motivoEstorno[p.id] || ''}
                                  onChange={e => setMotivoEstorno(m => ({ ...m, [p.id]: e.target.value }))}
                                  placeholder="Motivo obrigatório..."
                                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-red-400 mb-1"
                                />
                                <button
                                  disabled={acao[p.id + '_estorno']}
                                  onClick={e => { e.stopPropagation(); estornarPedido(p) }}
                                  className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                  <XCircle size={13} />
                                  {acao[p.id + '_estorno'] ? 'Estornando...' : 'Estornar Pedido'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Col 3: Notificar cliente */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Notificar Cliente</p>
                            <p className="text-xs text-gray-400 mb-2">Envia e-mail ao cliente com o status selecionado:</p>
                            <div className="flex flex-col gap-1.5">
                              {NOTIF_STATUS.map(s => (
                                <button
                                  key={s}
                                  disabled={!!acao[p.id + '_notif']}
                                  onClick={e => { e.stopPropagation(); notificarCliente(p, s) }}
                                  className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                  {acao[p.id + '_notif']
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <Bell size={12} />}
                                  {STATUS_LABELS[s]?.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Col 4: Anotações internas */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Anotações Internas</p>
                            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                              {(notes[p.id] || []).length === 0 && (
                                <p className="text-xs text-gray-400 italic">Nenhuma anotação ainda.</p>
                              )}
                              {(notes[p.id] || []).map((n: Note) => (
                                <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs relative group">
                                  <p className="text-gray-800 leading-relaxed">{n.note}</p>
                                  <p className="text-gray-400 mt-1">{n.created_by} · {new Date(n.created_at).toLocaleString('pt-BR')}</p>
                                  <button
                                    onClick={() => deletarNota(p.id, n.id)}
                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <textarea
                                rows={2}
                                placeholder="Nova anotação interna..."
                                value={novaNota[p.id] || ''}
                                onChange={e => setNovaNota(n => ({ ...n, [p.id]: e.target.value }))}
                                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-400 resize-none"
                              />
                              <button
                                disabled={!!acao[p.id + '_nota']}
                                onClick={() => salvarNota(p.id)}
                                className="shrink-0 self-end flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {acao[p.id + '_nota'] ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                              </button>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>

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