'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, Edit2, X, Star } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Beneficio {
  id?: string
  icon: string
  texto: string
  active: boolean
  sort_order: number
}

const VAZIO: Beneficio = { icon: '✅', texto: '', active: true, sort_order: 0 }

export default function BenefitBarTab() {
  const [itens, setItens] = useState<Beneficio[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Beneficio>(VAZIO)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('benefit_bar').select('*').order('sort_order')
    setItens((data || []) as Beneficio[])
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 2500) }

  async function salvar() {
    if (!form.texto.trim()) return
    let error
    if (form.id) {
      const { id, ...rest } = form as any
      ;({ error } = await supabase.from('benefit_bar').update(rest as any).eq('id', id))
    } else {
      ;({ error } = await supabase.from('benefit_bar').insert({ ...form, sort_order: itens.length + 1 } as any))
    }
    if (error) { showMsg('Erro ao salvar'); return }
    setModal(false)
    setForm(VAZIO)
    carregar()
    showMsg('Salvo!')
  }

  async function excluir(id: string) {
    if (!confirm('Remover este benefício?')) return
    await supabase.from('benefit_bar').delete().eq('id', id)
    setItens(prev => prev.filter(x => x.id !== id))
    showMsg('Removido!')
  }

  async function toggleAtivo(item: Beneficio) {
    await supabase.from('benefit_bar').update({ active: !item.active } as any).eq('id', item.id!)
    setItens(prev => prev.map(x => x.id === item.id ? { ...x, active: !x.active } : x))
  }

  const EMOJIS = ['🚚','💳','🔒','🏭','🎁','⭐','✅','🛡️','💰','📦','🔧','🌟','🎯','💡','🏆']

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Barra de Benefícios</h1>
          <p className="text-xs text-gray-400 mt-1">Itens exibidos na faixa abaixo do carrossel principal da loja.</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
          <button onClick={() => { setForm({ ...VAZIO, sort_order: itens.length + 1 }); setModal(true) }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2.5 rounded-lg">
            <Plus size={14} /> Novo Item
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Preview da barra</p>
        <div className="flex flex-wrap gap-4">
          {itens.filter(x => x.active).map(x => (
            <div key={x.id} className="flex items-center gap-2 text-sm text-gray-700">
              <span>{x.icon}</span>
              <span>{x.texto}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Ícone</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Texto</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ordem</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4 text-2xl">{item.icon}</td>
                  <td className="px-5 py-4 font-bold text-gray-800">{item.texto}</td>
                  <td className="px-5 py-4 text-center text-gray-500">{item.sort_order}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(item)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${item.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                      {item.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm({ ...item }); setModal(true) }}
                        className="text-blue-500 hover:text-blue-700"><Edit2 size={14} /></button>
                      <button onClick={() => excluir(item.id!)}
                        className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{form.id ? 'Editar Item' : 'Novo Item'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Ícone (emoji)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm({ ...form, icon: e })}
                      className={`text-xl w-9 h-9 rounded-lg border-2 transition-all ${form.icon === e ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {e}
                    </button>
                  ))}
                </div>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="Ou cole qualquer emoji" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Texto *</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.texto} onChange={e => setForm({ ...form, texto: e.target.value })}
                  placeholder="Ex: Enviamos para todo o Brasil" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Ordem</label>
                  <input type="number" min={0}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4 accent-green-600" />
                    <span className="text-sm font-bold text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={!form.texto.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg">
                {form.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
