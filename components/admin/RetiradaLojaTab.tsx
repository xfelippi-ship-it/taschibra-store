'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit2, X, MapPin } from 'lucide-react'

interface Loja {
  id?: string
  nome: string
  telefone: string
  endereco: string
  cep: string
  cidade: string
  estado: string
  prazo_dias: number
  valor: number
  habilitado: boolean
}

const VAZIO: Loja = { nome: '', telefone: '', endereco: '', cep: '', cidade: 'Indaial', estado: 'SC', prazo_dias: 2, valor: 0, habilitado: true }

export default function RetiradaLojaTab() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Loja>(VAZIO)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('pickup_stores').select('*').order('nome')
    setLojas((data || []) as any)
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 2500) }

  async function salvar() {
    if (!form.nome.trim() || !form.endereco.trim()) return
    let error
    if (form.id) {
      const { id, ...rest } = form as any
      ;({ error } = await supabase.from('pickup_stores').update(rest as any).eq('id', id))
    } else {
      ;({ error } = await supabase.from('pickup_stores').insert(form as any))
    }
    if (error) { showMsg('Erro ao salvar'); return }
    setModal(false)
    setForm(VAZIO)
    carregar()
    showMsg('Loja salva!')
  }

  async function excluir(id: string) {
    if (!confirm('Remover esta loja?')) return
    await supabase.from('pickup_stores').delete().eq('id', id)
    setLojas(prev => prev.filter(l => l.id !== id))
    showMsg('Removida!')
  }

  async function toggleHabilitado(loja: Loja) {
    await supabase.from('pickup_stores').update({ habilitado: !loja.habilitado } as any).eq('id', loja.id!)
    setLojas(prev => prev.map(l => l.id === loja.id ? { ...l, habilitado: !l.habilitado } : l))
  }

  function abrirNova() {
    setForm({ ...VAZIO, nome: 'OUTLET TASCHIBRA', telefone: '(47) 3281-7640', endereco: 'Rodovia BR 470 KM 65,931, n 2135', cep: '89085-144' })
    setModal(true)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Retirada na Loja</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
          <button onClick={abrirNova}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors">
            <Plus size={14} /> Nova Loja
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : lojas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MapPin size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma loja cadastrada.</p>
          <p className="text-xs mt-1">Clique em Nova Loja para adicionar um ponto de retirada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lojas.map(loja => (
            <div key={loja.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-gray-800">{loja.nome}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${loja.habilitado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {loja.habilitado ? 'Habilitado' : 'Desabilitado'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{loja.endereco}, {loja.cidade}/{loja.estado} — CEP {loja.cep}</p>
                  {loja.telefone && <p className="text-sm text-gray-500 mt-1">{loja.telefone}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Prazo: {loja.prazo_dias} dia{loja.prazo_dias !== 1 ? 's' : ''} util{loja.prazo_dias !== 1 ? 'eis' : ''}</span>
                    <span>Valor: {Number(loja.valor) === 0 ? 'Gratis' : `R$ ${Number(loja.valor).toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleHabilitado(loja)}
                    className="text-xs font-bold text-gray-500 hover:text-green-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                    {loja.habilitado ? 'Desabilitar' : 'Habilitar'}
                  </button>
                  <button onClick={() => { setForm({ ...loja }); setModal(true) }}
                    className="text-blue-500 hover:text-blue-700 p-1"><Edit2 size={15} /></button>
                  <button onClick={() => excluir(loja.id!)}
                    className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{form.id ? 'Editar Loja' : 'Nova Loja'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Nome *</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Telefone</label>
                  <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">CEP</label>
                  <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Endereco *</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Cidade</label>
                  <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Estado</label>
                  <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Prazo (dias uteis)</label>
                  <input type="number" min={1} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.prazo_dias} onChange={e => setForm({ ...form, prazo_dias: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Valor (0 = gratis)</label>
                  <input type="number" min={0} step={0.01} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.valor} onChange={e => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={!form.nome.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {form.id ? 'Salvar' : 'Criar Loja'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
