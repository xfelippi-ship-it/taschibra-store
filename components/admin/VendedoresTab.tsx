/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Vendedor = { id?: string; code: string; name: string; active: boolean }
const vazio: Vendedor = { code: '', name: '', active: true }

export default function VendedoresTab() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editando, setEditando]     = useState<Vendedor>(vazio)
  const [salvando, setSalvando]     = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('sellers').select('*').order('name')
    setVendedores(data || [])
    setLoading(false)
  }

  async function salvar() {
    if (!editando.code || !editando.name) return
    setSalvando(true)
    const dados = {
      code:   editando.code.toUpperCase().trim(),
      name:   editando.name.trim(),
      active: editando.active,
      updated_at: new Date().toISOString()
    }
    if (editando.id) {
      await supabase.from('sellers').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('sellers').insert(dados)
    }
    setSalvando(false)
    setModal(false)
    setEditando(vazio)
    carregar()
  }

  async function toggleAtivo(v: Vendedor) {
    await supabase.from('sellers').update({ active: !v.active }).eq('id', v.id)
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este vendedor?')) return
    await supabase.from('sellers').delete().eq('id', id)
    carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Código de Vendedor</h1>
          <p className="text-xs text-gray-400 mt-0.5">Vincula pedidos a vendedores da equipe comercial</p>
        </div>
        <button onClick={() => { setEditando(vazio); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Vendedor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : vendedores.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-semibold">Nenhum vendedor cadastrado.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Código</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Nome</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v, i) => (
                <tr key={v.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-5 py-4">
                    <span className="font-mono font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-sm">{v.code}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-sm text-gray-800">{v.name}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(v)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${v.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                      {v.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setEditando(v); setModal(true) }} className="text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                      <button onClick={() => excluir(v.id!)} className="text-red-300 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{editando.id ? 'Editar Vendedor' : 'Novo Vendedor'}</h2>
              <button onClick={() => { setModal(false); setEditando(vazio) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Código *</label>
                <input value={editando.code} onChange={e => setEditando({ ...editando, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: ANDERSON"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono uppercase" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nome *</label>
                <input value={editando.name} onChange={e => setEditando({ ...editando, name: e.target.value })}
                  placeholder="Ex: Anderson Silva"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700">Vendedor ativo</p>
                <button type="button" onClick={() => setEditando({ ...editando, active: !editando.active })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${editando.active ? 'bg-green-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editando.active ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setEditando(vazio) }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={salvando || !editando.code || !editando.name}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {salvando ? 'Salvando...' : editando.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
