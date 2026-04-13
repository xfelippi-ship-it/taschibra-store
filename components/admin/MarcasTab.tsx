'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface Brand {
  id?: string
  nome: string
  slug: string
  ativo: boolean | null
}

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function MarcasTab() {
  const [marcas, setMarcas] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [novo, setNovo] = useState({ nome: '', slug: '', ativo: true })
  const [editando, setEditando] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('brands').select('*').order('nome')
    setMarcas((data || []) as any)
    setLoading(false)
  }

  function showMsg(texto: string) {
    setMsg(texto)
    setTimeout(() => setMsg(null), 2500)
  }

  async function criar() {
    if (!novo.nome.trim()) return
    const brand = { ...novo, slug: novo.slug || slugify(novo.nome) }
    const { data, error } = await supabase.from('brands').insert(brand).select().single()
    if (error) { showMsg('Erro ao criar marca'); return }
    setMarcas(prev => [...prev, data])
    setNovo({ nome: '', slug: '', ativo: true })
    showMsg('Marca criada!')
  }

  async function atualizar(marca: Brand) {
    const { error } = await supabase.from('brands')
      .update({ nome: marca.nome, slug: marca.slug, ativo: marca.ativo })
      .eq('id', marca.id!)
    if (error) { showMsg('Erro ao atualizar'); return }
    setEditando(null)
    showMsg('Marca atualizada!')
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta marca?')) return
    await supabase.from('brands').delete().eq('id', id)
    setMarcas(prev => prev.filter(m => m.id !== id))
    showMsg('Marca removida!')
  }

  async function toggleAtivo(marca: Brand) {
    await supabase.from('brands').update({ ativo: !marca.ativo }).eq('id', marca.id!)
    setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, ativo: !m.ativo } : m))
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Marcas</h1>
        {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
      </div>

      {/* Formulário novo */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Nova Marca</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Nome *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={novo.nome}
              onChange={e => setNovo({ ...novo, nome: e.target.value, slug: slugify(e.target.value) })}
              placeholder="Ex: Taschibra"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Slug</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono"
              value={novo.slug}
              onChange={e => setNovo({ ...novo, slug: e.target.value })}
              placeholder="taschibra"
            />
          </div>
        </div>
        <button onClick={criar} disabled={!novo.nome.trim()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={14} /> Adicionar Marca
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Marca</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Slug</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {marcas.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhuma marca cadastrada.</td></tr>
              ) : marcas.map(m => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    {editando === m.id ? (
                      <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500 w-full"
                        value={m.nome}
                        onChange={e => setMarcas(prev => prev.map(x => x.id === m.id ? { ...x, nome: e.target.value } : x))} />
                    ) : (
                      <span className="font-black text-gray-800">{m.nome}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editando === m.id ? (
                      <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500 font-mono w-full"
                        value={m.slug}
                        onChange={e => setMarcas(prev => prev.map(x => x.id === m.id ? { ...x, slug: e.target.value } : x))} />
                    ) : (
                      <span className="text-sm text-gray-500 font-mono">{m.slug}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(m)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                        m.ativo ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                      }`}>
                      {m.ativo ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editando === m.id ? (
                        <>
                          <button onClick={() => atualizar(m)} className="text-green-600 hover:text-green-800"><Check size={15} /></button>
                          <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditando(m.id!)} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                          <button onClick={() => excluir(m.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
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
