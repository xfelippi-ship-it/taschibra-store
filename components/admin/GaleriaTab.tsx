'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit2, Check, X, Upload, Eye, EyeOff, Image } from 'lucide-react'

interface GalleryItem {
  id?: string
  titulo: string
  subtitulo: string
  badge: string
  btn_label: string
  btn_href: string
  url_imagem: string
  url_link: string
  bg_color: string
  modo: string
  ordem: number
  ativo: boolean
  starts_at: string
  ends_at: string
}

const bgOpcoes = [
  { label: 'Verde Taschibra', value: 'from-green-900 via-green-700 to-green-800' },
  { label: 'Verde escuro',    value: 'from-green-950 via-green-900 to-green-800' },
  { label: 'Azul profundo',   value: 'from-blue-950 via-blue-800 to-blue-900' },
  { label: 'Azul petróleo',   value: 'from-cyan-950 via-cyan-800 to-blue-900' },
  { label: 'Roxo',            value: 'from-purple-950 via-purple-800 to-purple-900' },
  { label: 'Laranja',         value: 'from-orange-950 via-orange-800 to-amber-900' },
  { label: 'Vermelho',        value: 'from-red-950 via-red-800 to-red-900' },
  { label: 'Grafite',         value: 'from-gray-900 via-gray-700 to-gray-800' },
  { label: 'Preto',           value: 'from-zinc-950 via-zinc-900 to-zinc-800' },
]

const vazio: GalleryItem = {
  titulo: '', subtitulo: '', badge: '', btn_label: '', btn_href: '',
  url_imagem: '', url_link: '', bg_color: 'from-green-900 via-green-700 to-green-800',
  modo: 'imagem', ordem: 0, ativo: true, starts_at: '', ends_at: '',
}

