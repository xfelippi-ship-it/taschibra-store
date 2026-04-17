/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShoppingCart, Mail, RefreshCw, Filter, X, Settings, BarChart2, ChevronDown } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STEPS = ['cart', 'address', 'shipping', 'payment']
const STEP_LABELS: Record<string, string> = { cart: 'Carrinho', address: 'Endereço', shipping: 'Frete', payment: 'Pagamento' }
const STEP_COLORS: Record<string, string> = { cart: 'bg-gray-400', address: 'bg-yellow-400', shipping: 'bg-blue-400', payment: 'bg-red-500' }
const STEP_BADGE: Record<string, string> = {
  cart:     'bg-gray-100 text-gray-600',
  address:  'bg-yellow-100 text-yellow-700',
  shipping: 'bg-blue-100 text-blue-700',
  payment:  'bg-red-100 text-red-700',
}

const TEMPLATES_D1 = [
  { value: 'lembrete_simples', label: 'Lembrete simples — "você esqueceu algo"' },
  { value: 'problema_pagamento', label: 'Problema no pagamento' },
  { value: 'frete_caro', label: 'Frete ficou caro?' },
]
const TEMPLATES_D2 = [
  { value: 'urgencia_suave', label: 'Carrinho expira em 24h' },
  { value: 'parcelamento', label: 'Parcele em até 10x sem juros' },
  { value: 'estoque_limitado', label: 'Itens com estoque limitado' },
]
const TEMPLATES_D3 = [
  { value: 'ultima_chance', label: 'Última chance + cupom exclusivo' },
  { value: 'oferta_especial', label: 'Oferta especial só hoje' },
  { value: 'frete_gratis', label: 'Frete grátis pra você' },
]

const VARIAVEIS = ['{{nome}}', '{{produtos}}', '{{valor_total}}', '{{link_carrinho}}', '{{cupom}}', '{{parcelas}}']

function ProgressBar({ step }: { step: string }) {
  const idx = STEPS.indexOf(step)
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / STEPS.length) * 100)
  const color = STEP_COLORS[step] || 'bg-gray-300'
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap font-bold w-16">{STEP_LABELS[step] || step}</span>
    </div>
  )
}

function fmt(v: number) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
function tempoRelativo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000), d = Math.floor(h / 24)
  if (d > 0) return `há ${d} dia${d > 1 ? 's' : ''}`
  if (h > 0) return `há ${h}h`
  return `há ${Math.floor(diff / 60000)}min`
}

function nextDisparo(c: any): number | null {
  if (!c.d1_sent_at) return 1
  if (!c.d2_sent_at) return 2
  if (!c.d3_sent_at) return 3
  return null
}

type Settings = {
  mode: string
  d1_enabled: boolean; d1_delay_hours: number; d1_template: string; d1_subject: string; d1_body: string; d1_coupon_code: string
  d2_enabled: boolean; d2_delay_hours: number; d2_template: string; d2_subject: string; d2_body: string; d2_coupon_code: string
  d3_enabled: boolean; d3_delay_hours: number; d3_template: string; d3_subject: string; d3_body: string; d3_coupon_code: string
}

const DEFAULT_SETTINGS: Settings = {
  mode: 'manual',
  d1_enabled: true, d1_delay_hours: 1, d1_template: 'lembrete_simples', d1_subject: 'Você esqueceu algo no carrinho',
  d1_body: 'Olá {{nome}}, você deixou {{produtos}} no seu carrinho.\n\nFinalize agora: {{link_carrinho}}',
  d1_coupon_code: '',
  d2_enabled: true, d2_delay_hours: 12, d2_template: 'urgencia_suave', d2_subject: 'Seu carrinho ainda está reservado',
  d2_body: '{{nome}}, seu carrinho expira em 24h.\n\nParcele em {{parcelas}} e finalize: {{link_carrinho}}',
  d2_coupon_code: '',
  d3_enabled: true, d3_delay_hours: 24, d3_template: 'ultima_chance', d3_subject: 'Última chance — oferta exclusiva para você',
  d3_body: '{{nome}}, última chance! Use o cupom {{cupom}} e finalize.\n\nVálido só hoje: {{link_carrinho}}',
  d3_coupon_code: '',
}

