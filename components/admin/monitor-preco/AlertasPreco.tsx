'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, Bell, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { Alerta } from './types'
import { CANAIS_LIST, CANAIS, fmt } from './constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  alertas: Alerta[]
  credenciais?: any[]
  onUpdate: () => void
  showMsg: (t: string) => void
}

const FORM_VAZIO = { sku: '', source: '', tipo: 'preco_abaixo', threshold: '', email_notificar: '', is_map: false }

export default function AlertasPreco({ alertas, credenciais = [], onUpdate, showMsg }: Props) {
  const canaisCustomizados = credenciais
    .filter(cc => cc.ativo && (cc.tipo === 'api' || cc.tipo === 'coletor') && !CANAIS_LIST.find(ofc => ofc.id === cc.canal))
    .map(cc => ({ id: cc.canal, label: cc.label, cor: 'bg-gray-100 text-gray-700' }))
  const CANAIS_DISPONIVEIS = [...CANAIS_LIST, ...canaisCustomizados]
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [produtos, setProdutos] = useState<{sku: string; name: string}[]>([])
  const [buscaProduto, setBuscaProduto] = useState('')

  async function carregarProdutos() {
    if (produtos.length) return
    const { data } = await supabase
      .from('products' as any)
      .select('sku,name')
      .eq('active', true)
      .order('name')
      .limit(2000)
    setProdutos(((data || []) as any[]).filter((p: any) => p.sku))
  }

  function handleAbrirModal() {
    setBuscaProduto('')
    carregarProdutos()
    setModal(true)
  }

  async function salvar() {
    if (!form.sku || !form.threshold || !form.email_notificar) {
      showMsg('Preencha SKU, valor limite e e-mail')
      return
    }
    setSalvando(true)
    const { error } = await supabase.from('market_alerts' as any).insert({
      sku: form.sku,
      source: form.source || null,
      tipo: form.tipo,
      threshold: parseFloat(form.threshold),
      email_notificar: form.email_notificar,
    })
    setSalvando(false)
    if (error) { showMsg('Erro ao criar alerta'); return }
    showMsg('Alerta criado!')
    setForm(FORM_VAZIO)
    setModal(false)
    onUpdate()
  }

  async function excluir(id: string) {
    await supabase.from('market_alerts' as any).delete().eq('id', id)
    showMsg('Alerta removido')
    onUpdate()
  }

  const alertasMAP = alertas.filter(a => a.tipo === 'mapa_violacao' || a.tipo === 'preco_abaixo')
  const alertasAlta = alertas.filter(a => a.tipo === 'preco_acima')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 font-medium">Alertas automáticos de preço.</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Receba e-mail quando um produto for vendido abaixo do MAP ou fora do limite configurado.
          </p>
        </div>
        <button onClick={handleAbrirModal}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
          <Plus size={13} /> Novo Alerta
        </button>
      </div>

      {/* Info sobre alertas automáticos MAP */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <Bell size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-700">Alertas MAP automáticos</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Quando um produto tem MAP configurado na aba Configurar SKUs e o N8n detectar um preço abaixo deste valor,
              um alerta é disparado automaticamente para o e-mail cadastrado aqui.
              Configure abaixo os SKUs e e-mails que devem receber estes alertas.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      {alertas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">Nenhum alerta configurado.</p>
          <p className="text-xs mt-1">Crie alertas para monitorar violações de MAP ou limites de preço.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Canal</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Tipo</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Limite</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Último disparo</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(a => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-800 font-mono text-xs">{a.sku}</td>
                  <td className="px-4 py-3">
                    {a.source
                      ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CANAIS_DISPONIVEIS.find(s => s.id === a.source)?.cor || 'bg-gray-100 text-gray-600'}`}>
                          {CANAIS_DISPONIVEIS.find(s => s.id === a.source)?.label || a.source}
                        </span>
                      : <span className="text-xs text-gray-400">Todos</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      a.tipo === 'preco_abaixo' ? 'bg-green-100 text-green-700' :
                      a.tipo === 'preco_acima'  ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {a.tipo === 'preco_abaixo' ? '↓ Abaixo de' :
                       a.tipo === 'preco_acima'  ? '↑ Acima de' :
                       '⚠️ Violação MAP'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800 text-sm">
                    R$ {fmt(a.threshold)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">
                    {a.email_notificar}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {a.ultimo_disparo
                      ? new Date(a.ultimo_disparo).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => excluir(a.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal novo alerta */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">Novo Alerta de Preço</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Produto *</label>
                <input value={buscaProduto} onChange={e => {
                    setBuscaProduto(e.target.value)
                    setForm({ ...form, sku: '' })
                  }}
                  placeholder="Buscar produto por nome ou SKU..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                {buscaProduto && !form.sku && (
                  <div className="border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow-sm">
                    {produtos
                      .filter(p =>
                        p.sku.toLowerCase().includes(buscaProduto.toLowerCase()) ||
                        p.name.toLowerCase().includes(buscaProduto.toLowerCase())
                      )
                      .slice(0, 20)
                      .map(p => (
                        <button key={p.sku} type="button"
                          onClick={() => { setForm({ ...form, sku: p.sku }); setBuscaProduto(`${p.sku} — ${p.name}`) }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100 last:border-0">
                          <span className="font-mono font-bold text-gray-700">{p.sku}</span>
                          <span className="text-gray-500 ml-2">{p.name}</span>
                        </button>
                      ))}
                    {produtos.filter(p =>
                      p.sku.toLowerCase().includes(buscaProduto.toLowerCase()) ||
                      p.name.toLowerCase().includes(buscaProduto.toLowerCase())
                    ).length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-400">Nenhum produto encontrado</p>
                    )}
                  </div>
                )}
                {form.sku && (
                  <p className="text-xs text-green-600 font-bold mt-1">✓ SKU: {form.sku}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Canal (vazio = todos)</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-500">
                  <option value="">Todos os canais</option>
                  {CANAIS_DISPONIVEIS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Tipo de alerta *</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-500">
                  <option value="preco_abaixo">Preço abaixo de (violação MAP)</option>
                  <option value="preco_acima">Preço acima de</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Valor limite R$ *</label>
                <input type="number" step="0.01" value={form.threshold}
                  onChange={e => setForm({ ...form, threshold: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">E-mail para notificação *</label>
                <input type="email" value={form.email_notificar}
                  onChange={e => setForm({ ...form, email_notificar: e.target.value })}
                  placeholder="comercial@taschibra.com.br"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={salvar}
                disabled={salvando || !form.sku || !form.threshold || !form.email_notificar}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-2.5 rounded-lg text-sm">
                {salvando ? 'Salvando...' : 'Criar Alerta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
