'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react'

interface GalleryItem {
  id?: string
  titulo: string
  url_imagem: string
  url_link: string
  ordem: number
  ativo: boolean
}

export default function GaleriaTab() {
  const [itens, setItens] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novo, setNovo] = useState<GalleryItem>({ titulo: '', url_imagem: '', url_link: '', ordem: 0, ativo: true })
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('image_gallery').select('*').order('ordem')
    setItens((data || []) as any)
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 2500) }

  async function criar() {
    if (!novo.url_imagem.trim()) return
    const { data, error } = await supabase.from('image_gallery').insert({ ...novo, ordem: itens.length } as any).select().single()
    if (error) { showMsg('Erro ao criar'); return }
    setItens(prev => [...prev, data as any])
    setNovo({ titulo: '', url_imagem: '', url_link: '', ordem: 0, ativo: true })
    showMsg('Imagem adicionada!')
  }

  async function atualizar(item: GalleryItem) {
    await supabase.from('image_gallery').update({ titulo: item.titulo, url_imagem: item.url_imagem, url_link: item.url_link, ativo: item.ativo, updated_at: new Date().toISOString() } as any).eq('id', item.id!)
    setItens(prev => prev.map(x => x.id === item.id ? item : x))
    setEditandoId(null)
    showMsg('Atualizado!')
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta imagem?')) return
    await supabase.from('image_gallery').delete().eq('id', id)
    setItens(prev => prev.filter(x => x.id !== id))
    showMsg('Removido!')
  }

  async function toggleAtivo(item: GalleryItem) {
    await supabase.from('image_gallery').update({ ativo: !item.ativo } as any).eq('id', item.id!)
    setItens(prev => prev.map(x => x.id === item.id ? { ...x, ativo: !x.ativo } : x))
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-gray-800">Galeria de Imagens</h1>
        {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
      </div>
      <p className="text-sm text-gray-500 mb-5">Imagens exibidas em blocos visuais na home da loja.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Nova Imagem</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Titulo</label>
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={novo.titulo} onChange={e => setNovo({ ...novo, titulo: e.target.value })}
              placeholder="Ex: Banner Lancamentos" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">URL do Link</label>
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={novo.url_link} onChange={e => setNovo({ ...novo, url_link: e.target.value })}
              placeholder="Ex: /lancamentos" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-600 mb-1 block">URL da Imagem *</label>
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={novo.url_imagem} onChange={e => setNovo({ ...novo, url_imagem: e.target.value })}
              placeholder="https://... ou /images/banner.jpg" />
          </div>
        </div>
        {novo.url_imagem && (
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 mb-1">Preview:</p>
            <img src={novo.url_imagem} alt="preview" className="h-24 rounded-lg object-cover border border-gray-200"
              onError={e => (e.currentTarget.style.display = 'none')} />
          </div>
        )}
        <button onClick={criar} disabled={!novo.url_imagem.trim()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={14} /> Adicionar Imagem
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhuma imagem cadastrada ainda.</div>
      ) : (
        <div className="space-y-3">
          {itens.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {editandoId === item.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Titulo</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        value={item.titulo}
                        onChange={e => setItens(prev => prev.map(x => x.id === item.id ? { ...x, titulo: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Link</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        value={item.url_link}
                        onChange={e => setItens(prev => prev.map(x => x.id === item.id ? { ...x, url_link: e.target.value } : x))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-600 mb-1 block">URL Imagem</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        value={item.url_imagem}
                        onChange={e => setItens(prev => prev.map(x => x.id === item.id ? { ...x, url_imagem: e.target.value } : x))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => atualizar(item)}
                      className="flex items-center gap-1 bg-green-600 text-white font-black text-xs px-4 py-2 rounded-lg">
                      <Check size={13} /> Salvar
                    </button>
                    <button onClick={() => setEditandoId(null)}
                      className="text-xs text-gray-500 border border-gray-200 px-4 py-2 rounded-lg">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                  <img src={item.url_imagem} alt={item.titulo}
                    className="w-20 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 text-sm truncate">{item.titulo || '(sem titulo)'}</p>
                    {item.url_link && <p className="text-xs text-gray-400 truncate">{item.url_link}</p>}
                  </div>
                  <button onClick={() => toggleAtivo(item)}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors flex-shrink-0 ${item.ativo ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditandoId(item.id!)} className="text-blue-500 hover:text-blue-700"><Edit2 size={15} /></button>
                    <button onClick={() => excluir(item.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
