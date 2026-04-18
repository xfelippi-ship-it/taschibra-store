'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TrendingDown, TrendingUp, Minus, RefreshCw, Plus, Trash2, Bell, ExternalLink } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SOURCES = [
  { id: 'mercadolivre', label: 'Mercado Livre', cor: 'bg-yellow-100 text-yellow-800' },
  { id: 'shopee',       label: 'Shopee',        cor: 'bg-orange-100 text-orange-800' },
  { id: 'amazon',       label: 'Amazon',        cor: 'bg-blue-100 text-blue-800' },
  { id: 'magalu',       label: 'Magalu',        cor: 'bg-blue-100 text-blue-700' },
  { id: 'site',         label: 'Site',          cor: 'bg-gray-100 text-gray-700' },
]

function fmt(v: number) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }

export default function MonitoramentoPrecoTab() {
  const [aba, setAba] = useState<'painel'|'config'|'alertas'>('painel')
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [competitors, setCompetitors] = useState<any[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [skuFiltro, setSkuFiltro] = useState('')
  const [sourceFiltro, setSourceFiltro] = useState('todos')

  // Modais
  const [modalComp, setModalComp] = useState(false)
  const [modalAlerta, setModalAlerta] = useState(false)
  const [formComp, setFormComp] = useState({ sku: '', product_name: '', source: 'mercadolivre', search_term: '' })
  const [formAlerta, setFormAlerta] = useState({ sku: '', source: '', tipo: 'preco_abaixo', threshold: '', email_notificar: '' })
  const [msg, setMsg] = useState<string|null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const [s, c, a] = await Promise.all([
      (supabase.from as any)('market_price_snapshots').select('*').order('captured_at', { ascending: false }).limit(500),
      (supabase.from as any)('market_competitors').select('*').order('sku'),
      (supabase.from as any)('market_alerts').select('*').order('sku'),
    ])
    setSnapshots(s.data || [])
    setCompetitors(c.data || [])
    setAlertas(a.data || [])
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000) }

  // Agrupa snapshots por SKU e calcula min/max/avg por source
  const skusUnicos = [...new Set(snapshots.map(s => s.sku))]
  const resumoPorSku = skusUnicos.map(sku => {
    const itens = snapshots.filter(s => s.sku === sku)
    const porSource = SOURCES.map(src => {
      const srcItens = itens.filter(s => s.source === src.id)
      if (!srcItens.length) return null
      const precos = srcItens.map(s => s.price)
      return {
        source: src.id,
        label: src.label,
        cor: src.cor,
        min: Math.min(...precos),
        max: Math.max(...precos),
        avg: precos.reduce((a, b) => a + b, 0) / precos.length,
        count: srcItens.length,
        ultimo: srcItens[0],
      }
    }).filter(Boolean)
    const todosPrecos = itens.map(s => s.price)
    return {
      sku,
      product_name: itens[0]?.title || sku,
      min: Math.min(...todosPrecos),
      max: Math.max(...todosPrecos),
      avg: todosPrecos.reduce((a, b) => a + b, 0) / todosPrecos.length,
      porSource,
      total: itens.length,
      ultimo: itens[0]?.captured_at,
    }
  }).filter(r => {
    if (skuFiltro && !r.sku.toLowerCase().includes(skuFiltro.toLowerCase()) && !r.product_name.toLowerCase().includes(skuFiltro.toLowerCase())) return false
    return true
  })

  async function salvarComp() {
    if (!formComp.sku || !formComp.search_term) return
    await (supabase.from as any)('market_competitors').insert(formComp)
    setModalComp(false)
    setFormComp({ sku: '', product_name: '', source: 'mercadolivre', search_term: '' })
    carregar()
    showMsg('Configuração salva!')
  }

  async function salvarAlerta() {
    if (!formAlerta.sku || !formAlerta.threshold || !formAlerta.email_notificar) return
    await (supabase.from as any)('market_alerts').insert({
      ...formAlerta,
      threshold: parseFloat(formAlerta.threshold),
      source: formAlerta.source || null,
    })
    setModalAlerta(false)
    setFormAlerta({ sku: '', source: '', tipo: 'preco_abaixo', threshold: '', email_notificar: '' })
    carregar()
    showMsg('Alerta criado!')
  }

  async function excluirComp(id: string) {
    await (supabase.from as any)('market_competitors').delete().eq('id', id)
    setCompetitors(prev => prev.filter(c => c.id !== id))
  }

  async function excluirAlerta(id: string) {
    await (supabase.from as any)('market_alerts').delete().eq('id', id)
    setAlertas(prev => prev.filter(a => a.id !== id))
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 w-full"
  const selectCls = `${inputCls} bg-white`

  return (
    <div className="space-y-4">
      {msg && <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-lg">{msg}</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['painel','config','alertas'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${aba === a ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {a === 'painel' ? '📊 Painel' : a === 'config' ? '⚙️ Configurar SKUs' : '🔔 Alertas'}
            </button>
          ))}
        </div>
        <button onClick={carregar} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {/* ═══ ABA PAINEL ═══ */}
      {aba === 'painel' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <input value={skuFiltro} onChange={e => setSkuFiltro(e.target.value)}
              placeholder="Buscar por SKU ou nome..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
            <select value={sourceFiltro} onChange={e => setSourceFiltro(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-500">
              <option value="todos">Todos os canais</option>
              {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Carregando dados...</div>
          ) : resumoPorSku.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingDown size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Nenhum dado de preço ainda.</p>
              <p className="text-xs mt-1">Configure os SKUs a monitorar e conecte o N8n para começar a capturar.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">SKU / Produto</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Menor preço</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Média</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Maior preço</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Por canal</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoPorSku.map(r => (
                    <tr key={r.sku} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-800 text-xs">{r.sku}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{r.product_name}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{r.total} registros</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-green-700 font-black text-sm">R$ {fmt(r.min)}</span>
                        <TrendingDown size={12} className="inline ml-1 text-green-500" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-gray-700 font-bold text-sm">R$ {fmt(r.avg)}</span>
                        <Minus size={12} className="inline ml-1 text-gray-400" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-red-600 font-black text-sm">R$ {fmt(r.max)}</span>
                        <TrendingUp size={12} className="inline ml-1 text-red-500" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(r.porSource as any[]).map((ps: any) => (
                            <div key={ps.source} className="flex items-center gap-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ps.cor}`}>{ps.label}</span>
                              <span className="text-xs text-gray-600 font-bold">R$ {fmt(ps.min)}</span>
                              {ps.ultimo?.url && (
                                <a href={ps.ultimo.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ABA CONFIG ═══ */}
      {aba === 'config' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">SKUs configurados para monitoramento por canal.</p>
            <button onClick={() => setModalComp(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
              <Plus size={13} /> Adicionar SKU
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {competitors.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Nenhum SKU configurado. Adicione SKUs para monitorar.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">SKU</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Canal</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Termo de busca</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map(c => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800 font-mono text-xs">{c.sku}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SOURCES.find(s => s.id === c.source)?.cor || 'bg-gray-100 text-gray-600'}`}>
                          {SOURCES.find(s => s.id === c.source)?.label || c.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{c.search_term}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => excluirComp(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══ ABA ALERTAS ═══ */}
      {aba === 'alertas' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Receba notificações quando preços atingirem limites configurados.</p>
            <button onClick={() => setModalAlerta(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
              <Plus size={13} /> Novo Alerta
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {alertas.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Nenhum alerta configurado.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">SKU</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Tipo</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Threshold</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Último disparo</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map(a => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800 font-mono text-xs">{a.sku}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.tipo === 'preco_abaixo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.tipo === 'preco_abaixo' ? '↓ Abaixo de' : '↑ Acima de'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-800">R$ {fmt(a.threshold)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.email_notificar}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {a.ultimo_disparo ? new Date(a.ultimo_disparo).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => excluirAlerta(a.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal Adicionar SKU */}
      {modalComp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setModalComp(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-gray-800 mb-4">Adicionar SKU para Monitorar</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">SKU *</label>
                <input className={inputCls} value={formComp.sku} onChange={e => setFormComp({...formComp, sku: e.target.value})} placeholder="Ex: 65050526" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Nome do produto</label>
                <input className={inputCls} value={formComp.product_name} onChange={e => setFormComp({...formComp, product_name: e.target.value})} placeholder="Ex: Pendente Taschibra UNI 740" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Canal *</label>
                <select className={selectCls} value={formComp.source} onChange={e => setFormComp({...formComp, source: e.target.value})}>
                  {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Termo de busca *</label>
                <input className={inputCls} value={formComp.search_term} onChange={e => setFormComp({...formComp, search_term: e.target.value})} placeholder="Ex: pendente taschibra uni 740" />
                <p className="text-xs text-gray-400 mt-1">Termo usado para buscar este produto no canal selecionado</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalComp(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg">Cancelar</button>
              <button onClick={salvarComp} disabled={!formComp.sku || !formComp.search_term}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Alerta */}
      {modalAlerta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setModalAlerta(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-gray-800 mb-4">Novo Alerta de Preço</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">SKU *</label>
                <input className={inputCls} value={formAlerta.sku} onChange={e => setFormAlerta({...formAlerta, sku: e.target.value})} placeholder="Ex: 65050526" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Canal (vazio = todos)</label>
                <select className={selectCls} value={formAlerta.source} onChange={e => setFormAlerta({...formAlerta, source: e.target.value})}>
                  <option value="">Todos os canais</option>
                  {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Tipo de alerta *</label>
                <select className={selectCls} value={formAlerta.tipo} onChange={e => setFormAlerta({...formAlerta, tipo: e.target.value})}>
                  <option value="preco_abaixo">Preço abaixo de</option>
                  <option value="preco_acima">Preço acima de</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Valor limite (R$) *</label>
                <input type="number" step="0.01" className={inputCls} value={formAlerta.threshold} onChange={e => setFormAlerta({...formAlerta, threshold: e.target.value})} placeholder="Ex: 150.00" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">E-mail para notificação *</label>
                <input type="email" className={inputCls} value={formAlerta.email_notificar} onChange={e => setFormAlerta({...formAlerta, email_notificar: e.target.value})} placeholder="Ex: comercial@taschibra.com.br" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalAlerta(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg">Cancelar</button>
              <button onClick={salvarAlerta} disabled={!formAlerta.sku || !formAlerta.threshold || !formAlerta.email_notificar}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg">Criar Alerta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
