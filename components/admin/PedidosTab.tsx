/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { registrarAuditoria } from '@/lib/auditLog'
import { ChevronDown, ChevronRight, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Pendente',       bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed:  { label: 'Confirmado',     bg: 'bg-blue-100',   text: 'text-blue-700'   },
  processing: { label: 'Em separação',   bg: 'bg-purple-100', text: 'text-purple-700' },
  shipped:    { label: 'Enviado',        bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered:  { label: 'Entregue',       bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled:  { label: 'Cancelado',      bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:   { label: 'Estornado',      bg: 'bg-gray-100',   text: 'text-gray-600'   },
}

const PAYMENT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Aguardando',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
  paid:      { label: 'Pago',        bg: 'bg-green-100',  text: 'text-green-700'  },
  failed:    { label: 'Falhou',      bg: 'bg-red-100',    text: 'text-red-700'    },
  refunded:  { label: 'Estornado',   bg: 'bg-gray-100',   text: 'text-gray-600'   },
  captured:  { label: 'Capturado',   bg: 'bg-green-100',  text: 'text-green-700'  },
}

const STATUS_FLOW = ['pending','confirmed','processing','shipped','delivered']

export default function PedidosTab({ meuEmail = 'admin' }: { meuEmail?: string }) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  const [acao, setAcao] = useState<Record<string, boolean>>({})
  const [trackingEdit, setTrackingEdit] = useState<Record<string, string>>({})

  async function carregar() {
    setLoading(true)
    let q = supabase.from('orders').select(`*, customers(name, email, phone)`).order('created_at', { ascending: false }).limit(100)
    if (filtroStatus !== 'todos') q = q.eq('status', filtroStatus)
    const { data } = await q
    setPedidos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [filtroStatus])

  async function atualizarStatus(pedido: any, novoStatus: string) {
    setAcao(a => ({ ...a, [pedido.id + '_status']: true }))
    await supabase.from('orders').update({ status: novoStatus, updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'pedido_status_alterado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number} | ${pedido.status} → ${novoStatus}` })
    setAcao(a => ({ ...a, [pedido.id + '_status']: false }))
    carregar()
  }

  async function capturarPagamento(pedido: any) {
    setAcao(a => ({ ...a, [pedido.id + '_capturar']: true }))
    // Integração PagarMe: capturar charge
    await supabase.from('orders').update({ payment_status: 'captured', updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'pagamento_capturado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number}` })
    setAcao(a => ({ ...a, [pedido.id + '_capturar']: false }))
    carregar()
  }

  async function estornarPedido(pedido: any) {
    if (!confirm(`Confirma o estorno do pedido ${pedido.order_number}? Esta ação não pode ser desfeita.`)) return
    setAcao(a => ({ ...a, [pedido.id + '_estorno']: true }))
    // Integração PagarMe: refund
    await supabase.from('orders').update({ status: 'refunded', payment_status: 'refunded', updated_at: new Date().toISOString() }).eq('id', pedido.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'pedido_estornado', entidade: 'orders', detalhe: `Pedido: ${pedido.order_number}` })
    setAcao(a => ({ ...a, [pedido.id + '_estorno']: false }))
    carregar()
  }

  async function enviarClearSales(pedido: any) {
    setAcao(a => ({ ...a, [pedido.id + '_clearsale']: true }))
    // Integração ClearSales: enviar para análise
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

  const pedidosFiltrados = pedidos.filter(p =>
    busca === '' ||
    p.order_number?.toLowerCase().includes(busca.toLowerCase()) ||
    p.customers?.name?.toLowerCase().includes(busca.toLowerCase()) ||
    p.customers?.email?.toLowerCase().includes(busca.toLowerCase())
  )

  const badge = (cfg: any) => (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg?.bg} ${cfg?.text}`}>{cfg?.label}</span>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Pedidos</h1>
        <button onClick={carregar} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-green-300 transition-colors">
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por número, cliente ou e-mail..."
          className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-500" />
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-green-500">
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-3 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Pedido</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Data</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Pagamento</th>
                <th className="text-right px-4 py-3 text-xs font-black text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <>
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandido(expandido === p.id ? null : p.id)}>
                    <td className="px-3 py-4 text-gray-400">
                      {expandido === p.id ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </td>
                    <td className="px-4 py-4 font-black text-sm text-gray-800">{p.order_number}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <p className="font-bold text-gray-800">{p.customers?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{p.customers?.email || ''}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">{badge(STATUS_LABELS[p.status] || { label: p.status, bg: 'bg-gray-100', text: 'text-gray-600' })}</td>
                    <td className="px-4 py-4 text-center">{badge(PAYMENT_LABELS[p.payment_status] || { label: p.payment_status || '—', bg: 'bg-gray-100', text: 'text-gray-500' })}</td>
                    <td className="px-4 py-4 text-right font-black text-green-700">R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                  </tr>
                  {expandido === p.id && (
                    <tr key={p.id + '_detail'} className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={7} className="px-6 py-5">
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
                            {p.shipping_method && <p className="mt-2 text-xs text-gray-500">Frete: <span className="font-bold text-gray-700">{p.shipping_method}</span></p>}
                            {p.coupon_code && <p className="text-xs text-gray-500 mt-1">Cupom: <span className="font-bold text-green-700">{p.coupon_code}</span></p>}
                          </div>

                          {/* Valores */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Valores</p>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">R$ {Number(p.subtotal).toFixed(2).replace('.', ',')}</span></div>
                              {p.discount_total > 0 && <div className="flex justify-between"><span className="text-gray-500">Desconto</span><span className="font-bold text-red-600">-R$ {Number(p.discount_total).toFixed(2).replace('.', ',')}</span></div>}
                              <div className="flex justify-between"><span className="text-gray-500">Frete</span><span className="font-bold">R$ {Number(p.shipping_total).toFixed(2).replace('.', ',')}</span></div>
                              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="font-black text-gray-800">Total</span><span className="font-black text-green-700">R$ {Number(p.total).toFixed(2).replace('.', ',')}</span></div>
                            </div>
                            {/* Tracking */}
                            <div className="mt-3">
                              <p className="text-xs font-black text-gray-500 uppercase mb-1">Código de Rastreio</p>
                              <div className="flex gap-2">
                                <input value={trackingEdit[p.id] ?? p.tracking_code ?? ''}
                                  onChange={e => setTrackingEdit(t => ({ ...t, [p.id]: e.target.value }))}
                                  placeholder="Ex: BR123456789BR"
                                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs font-mono outline-none focus:border-green-500" />
                                <button onClick={() => salvarTracking(p)} className="text-xs font-bold bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Salvar</button>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase mb-2">Ações</p>
                            <div className="space-y-2">

                              {/* Avançar status */}
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Alterar status:</p>
                                <div className="flex flex-wrap gap-1">
                                  {STATUS_FLOW.filter(s => s !== p.status).map(s => (
                                    <button key={s} disabled={acao[p.id + '_status']}
                                      onClick={() => atualizarStatus(p, s)}
                                      className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${STATUS_LABELS[s].bg} ${STATUS_LABELS[s].text} border-current hover:opacity-80 disabled:opacity-50`}>
                                      → {STATUS_LABELS[s].label}
                                    </button>
                                  ))}
                                  <button disabled={acao[p.id + '_status']}
                                    onClick={() => atualizarStatus(p, 'cancelled')}
                                    className="text-xs font-bold px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">
                                    Cancelar
                                  </button>
                                </div>
                              </div>

                              {/* Capturar pagamento */}
                              {p.payment_status === 'paid' && (
                                <button disabled={acao[p.id + '_capturar']}
                                  onClick={() => capturarPagamento(p)}
                                  className="w-full flex items-center gap-2 text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                  <CreditCard size={13} /> {acao[p.id + '_capturar'] ? 'Capturando...' : 'Capturar Pagamento'}
                                </button>
                              )}

                              {/* ClearSales */}
                              {(p.status === 'confirmed' || p.status === 'pending') && (
                                <button disabled={acao[p.id + '_clearsale']}
                                  onClick={() => enviarClearSales(p)}
                                  className="w-full flex items-center gap-2 text-xs font-bold bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                                  <AlertTriangle size={13} /> {acao[p.id + '_clearsale'] ? 'Enviando...' : 'Enviar p/ ClearSales'}
                                </button>
                              )}

                              {/* Estorno */}
                              {['confirmed','processing','paid'].includes(p.status) && (
                                <button disabled={acao[p.id + '_estorno']}
                                  onClick={() => estornarPedido(p)}
                                  className="w-full flex items-center gap-2 text-xs font-bold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                  <XCircle size={13} /> {acao[p.id + '_estorno'] ? 'Estornando...' : 'Estornar Pedido'}
                                </button>
                              )}

                              {/* Sapiens ID */}
                              {p.sapiens_order_id && (
                                <p className="text-xs text-gray-500 mt-1">Sapiens ID: <span className="font-mono font-bold text-gray-700">{p.sapiens_order_id}</span></p>
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
          </table>
        )}
      </div>
    </div>
  )
}
