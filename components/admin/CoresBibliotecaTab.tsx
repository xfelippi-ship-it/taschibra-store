'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Cor {
  id?: string
  nome: string
  hex: string
  ativo: boolean
  sort_order: number
}

const vazio: Cor = { nome: '', hex: '#000000', ativo: true, sort_order: 0 }

export default function CoresBibliotecaTab() {
  const [cores, setCores] = useState<Cor[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novo, setNovo] = useState<Cor>(vazio)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('color_library').select('*').order('sort_order')
    setCores((data || []) as unknown as Cor[])
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000) }

  async function criar() {
    if (!novo.nome.trim()) return
    const { data, error } = await supabase.from('color_library')
      .insert({ nome: novo.nome, hex: novo.hex, ativo: novo.ativo, sort_order: cores.length + 1 })
      .select().single()
    if (error) { showMsg('Erro ao criar'); return }
    setCores(prev => [...prev, data as unknown as Cor])
    setNovo(vazio)
    showMsg('Cor adicionada!')
  }

  async function atualizar(cor: Cor) {
    await supabase.from('color_library')
      .update({ nome: cor.nome, hex: cor.hex, ativo: cor.ativo })
      .eq('id', cor.id!)
    setCores(prev => prev.map(x => x.id === cor.id ? cor : x))
    setEditandoId(null)
    showMsg('Atualizado!')
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta cor?')) return
    await supabase.from('color_library').delete().eq('id', id)
    setCores(prev => prev.filter(x => x.id !== id))
    showMsg('Removida!')
  }

  async function toggleAtivo(cor: Cor) {
    await supabase.from('color_library').update({ ativo: !cor.ativo }).eq('id', cor.id!)
    setCores(prev => prev.map(x => x.id === cor.id ? { ...x, ativo: !x.ativo } : x))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-gray-800">Biblioteca de Cores</h1>
        {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Cores usadas nas variações de produto. Quando o tipo da variação é "Cor", o cliente vê bolinhas coloridas na página do produto.
      </p>

      {/* Formulário novo */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Nova Cor</p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-600 mb-1 block">Nome</label>
            <input
              value={novo.nome}
              onChange={e => setNovo({ ...novo, nome: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && criar()}
              placeholder="Ex: Azul Royal"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Cor</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
              <input
                type="color"
                value={novo.hex}
                onChange={e => setNovo({ ...novo, hex: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 outline-none bg-transparent"
              />
              <input
                value={novo.hex}
                onChange={e => setNovo({ ...novo, hex: e.target.value })}
                placeholder="#000000"
                className="w-24 text-sm outline-none font-mono"
              />
            </div>
          </div>
          <button
            onClick={criar}
            disabled={!novo.nome.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Cor</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Hex</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cores.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma cor cadastrada.</td></tr>
              ) : cores.map(cor => (
                <tr key={cor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: cor.hex }}
                    />
                  </td>
                  <td className="px-5 py-4">
                    {editandoId === cor.id ? (
                      <input
                        value={cor.nome}
                        onChange={e => setCores(prev => prev.map(x => x.id === cor.id ? { ...x, nome: e.target.value } : x))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500 w-40"
                      />
                    ) : (
                      <span className="font-bold text-sm text-gray-800">{cor.nome}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editandoId === cor.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={cor.hex}
                          onChange={e => setCores(prev => prev.map(x => x.id === cor.id ? { ...x, hex: e.target.value } : x))}
                          className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                        />
                        <input
                          value={cor.hex}
                          onChange={e => setCores(prev => prev.map(x => x.id === cor.id ? { ...x, hex: e.target.value } : x))}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500 w-28 font-mono"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-gray-500">{cor.hex}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleAtivo(cor)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                        cor.ativo ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {cor.ativo ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editandoId === cor.id ? (
                        <>
                          <button onClick={() => atualizar(cor)} className="text-green-600 hover:text-green-800"><Check size={15} /></button>
                          <button onClick={() => { setEditandoId(null); carregar() }} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditandoId(cor.id!)} className="text-blue-500 hover:text-blue-700"><Edit2 size={15} /></button>
                          <button onClick={() => excluir(cor.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
