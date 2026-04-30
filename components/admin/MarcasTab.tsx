'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react'

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
  const [bulkMarcaId, setBulkMarcaId] = useState<string>('')
  const [bulkProdutos, setBulkProdutos] = useState<{id:string,nome:string,sku:string,brand_id:string|null}[]>([])
  const [bulkSelecionados, setBulkSelecionados] = useState<Set<string>>(new Set())
  const [bulkBusca, setBulkBusca] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSalvando, setBulkSalvando] = useState(false)
  const [bulkAberto, setBulkAberto] = useState(false)

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

  async function carregarProdutosBulk() {
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/produtos-bulk')
      const json = await res.json()
      setBulkProdutos(json.data || [])
    } catch {
      setBulkProdutos([])
    }
    setBulkLoading(false)
  }

  async function aplicarBulk() {
    if (!bulkMarcaId || bulkSelecionados.size === 0) return
    setBulkSalvando(true)
    const ids = Array.from(bulkSelecionados)
    try {
      await fetch('/api/admin/produtos-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: bulkMarcaId, product_ids: ids })
      })
      setBulkProdutos(prev => prev.map(p => bulkSelecionados.has(p.id) ? { ...p, brand_id: bulkMarcaId } : p))
      setBulkSelecionados(new Set())
      showMsg(`Marca aplicada em ${ids.length} produto(s)!`)
    } catch {
      showMsg('Erro ao aplicar marca')
    }
    setBulkSalvando(false)
  }

  function toggleSelecionado(id: string) {
    setBulkSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selecionarTodosFiltrados() {
    const filtrados = bulkProdutosFiltrados.map(p => p.id)
    const todosSelecionados = filtrados.every(id => bulkSelecionados.has(id))
    setBulkSelecionados(prev => {
      const next = new Set(prev)
      if (todosSelecionados) { filtrados.forEach(id => next.delete(id)) }
      else { filtrados.forEach(id => next.add(id)) }
      return next
    })
  }

  const bulkProdutosFiltrados = bulkProdutos.filter(p =>
    p.nome.toLowerCase().includes(bulkBusca.toLowerCase()) ||
    p.sku?.toLowerCase().includes(bulkBusca.toLowerCase())
  )

  async function toggleAtivo(marca: Brand) {
    await supabase.from('brands').update({ ativo: !marca.ativo }).eq('id', marca.id!)
    setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, ativo: !m.ativo } : m))
  }

  return (
    <div className="max-w-4xl">
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

      {/* Bulk */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
        <button
          onClick={() => { setBulkAberto(!bulkAberto); if (!bulkAberto && bulkProdutos.length === 0) carregarProdutosBulk() }}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-green-600" />
            <span className="font-black text-gray-800 text-sm">Atribuir marca em massa</span>
            <span className="text-xs text-gray-400 font-normal">Selecione produtos e aplique uma marca de uma vez</span>
          </div>
          <span className="text-gray-400 text-xs">{bulkAberto ? '▲' : '▼'}</span>
        </button>
        {bulkAberto && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Marca a aplicar</label>
                <select value={bulkMarcaId} onChange={e => setBulkMarcaId(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 min-w-48">
                  <option value="">Selecione a marca...</option>
                  {marcas.filter(m => m.ativo).map(m => (
                    <option key={m.id} value={m.id!}>{m.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="text-xs font-bold text-gray-600 mb-1 block">Buscar produto</label>
                <input value={bulkBusca} onChange={e => setBulkBusca(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  placeholder="Nome ou SKU..." />
              </div>
              <button onClick={aplicarBulk}
                disabled={!bulkMarcaId || bulkSelecionados.size === 0 || bulkSalvando}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-black text-sm px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
                <Check size={14} />
                {bulkSalvando ? 'Aplicando...' : `Aplicar em ${bulkSelecionados.size} produto(s)`}
              </button>
            </div>
            {bulkLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Carregando produtos...</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-3">
                  <input type="checkbox"
                    checked={bulkProdutosFiltrados.length > 0 && bulkProdutosFiltrados.every(p => bulkSelecionados.has(p.id))}
                    onChange={selecionarTodosFiltrados}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-xs font-black text-gray-500 uppercase">
                    {bulkProdutosFiltrados.length} produto(s) — {bulkSelecionados.size} selecionado(s)
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {bulkProdutosFiltrados.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Nenhum produto encontrado.</p>
                  ) : bulkProdutosFiltrados.map(p => {
                    const marcaAtual = marcas.find(m => m.id === p.brand_id)
                    return (
                      <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                        <input type="checkbox" checked={bulkSelecionados.has(p.id)} onChange={() => toggleSelecionado(p.id)}
                          className="w-4 h-4 accent-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{p.nome}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                        </div>
                        {marcaAtual && (
                          <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">{marcaAtual.nome}</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  </div>
  )
}