function calcStatus(item: GalleryItem) {
  const now = new Date()
  if (!item.ativo) return { label: 'Inativo', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500' }
  if (item.starts_at && new Date(item.starts_at) > now) return { label: 'Agendado', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' }
  if (item.ends_at && new Date(item.ends_at) < now) return { label: 'Finalizado', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500' }
  return { label: 'Ativo', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700' }
}

function Preview({ item }: { item: GalleryItem }) {
  if (item.modo === 'imagem') {
    return (
      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100">
        {item.url_imagem
          ? <img src={item.url_imagem} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Image size={32} /></div>
        }
        {item.titulo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white font-black text-sm">{item.titulo}</p>
            {item.subtitulo && <p className="text-white/80 text-xs mt-0.5">{item.subtitulo}</p>}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className={`relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-r ${item.bg_color} flex items-center px-5`}>
      {item.url_imagem && <img src={item.url_imagem} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />}
      <div className="relative z-10 flex-1">
        {item.badge && <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full mb-1">{item.badge}</span>}
        <p className="text-white font-black text-sm leading-tight">{item.titulo || 'Título do bloco'}</p>
        {item.subtitulo && <p className="text-white/70 text-xs mt-0.5">{item.subtitulo}</p>}
        {item.btn_label && <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">{item.btn_label}</span>}
      </div>
    </div>
  )
}

export default function GaleriaTab() {
  const [itens, setItens] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [preview, setPreview] = useState(false)
  const [editando, setEditando] = useState<GalleryItem>(vazio)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('image_gallery' as any).select('*').order('ordem')
    setItens((data as any[] || []) as GalleryItem[])
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000) }

  async function uploadImagem(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const nome = `galeria/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('midias').upload(nome, file, { upsert: true })
    if (error) { showMsg('Erro no upload: ' + error.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('midias').getPublicUrl(data.path)
    setEditando(prev => ({ ...prev, url_imagem: urlData.publicUrl }))
    setUploading(false)
  }

  async function salvar() {
    const dados = {
      titulo: editando.titulo, subtitulo: editando.subtitulo, badge: editando.badge,
      btn_label: editando.btn_label, btn_href: editando.btn_href,
      url_imagem: editando.url_imagem, url_link: editando.url_link,
      bg_color: editando.bg_color, modo: editando.modo,
      ordem: Number(editando.ordem), ativo: editando.ativo,
      starts_at: editando.starts_at || null, ends_at: editando.ends_at || null,
    }
    if (editando.id) {
      await supabase.from('image_gallery').update(dados as any).eq('id', editando.id)
      showMsg('Atualizado!')
    } else {
      await supabase.from('image_gallery').insert(dados as any)
      showMsg('Bloco criado!')
    }
    setModal(false); setPreview(false); setEditando(vazio); carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este bloco?')) return
    await supabase.from('image_gallery').delete().eq('id', id)
    setItens(prev => prev.filter(x => x.id !== id))
    showMsg('Removido!')
  }

  async function toggleAtivo(item: GalleryItem) {
    await supabase.from('image_gallery').update({ ativo: !item.ativo } as any).eq('id', item.id!)
    setItens(prev => prev.map(x => x.id === item.id ? { ...x, ativo: !x.ativo } : x))
  }

  function set(k: keyof GalleryItem, v: unknown) {
    setEditando(prev => ({ ...prev, [k]: v }))
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-gray-800">Galeria de Imagens</h1>
        {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
        <button onClick={() => { setEditando(vazio); setPreview(false); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Bloco
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">Blocos visuais exibidos na home. Modo Imagem ou Texto+Cor com agendamento.</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Ordem</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Preview</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Modo</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : itens.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum bloco cadastrado.</td></tr>
            ) : itens.map(item => {
              const st = calcStatus(item)
              return (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-black text-sm flex items-center justify-center mx-auto">{item.ordem}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-48">
                      <Preview item={item} />
                      <p className="text-xs font-bold text-gray-700 mt-1 truncate">{item.titulo || '(sem título)'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.modo === 'texto' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {item.modo === 'texto' ? 'Texto + Cor' : 'Imagem'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(item)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${st.badge}`}>
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />{st.label}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditando(item); setPreview(false); setModal(true) }} className="text-blue-500 hover:text-blue-700"><Edit2 size={15} /></button>
                      <button onClick={() => excluir(item.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">{editando.id ? 'Editar Bloco' : 'Novo Bloco'}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(p => !p)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${preview ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  {preview ? <EyeOff size={13} /> : <Eye size={13} />} {preview ? 'Fechar' : 'Preview'}
                </button>
                <button onClick={() => { setModal(false); setPreview(false) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
            </div>

            {preview && (
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wide">Preview ao vivo</p>
                <Preview item={editando} />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Modo *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'imagem', label: '🖼 Imagem', desc: 'Upload ou URL (JPG / WebP / PNG)' },
                    { value: 'texto',  label: '🎨 Texto + Cor', desc: 'Fundo gradiente com título e botão' },
                  ].map(m => (
                    <button key={m.value} type="button" onClick={() => set('modo', m.value)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${editando.modo === m.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="font-black text-sm text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Título</label>
                  <input value={editando.titulo} onChange={e => set('titulo', e.target.value)}
                    placeholder="Ex: Linha SMART" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Link ao clicar</label>
                  <input value={editando.url_link} onChange={e => set('url_link', e.target.value)}
                    placeholder="Ex: /produtos?categoria=smart" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Subtítulo</label>
                <input value={editando.subtitulo} onChange={e => set('subtitulo', e.target.value)}
                  placeholder="Ex: Controle sua iluminação pelo celular" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">
                  {editando.modo === 'imagem' ? 'Imagem *' : 'Imagem de fundo (opcional)'}
                </label>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && uploadImagem(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl py-4 text-sm text-gray-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <Upload size={16} />
                    {uploading ? 'Enviando...' : 'Upload JPG / WebP / PNG — recomendado 1200×400px'}
                  </button>
                  {editando.url_imagem && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={editando.url_imagem} alt="preview" className="w-full h-24 object-cover" />
                      <button onClick={() => set('url_imagem', '')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  )}
                  <input value={editando.url_imagem} onChange={e => set('url_imagem', e.target.value)}
                    placeholder="Ou cole uma URL de imagem" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              {editando.modo === 'texto' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Badge / Etiqueta</label>
                      <input value={editando.badge} onChange={e => set('badge', e.target.value)}
                        placeholder="Ex: Novo" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Botão — Texto</label>
                      <input value={editando.btn_label} onChange={e => set('btn_label', e.target.value)}
                        placeholder="Ex: Ver produtos" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Cor de fundo</label>
                    <div className="grid grid-cols-3 gap-2">
                      {bgOpcoes.map(o => (
                        <button key={o.value} type="button" onClick={() => set('bg_color', o.value)}
                          className={`h-10 rounded-lg bg-gradient-to-r ${o.value} flex items-center justify-center text-white text-xs font-bold border-2 transition-all ${editando.bg_color === o.value ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                          {editando.bg_color === o.value ? '✓ ' : ''}{o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Ordem</label>
                  <input type="number" value={editando.ordem} onChange={e => set('ordem', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Data início</label>
                  <input type="datetime-local" value={editando.starts_at?.slice(0, 16) || ''}
                    onChange={e => set('starts_at', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Data fim</label>
                  <input type="datetime-local" value={editando.ends_at?.slice(0, 16) || ''}
                    onChange={e => set('ends_at', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="ativo" checked={editando.ativo} onChange={e => set('ativo', e.target.checked)}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="ativo" className="text-sm font-bold text-gray-700">Bloco ativo</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setPreview(false) }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={salvar}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors">
                {editando.id ? 'Salvar alterações' : 'Criar bloco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
