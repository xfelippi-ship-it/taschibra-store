'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X, ChevronRight, ChevronDown, Eye, EyeOff, GripVertical, Tag } from 'lucide-react'

type Categoria = {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  sort_order: number
  active: boolean
  show_in_menu: boolean
  icon_svg: string | null
  created_at: string
  subs?: SubCat[]
}

type SubCat = {
  id: string
  category_slug: string
  label: string
  slug: string
  sort_order: number
}

function gerarSlug(nome: string) {
  return nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"

export default function CategoriasTab() {
  const [cats, setCats] = useState<Categoria[]>([])
  const [subcats, setSubcats] = useState<Record<string, SubCat[]>>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [msg, setMsg] = useState<string | null>(null)

  // Modal categoria
  const [modalCat, setModalCat] = useState(false)
  const [editCat, setEditCat] = useState<Partial<Categoria>>({})
  const [isNew, setIsNew] = useState(false)

  // Modal subcategoria
  const [modalSub, setModalSub] = useState(false)
  const [editSub, setEditSub] = useState<Partial<SubCat>>({})
  const [subParentSlug, setSubParentSlug] = useState('')
  const [isNewSub, setIsNewSub] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const [{ data: catsData }, { data: subsData }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order').order('name'),
      supabase.from('category_subcategories').select('*').order('sort_order'),
    ])
    setCats(catsData || [])
    const grouped: Record<string, SubCat[]> = {}
    for (const s of (subsData || [])) {
      if (!grouped[s.category_slug]) grouped[s.category_slug] = []
      grouped[s.category_slug].push(s)
    }
    setSubcats(grouped)
    setLoading(false)
  }

  function toast(m: string) { setMsg(m); setTimeout(() => setMsg(null), 3000) }

  function abrirNovaCat(parentId?: string) {
    setEditCat({ parent_id: parentId || null, active: true, show_in_menu: true, sort_order: cats.length + 1 })
    setIsNew(true)
    setModalCat(true)
  }

  function abrirEditCat(cat: Categoria) {
    setEditCat({ ...cat })
    setIsNew(false)
    setModalCat(true)
  }

  async function salvarCat() {
    if (!editCat.name) return
    const slug = editCat.slug || gerarSlug(editCat.name)
    const { subs: _subs, ...editSemSubs } = editCat as any
    const dados = { ...editSemSubs, slug, updated_at: new Date().toISOString() }
    if (isNew) {
      const { error } = await supabase.from('categories').insert(dados as any)
      if (error) { toast('Erro: ' + error.message); return }
      toast('Categoria criada!')
    } else {
      const { error } = await supabase.from('categories').update(dados as any).eq('id', editCat.id!)
      if (error) { toast('Erro: ' + error.message); return }
      toast('Categoria salva!')
    }
    setModalCat(false)
    carregar()
  }

  async function excluirCat(cat: Categoria) {
    if (!confirm(`Excluir "${cat.name}"? Subcategorias e produtos desta categoria serão afetados.`)) return
    await supabase.from('category_subcategories').delete().eq('category_slug', cat.slug)
    await supabase.from('categories').delete().eq('id', cat.id)
    toast('Categoria excluída.')
    carregar()
  }

  async function toggleMenu(cat: Categoria) {
    await supabase.from('categories').update({ show_in_menu: !cat.show_in_menu }).eq('id', cat.id)
    setCats(prev => prev.map(c => c.id === cat.id ? { ...c, show_in_menu: !c.show_in_menu } : c))
  }

  async function toggleAtivo(cat: Categoria) {
    await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id)
    setCats(prev => prev.map(c => c.id === cat.id ? { ...c, active: !c.active } : c))
  }

  async function moverCat(cat: Categoria, dir: 'up' | 'down') {
    const lista = cats.filter(c => c.parent_id === cat.parent_id)
    const idx = lista.findIndex(c => c.id === cat.id)
    const outro = dir === 'up' ? lista[idx - 1] : lista[idx + 1]
    if (!outro) return
    await Promise.all([
      supabase.from('categories').update({ sort_order: outro.sort_order }).eq('id', cat.id),
      supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', outro.id),
    ])
    carregar()
  }

  // Subcategorias
  function abrirNovaSub(categorySlug: string) {
    const subs = subcats[categorySlug] || []
    setEditSub({ category_slug: categorySlug, sort_order: subs.length + 1 })
    setSubParentSlug(categorySlug)
    setIsNewSub(true)
    setModalSub(true)
  }

  function abrirEditSub(sub: SubCat) {
    setEditSub({ ...sub })
    setSubParentSlug(sub.category_slug)
    setIsNewSub(false)
    setModalSub(true)
  }

  async function salvarSub() {
    if (!editSub.label) return
    const slug = editSub.slug || gerarSlug(editSub.label)
    const dados = { ...editSub, slug }
    if (isNewSub) {
      await supabase.from('category_subcategories').insert(dados as any)
      toast('Subcategoria criada!')
    } else {
      await supabase.from('category_subcategories').update(dados).eq('id', editSub.id!)
      toast('Subcategoria salva!')
    }
    setModalSub(false)
    carregar()
  }

  async function excluirSub(sub: SubCat) {
    if (!confirm(`Excluir subcategoria "${sub.label}"?`)) return
    await supabase.from('category_subcategories').delete().eq('id', sub.id)
    toast('Subcategoria excluída.')
    carregar()
  }

  async function moverSub(sub: SubCat, dir: 'up' | 'down') {
    const lista = subcats[sub.category_slug] || []
    const idx = lista.findIndex(s => s.id === sub.id)
    const outro = dir === 'up' ? lista[idx - 1] : lista[idx + 1]
    if (!outro) return
    await Promise.all([
      supabase.from('category_subcategories').update({ sort_order: outro.sort_order }).eq('id', sub.id),
      supabase.from('category_subcategories').update({ sort_order: sub.sort_order }).eq('id', outro.id),
    ])
    carregar()
  }

  const catsPai = cats.filter(c => !c.parent_id)

  return (
    <div>
      {msg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg">{msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Categorias</h1>
          <p className="text-xs text-gray-400 mt-0.5">{catsPai.length} categorias principais · {Object.values(subcats).flat().length} subcategorias</p>
        </div>
        <button onClick={() => abrirNovaCat()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={15} /> Nova Categoria
        </button>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><Eye size={12} className="text-green-600" /> Visível no menu</span>
        <span className="flex items-center gap-1.5"><EyeOff size={12} className="text-gray-400" /> Oculto do menu</span>
        <span className="flex items-center gap-1.5"><Tag size={12} className="text-blue-500" /> Subcategoria (dropdown)</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="space-y-3">
          {catsPai.map((cat, idx) => {
            const subs = subcats[cat.slug] || []
            const isOpen = expanded.has(cat.id)
            return (
              <div key={cat.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${cat.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                {/* Linha principal */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Expandir */}
                  <button onClick={() => {
                    const n = new Set(expanded)
                    isOpen ? n.delete(cat.id) : n.add(cat.id)
                    setExpanded(n)
                  }} className="text-gray-400 hover:text-green-600 transition-colors w-5">
                    {subs.length > 0 ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span className="w-4 inline-block" />}
                  </button>

                  {/* Ordem */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moverCat(cat, 'up')} disabled={idx === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▲</button>
                    <button onClick={() => moverCat(cat, 'down')} disabled={idx === catsPai.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▼</button>
                  </div>

                  {/* Nome e slug */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800">{cat.name}</span>
                      {subs.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">{subs.length} subs</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleMenu(cat)} title={cat.show_in_menu ? 'Ocultar do menu' : 'Mostrar no menu'}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${cat.show_in_menu ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {cat.show_in_menu ? <Eye size={11} /> : <EyeOff size={11} />}
                      {cat.show_in_menu ? 'No menu' : 'Oculto'}
                    </button>
                    <button onClick={() => toggleAtivo(cat)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${cat.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                      {cat.active ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => abrirNovaSub(cat.slug)} title="Adicionar subcategoria"
                      className="text-blue-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors">
                      <Tag size={14} />
                    </button>
                    <button onClick={() => abrirEditCat(cat)}
                      className="text-gray-400 hover:text-green-600 p-1.5 rounded hover:bg-gray-50 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => excluirCat(cat)}
                      className="text-gray-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subcategorias */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wide">Subcategorias (dropdown)</span>
                      <button onClick={() => abrirNovaSub(cat.slug)}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
                        <Plus size={11} /> Adicionar
                      </button>
                    </div>
                    {subs.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Nenhuma subcategoria. Esta categoria aparece sem dropdown.</p>
                    ) : (
                      <div className="space-y-1">
                        {subs.map((sub, sidx) => (
                          <div key={sub.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <div className="flex flex-col gap-0">
                              <button onClick={() => moverSub(sub, 'up')} disabled={sidx === 0}
                                className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs leading-none">▲</button>
                              <button onClick={() => moverSub(sub, 'down')} disabled={sidx === subs.length - 1}
                                className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs leading-none">▼</button>
                            </div>
                            <span className="text-xs text-gray-400 w-4 text-center font-bold">{sidx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-gray-700">{sub.label}</span>
                              <span className="text-xs text-gray-400 font-mono ml-2">[{sub.slug}]</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => abrirEditSub(sub)}
                                className="text-gray-400 hover:text-green-600 p-1 rounded hover:bg-gray-50">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => excluirSub(sub)}
                                className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal Categoria ─────────────────────────────────────── */}
      {modalCat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{isNew ? 'Nova Categoria' : 'Editar Categoria'}</h2>
              <button onClick={() => setModalCat(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nome *</label>
                <input value={editCat.name || ''} onChange={e => setEditCat(p => ({ ...p, name: e.target.value, slug: gerarSlug(e.target.value) }))}
                  placeholder="Ex: Ambientes" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Slug (URL)</label>
                <input value={editCat.slug || ''} onChange={e => setEditCat(p => ({ ...p, slug: e.target.value }))}
                  placeholder="gerado-automaticamente" className={inputCls + ' font-mono text-xs'} />
                <p className="text-xs text-gray-400 mt-1">URL: /produtos?categoria=<strong>{editCat.slug || 'slug'}</strong></p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Descrição (opcional)</label>
                <textarea value={editCat.description || ''} onChange={e => setEditCat(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Descrição curta da categoria" className={inputCls + ' resize-none'} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Ordem</label>
                <input type="number" value={editCat.sort_order || 1} onChange={e => setEditCat(p => ({ ...p, sort_order: parseInt(e.target.value) }))}
                  className={inputCls + ' w-24'} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editCat.active ?? true} onChange={e => setEditCat(p => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-bold text-gray-700">Categoria ativa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editCat.show_in_menu ?? true} onChange={e => setEditCat(p => ({ ...p, show_in_menu: e.target.checked }))}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-bold text-gray-700">Mostrar no menu</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalCat(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvarCat} disabled={!editCat.name}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {isNew ? 'Criar categoria' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Subcategoria ──────────────────────────────────── */}
      {modalSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-gray-800">{isNewSub ? 'Nova Subcategoria' : 'Editar Subcategoria'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Categoria: <strong>{subParentSlug}</strong></p>
              </div>
              <button onClick={() => setModalSub(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Label (nome visível) *</label>
                <input value={editSub.label || ''} onChange={e => setEditSub(p => ({ ...p, label: e.target.value, slug: gerarSlug(e.target.value) }))}
                  placeholder="Ex: Fita LED" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Slug (URL)</label>
                <input value={editSub.slug || ''} onChange={e => setEditSub(p => ({ ...p, slug: e.target.value }))}
                  placeholder="gerado-automaticamente" className={inputCls + ' font-mono text-xs'} />
                <p className="text-xs text-gray-400 mt-1">URL: /produtos?categoria=<strong>{editSub.slug || 'slug'}</strong></p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Ordem</label>
                <input type="number" value={editSub.sort_order || 1} onChange={e => setEditSub(p => ({ ...p, sort_order: parseInt(e.target.value) }))}
                  className={inputCls + ' w-24'} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalSub(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvarSub} disabled={!editSub.label}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {isNewSub ? 'Criar subcategoria' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