export default function CarrinhosAbandonadosTab() {
  const [aba, setAba] = useState<'carrinhos'|'config'|'relatorio'>('carrinhos')
  const [carrinhos, setCarrinhos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [enviando, setEnviando] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok'|'erro' } | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [savingSettings, setSavingSettings] = useState(false)
  const [cupons, setCupons] = useState<any[]>([])
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStep, setFiltroStep] = useState('todos')
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  function showToast(msg: string, tipo: 'ok'|'erro' = 'ok') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    carregar()
    carregarSettings()
    carregarCupons()
  }, [])

  async function carregar() {
    setLoading(true)
    const limite = new Date(Date.now() - 1 * 3600000).toISOString()
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

  async function carregarSettings() {
    const { data } = await supabase.from('cart_recovery_settings').select('*').limit(1).single()
    if (data) setSettings(data as Settings)
  }

  async function carregarCupons() {
    const { data } = await supabase.from('coupons').select('code, discount_type, discount_value').eq('active', true)
    setCupons(data || [])
  }

  async function salvarSettings() {
    setSavingSettings(true)
    await supabase.from('cart_recovery_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001')
    setSavingSettings(false)
    showToast('Configurações salvas!')
  }

  function inserirVariavel(field: string, variavel: string) {
    const el = textareaRefs.current[field]
    if (!el) return
    const start = el.selectionStart, end = el.selectionEnd
    const novo = el.value.slice(0, start) + variavel + el.value.slice(end)
    setSettings(s => ({ ...s, [field]: novo }))
    setTimeout(() => { el.focus(); el.setSelectionRange(start + variavel.length, start + variavel.length) }, 0)
  }

  async function enviarDisparo(carrinho: any, disparo: number) {
    if (!carrinho.customer_email) return showToast('Carrinho sem e-mail cadastrado', 'erro')
    setEnviando(e => ({ ...e, [carrinho.id]: true }))
    try {
      const res = await fetch('/api/carrinho-lembrete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: carrinho.id, email: carrinho.customer_email, disparo, settings })
      })
      const data = await res.json()
      if (data.ok) { showToast(`Disparo #${disparo} enviado!`); carregar() }
      else showToast(data.error || 'Erro ao enviar', 'erro')
    } finally {
      setEnviando(e => ({ ...e, [carrinho.id]: false }))
    }
  }

  async function enviarEmMassa() {
    if (selecionados.size === 0) return
    if (!confirm(`Enviar próximo disparo para ${selecionados.size} cliente(s)?`)) return
    const lista = carrinhosFiltrados.filter(c => selecionados.has(c.id) && c.customer_email)
    for (const c of lista) {
      const d = nextDisparo(c)
      if (d) await enviarDisparo(c, d)
    }
    setSelecionados(new Set())
  }

  function toggleSelecionado(id: string) {
    const novo = new Set(selecionados)
    novo.has(id) ? novo.delete(id) : novo.add(id)
    setSelecionados(novo)
  }

  function toggleTodos() {
    selecionados.size === carrinhosFiltrados.length
      ? setSelecionados(new Set())
      : setSelecionados(new Set(carrinhosFiltrados.map(c => c.id)))
  }

  const carrinhosFiltrados = carrinhos.filter(c => {
    if (busca) {
      const b = busca.toLowerCase()
      if (!c.customer_name?.toLowerCase().includes(b) && !c.customer_email?.toLowerCase().includes(b) && !c.customer_cpf?.includes(b)) return false
    }
    if (filtroStep !== 'todos' && c.last_step_reached !== filtroStep) return false
    if (filtroDataDe && new Date(c.created_at) < new Date(filtroDataDe)) return false
    if (filtroDataAte) { const ate = new Date(filtroDataAte); ate.setHours(23,59,59,999); if (new Date(c.created_at) > ate) return false }
    return true
  })

  const totalGeral = carrinhosFiltrados.reduce((s, c) => s + (Number(c.total) || 0), 0)
  const totalSelecionado = carrinhosFiltrados.filter(c => selecionados.has(c.id)).reduce((s, c) => s + (Number(c.total) || 0), 0)
  const filtrosAtivos = filtroStep !== 'todos' || filtroDataDe !== '' || filtroDataAte !== ''
  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
  const selectCls = `${inputCls} bg-white`

  // ── RELATÓRIO ───────────────────────────────────────────────────────────
  const total = carrinhos.length
  const recuperados = carrinhos.filter(c => c.recovered_at).length
  const taxaRecuperacao = total > 0 ? Math.round((recuperados / total) * 100) : 0
  const receitaRecuperada = carrinhos.filter(c => c.recovered_at).reduce((s, c) => s + (Number(c.total) || 0), 0)
  const receitaAberto = carrinhos.filter(c => !c.recovered_at).reduce((s, c) => s + (Number(c.total) || 0), 0)
  const d1Conv = carrinhos.filter(c => c.d1_sent_at && c.recovery_disparo === 1).length
  const d2Conv = carrinhos.filter(c => c.d2_sent_at && c.recovery_disparo === 2).length
  const d3Conv = carrinhos.filter(c => c.d3_sent_at && c.recovery_disparo === 3).length
  const d1Sent = carrinhos.filter(c => c.d1_sent_at).length
  const d2Sent = carrinhos.filter(c => c.d2_sent_at).length
  const d3Sent = carrinhos.filter(c => c.d3_sent_at).length
  const byStep = STEPS.map(s => ({ step: s, count: carrinhos.filter(c => c.last_step_reached === s).length }))
  const maxStep = Math.max(...byStep.map(b => b.count), 1)

  return (
    <div className="space-y-4">

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-bold ${toast.tipo === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header com abas */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['carrinhos', 'config', 'relatorio'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${aba === a ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {a === 'carrinhos' && <><ShoppingCart size={13} /> Carrinhos</>}
              {a === 'config' && <><Settings size={13} /> Configurações</>}
              {a === 'relatorio' && <><BarChart2 size={13} /> Relatório</>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${settings.mode === 'automatic' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {settings.mode === 'automatic' ? 'Automático ativo' : 'Modo manual'}
          </span>
          <button onClick={carregar} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={13} /> Atualizar
          </button>
        </div>
      </div>

      {/* ═══════════════ ABA CARRINHOS ═══════════════ */}
      {aba === 'carrinhos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {carrinhosFiltrados.length} carrinho{carrinhosFiltrados.length !== 1 ? 's' : ''} · <span className="text-green-700 font-bold">R$ {fmt(totalGeral)}</span> em risco · sem alteração há mais de 1h
            </p>
            <div className="flex gap-2">
              {selecionados.size > 0 && (
                <button onClick={enviarEmMassa} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-2 rounded-lg">
                  <Mail size={13} /> Enviar próximo disparo ({selecionados.size})
                </button>
              )}
              <button onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${filtrosAtivos ? 'bg-green-600 text-white border-green-600' : 'text-gray-500 border-gray-200 hover:border-green-300'}`}>
                <Filter size={13} /> Filtros
              </button>
            </div>
          </div>

          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..." className={`w-full ${inputCls}`} />

          {filtrosAbertos && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Etapa</label>
                <select value={filtroStep} onChange={e => setFiltroStep(e.target.value)} className={`w-full ${selectCls}`}>
                  <option value="todos">Todas</option>
                  {STEPS.map(s => <option key={s} value={s}>{STEP_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase mb-1 block">De</label>
                <input type="date" value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)} className={`w-full ${inputCls}`} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Até</label>
                <input type="date" value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)} className={`w-full ${inputCls}`} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Carregando carrinhos...</div>
            ) : carrinhosFiltrados.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Nenhum carrinho abandonado.</p>
                <p className="text-xs mt-1 text-gray-300">Carrinhos sem alteração há mais de 1h aparecem aqui.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selecionados.size === carrinhosFiltrados.length && carrinhosFiltrados.length > 0} onChange={toggleTodos} className="w-4 h-4 accent-green-600 cursor-pointer" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Etapa</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Progresso</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Disparos</th>
                    <th className="text-right px-4 py-3 text-xs font-black text-gray-500 uppercase">Valor</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {carrinhosFiltrados.map(c => {
                    const proximo = nextDisparo(c)
                    return (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4"><input type="checkbox" checked={selecionados.has(c.id)} onChange={() => toggleSelecionado(c.id)} className="w-4 h-4 accent-green-600 cursor-pointer" /></td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-sm text-gray-800">{c.customer_name || '—'}</p>
                          {c.customer_email && <p className="text-xs text-blue-500 truncate max-w-[180px]">{c.customer_email}</p>}
                          <p className="text-xs text-gray-300">{tempoRelativo(c.updated_at)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STEP_BADGE[c.last_step_reached || 'cart']}`}>
                            {STEP_LABELS[c.last_step_reached] || 'Carrinho'}
                          </span>
                        </td>
                        <td className="px-4 py-4"><ProgressBar step={c.last_step_reached || 'cart'} /></td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            {[1,2,3].map(n => {
                              const sent = n === 1 ? c.d1_sent_at : n === 2 ? c.d2_sent_at : c.d3_sent_at
                              return (
                                <span key={n} className={`text-xs font-bold px-1.5 py-0.5 rounded ${sent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                  #{n}{sent ? ' ✓' : ''}
                                </span>
                              )
                            })}
                          </div>
                          {c.recovered_at && <span className="text-xs font-bold text-green-600 mt-1 block">Convertido!</span>}
                        </td>
                        <td className="px-4 py-4 text-right font-black text-green-700 text-sm">R$ {fmt(Number(c.total || 0))}</td>
                        <td className="px-4 py-4 text-center">
                          {proximo && c.customer_email && !c.recovered_at ? (
                            <button
                              onClick={() => enviarDisparo(c, proximo)}
                              disabled={enviando[c.id]}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 ${proximo === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                              {enviando[c.id] ? '...' : `Enviar #${proximo}`}
                            </button>
                          ) : c.recovered_at ? (
                            <span className="text-xs text-green-600 font-bold">Recuperado</span>
                          ) : (
                            <span className="text-xs text-gray-300">Todos enviados</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      {selecionados.size > 0 ? `${selecionados.size} selecionado(s) · R$ ${fmt(totalSelecionado)}` : `${carrinhosFiltrados.length} carrinho(s)`}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-green-700 text-sm">R$ {fmt(totalGeral)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ ABA CONFIGURAÇÕES ═══════════════ */}
      {aba === 'config' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-black text-gray-800">Modo de operação</p>
                <p className="text-xs text-gray-400 mt-0.5">No modo automático o sistema dispara sozinho nos tempos configurados</p>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {['manual', 'automatic'].map(m => (
                  <button key={m} onClick={() => setSettings(s => ({ ...s, mode: m }))}
                    className={`text-xs font-bold px-4 py-2 rounded-md transition-colors ${settings.mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {m === 'manual' ? 'Manual' : 'Automático'}
                  </button>
                ))}
              </div>
            </div>

            {[
              { n: 1, label: 'Disparo #1', color: 'bg-blue-100 text-blue-800', templates: TEMPLATES_D1, tKey: 'd1_template', sKey: 'd1_subject', bKey: 'd1_body', cKey: 'd1_coupon_code', eKey: 'd1_enabled', dKey: 'd1_delay_hours', hint: 'Sem cupom recomendado — só lembrete' },
              { n: 2, label: 'Disparo #2', color: 'bg-amber-100 text-amber-800', templates: TEMPLATES_D2, tKey: 'd2_template', sKey: 'd2_subject', bKey: 'd2_body', cKey: 'd2_coupon_code', eKey: 'd2_enabled', dKey: 'd2_delay_hours', hint: 'Urgência suave' },
              { n: 3, label: 'Disparo #3', color: 'bg-green-100 text-green-800', templates: TEMPLATES_D3, tKey: 'd3_template', sKey: 'd3_subject', bKey: 'd3_body', cKey: 'd3_coupon_code', eKey: 'd3_enabled', dKey: 'd3_delay_hours', hint: 'Última chance + oferta' },
            ].map(({ n, label, color, templates, tKey, sKey, bKey, cKey, eKey, dKey, hint }) => (
              <div key={n} className="border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>{label}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={168}
                        value={(settings as any)[dKey] ?? 1}
                        onChange={e => setSettings(s => ({ ...s, [dKey]: Number(e.target.value) }))}
                        className="w-14 border border-gray-200 rounded px-2 py-0.5 text-xs text-center outline-none focus:border-green-500"
                      />
                      <span className="text-xs text-gray-400">horas após abandono</span>
                    </div>
                    <span className="text-xs text-gray-400">· {hint}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500">Ativo</span>
                    <input type="checkbox" checked={(settings as any)[eKey]} onChange={e => setSettings(s => ({ ...s, [eKey]: e.target.checked }))} className="accent-green-600" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Template base</label>
                    <select value={(settings as any)[tKey]} onChange={e => setSettings(s => ({ ...s, [tKey]: e.target.value }))} className={`w-full ${selectCls} text-xs`}>
                      {templates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Cupom (opcional)</label>
                    <select value={(settings as any)[cKey] || ''} onChange={e => setSettings(s => ({ ...s, [cKey]: e.target.value }))} className={`w-full ${selectCls} text-xs`}>
                      <option value="">— Nenhum —</option>
                      {cupons.map(c => <option key={c.code} value={c.code}>{c.code} · {c.discount_type === 'percent' ? `${c.discount_value}% off` : `R$ ${c.discount_value} off`}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Assunto do e-mail</label>
                  <input value={(settings as any)[sKey]} onChange={e => setSettings(s => ({ ...s, [sKey]: e.target.value }))} className={`w-full ${inputCls} text-xs`} />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Corpo do e-mail <span className="text-gray-300 font-normal normal-case">— editável</span></label>
                  <textarea
                    ref={el => { textareaRefs.current[bKey] = el }}
                    value={(settings as any)[bKey]}
                    onChange={e => setSettings(s => ({ ...s, [bKey]: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-green-500 resize-y font-mono"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {VARIAVEIS.map(v => (
                      <button key={v} onClick={() => inserirVariavel(bKey, v)}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-100 font-mono">
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button onClick={salvarSettings} disabled={savingSettings}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-50">
                {savingSettings ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ABA RELATÓRIO ═══════════════ */}
      {aba === 'relatorio' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total abandonados', value: total, color: 'text-gray-800' },
              { label: 'Recuperados', value: `${recuperados} (${taxaRecuperacao}%)`, color: 'text-green-700' },
              { label: 'Receita recuperada', value: `R$ ${fmt(receitaRecuperada)}`, color: 'text-green-700' },
              { label: 'Em aberto', value: `R$ ${fmt(receitaAberto)}`, color: 'text-red-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-black text-gray-500 uppercase mb-3">Conversão por disparo</p>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs text-gray-400 font-medium">Disparo</th>
                  <th className="text-center pb-2 text-xs text-gray-400 font-medium">Enviados</th>
                  <th className="text-center pb-2 text-xs text-gray-400 font-medium">Convertidos</th>
                  <th className="text-right pb-2 text-xs text-gray-400 font-medium">Taxa</th>
                </tr></thead>
                <tbody>
                  {[
                    { label: '#1 · 1h', sent: d1Sent, conv: d1Conv, color: 'bg-blue-100 text-blue-800' },
                    { label: '#2 · 12h', sent: d2Sent, conv: d2Conv, color: 'bg-amber-100 text-amber-800' },
                    { label: '#3 · 24h', sent: d3Sent, conv: d3Conv, color: 'bg-green-100 text-green-800' },
                  ].map(({ label, sent, conv, color }) => (
                    <tr key={label} className="border-b border-gray-50">
                      <td className="py-2"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{label}</span></td>
                      <td className="py-2 text-center text-sm">{sent}</td>
                      <td className="py-2 text-center text-sm font-bold text-green-700">{conv}</td>
                      <td className="py-2 text-right text-sm font-bold">{sent > 0 ? Math.round((conv / sent) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-black text-gray-500 uppercase mb-3">Abandono por etapa</p>
              <div className="space-y-3">
                {byStep.map(({ step, count }) => (
                  <div key={step}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{STEP_LABELS[step]}</span>
                      <span className={`text-sm font-bold ${STEP_BADGE[step]?.includes('red') ? 'text-red-600' : 'text-gray-600'}`}>
                        {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${STEP_COLORS[step]}`} style={{ width: `${total > 0 ? Math.round((count / maxStep) * 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
