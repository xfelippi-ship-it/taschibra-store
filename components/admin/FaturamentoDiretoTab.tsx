'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit2, X } from 'lucide-react'

interface FatDireto {
  id?: string
  nome: string
  descricao: string
  valor_minimo: number
  max_parcelas: number
  padrao: boolean
  ordem: number
  ativo: boolean
}

const VAZIO: FatDireto = { nome: '', descricao: '', valor_minimo: 0, max_parcelas: 1, padrao: false, ordem: 0, ativo: true }

export default function FaturamentoDiretoTab() {
  const [itens, setItens] = useState<FatDireto[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<FatDireto>(VAZIO)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('direct_billing').select('*').order('ordem')
    setItens((data || []) as any)
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 2500) }

  async function salvar() {
    if (!form.nome.trim()) return
    let error
    if (form.id) {
      const { id, ...rest } = form as any
      ;({ error } = await supabase.from('direct_billing').update(rest as any).eq('id', id))
    } else {
      ;({ error } = await supabase.from('direct_billing').insert({ ...form, ordem: itens.length } as any))
    }
    if (error) { showMsg('Erro ao salvar'); return }
    setModal(false)
    setForm(VAZIO)
    carregar()
    showMsg('Salvo!')
  }

  async function excluir(id: string) {
    if (!confirm('Remover este metodo?')) return
    await supabase.from('direct_billing').delete().eq('id', id)
    setItens(prev => prev.filter(x => x.id !== id))
    showMsg('Removido!')
  }

  async function toggleAtivo(item: FatDireto) {
    await supabase.from('direct_billing').update({ ativo: !item.ativo } as any).eq('id', item.id!)
    setItens(prev => prev.map(x => x.id === item.id ? { ...x, ativo: !x.ativo } : x))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Faturamento Direto</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
          <button onClick={() => { setForm(VAZIO); setModal(true) }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors">
            <Plus size={14} /> Novo Metodo
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">Metodos de pagamento direto para clientes B2B (PIX com CNPJ, boleto faturado, etc).</p>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Nenhum metodo cadastrado.</p>
          <p className="text-xs mt-1">Adicione metodos de pagamento direto para clientes B2B.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Valor Min.</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Parcelas</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-black text-gray-800">{item.nome}</p>
                    {item.descricao && <p className="text-xs text-gray-400">{item.descricao}</p>}
                    {item.padrao && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Padrao</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-600">R$ {Number(item.valor_minimo).toFixed(2)}</td>
                  <td className="px-5 py-4 text-center text-gray-600">{item.max_parcelas}x</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(item)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${item.ativo ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{form.id ? 'Editar Metodo' : 'Novo Metodo'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Nome *</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: PIX CNPJ Taschibra" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Descricao</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Chave PIX: 83475913000191" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Valor Minimo (R$)</label>
                  <input type="number" min={0} step={0.01}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.valor_minimo} onChange={e => setForm({ ...form, valor_minimo: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Max Parcelas</label>
                  <input type="number" min={1}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.max_parcelas} onChange={e => setForm({ ...form, max_parcelas: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.padrao}
                  onChange={e => setForm({ ...form, padrao: e.target.checked })}
                  className="w-4 h-4 accent-green-600" />
                <span className="text-sm font-bold text-gray-700">Definir como metodo padrao</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={!form.nome.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {form.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
