/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect, useRef } from 'react'
import { Pencil, X, Save, Upload, Palette, AlignLeft, Trash2 } from 'lucide-react'
import { registrarAuditoria } from '@/lib/auditLog'
import { supabase } from '@/lib/supabase'


type Categoria = {
  id: string
  name: string
  slug: string
  panel_image_url: string | null
  panel_bg_color: string | null
  panel_title: string | null
  panel_tagline: string | null
}

const COR_OPCOES = [
  { label: 'Verde Taschibra', value: '#1e7a3c' },
  { label: 'Verde escuro',    value: '#155c2c' },
  { label: 'Azul petróleo',   value: '#1e3a5f' },
  { label: 'Azul noite',      value: '#0a2a4a' },
  { label: 'Roxo',            value: '#4a1a6a' },
  { label: 'Laranja',         value: '#e67e22' },
  { label: 'Vermelho',        value: '#8a1a1a' },
  { label: 'Cinza escuro',    value: '#1a2a3a' },
  { label: 'Marrom',          value: '#3a1a0a' },
  { label: 'Preto',           value: '#111111' },
]

const ICONES: Record<string, string> = {
  'ambientes':      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
  'lampadas':       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="4"/><path d="M12 6a6 6 0 016 6c0 2.22-1.2 4.16-3 5.2V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1.8C7.2 16.16 6 14.22 6 12a6 6 0 016-6z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>',
  'smart':          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  'decorativo':     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
  'trilhos-perfis': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  'pilhas':         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="14" rx="1"/><line x1="10" y1="7" x2="10" y2="3"/><line x1="14" y1="7" x2="14" y2="3"/></svg>',
  'energia':        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>',
  'fechaduras':     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  'profissional':   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
  'outlet':         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  'lancamentos':    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
}

function getIcone(slug: string): string {
  return ICONES[slug] || '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>'
}

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editando, setEditando]     = useState<Partial<Categoria>>({})
  const [salvando, setSalvando]     = useState(false)
  const [msg, setMsg]               = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [usarImagem, setUsarImagem] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const fileRef                     = useRef<HTMLInputElement>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, panel_image_url, panel_bg_color, panel_title, panel_tagline')
      .eq('show_in_menu', true)
      .order('name')
    setCategorias(data || [])
    setLoading(false)
  }

  function abrirModal(cat: Categoria) {
    setEditando({ ...cat })
    setUsarImagem(!!cat.panel_image_url)
    setMsg(null)
    setModal(true)
  }

  async function uploadImagem(file: File) {
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `categorias/${editando.slug}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('banners')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) {
      setMsg({ tipo: 'erro', texto: 'Erro no upload: ' + error.message })
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(path)
    setEditando(prev => ({ ...prev, panel_image_url: urlData.publicUrl }))
    setUploading(false)
  }

  async function removerImagem() {
    setEditando(prev => ({ ...prev, panel_image_url: null }))
    setUsarImagem(false)
  }

  async function salvar() {
    if (!editando.id) return
    setSalvando(true)
    setMsg(null)
    const payload = {
      panel_title:     editando.panel_title     || null,
      panel_tagline:   editando.panel_tagline   || null,
      panel_bg_color:  editando.panel_bg_color  || '#1e7a3c',
      panel_image_url: usarImagem ? (editando.panel_image_url || null) : null,
    }
    const { error } = await supabase.from('categories').update(payload).eq('id', editando.id)
    if (!error) await registrarAuditoria({ executedBy: 'admin', acao: 'categoria_editada', entidade: 'categories', detalhe: `Categoria: ${editando.name || editando.label || editando.id}` })
    if (error) {
      setMsg({ tipo: 'erro', texto: 'Erro ao salvar: ' + error.message })
    } else {
      setMsg({ tipo: 'ok', texto: 'Salvo com sucesso!' })
      carregar()
      setTimeout(() => setModal(false), 800)
    }
    setSalvando(false)
  }

  function PainelPreview() {
    const bgStyle = usarImagem && editando.panel_image_url
      ? { backgroundImage: `url(${editando.panel_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: editando.panel_bg_color || '#1e7a3c' }
    return (
      <div className="rounded-xl overflow-hidden" style={{ ...bgStyle, minHeight: 140 }}>
        <div className="w-full h-full p-5" style={{ background: usarImagem ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)' }}>
          {editando.panel_title && <p className="text-white text-base font-black leading-tight mb-2">{editando.panel_title}</p>}
          {editando.panel_tagline && <p className="text-white text-xs leading-relaxed opacity-90">{editando.panel_tagline}</p>}
          {!editando.panel_title && !editando.panel_tagline && (
            <p className="text-white text-xs opacity-50 italic">Preencha o título e a frase de apoio para visualizar</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-500 mt-1">Configure o painel visual e os textos de cada categoria do menu.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Categoria</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Painel</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Título</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Frase de apoio</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Carregando...</td></tr>
            ) : categorias.map(cat => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: cat.panel_bg_color || '#1e7a3c' }}
                      dangerouslySetInnerHTML={{ __html: getIcone(cat.slug) }} />
                    <span className="font-bold text-sm text-gray-800">{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  {cat.panel_image_url
                    ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">📷 Imagem</span>
                    : <span className="inline-block w-5 h-5 rounded border border-gray-200 mx-auto" style={{ background: cat.panel_bg_color || '#1e7a3c' }} />}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {cat.panel_title || <span className="text-gray-300 italic text-xs">não definido</span>}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 max-w-xs">
                  {cat.panel_tagline
                    ? <span className="truncate block">{cat.panel_tagline}</span>
                    : <span className="text-gray-300 italic text-xs">não definido</span>}
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => abrirModal(cat)} className="text-blue-500 hover:text-blue-700 transition-colors">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: editando.panel_bg_color || '#1e7a3c' }}
                  dangerouslySetInnerHTML={{ __html: getIcone(editando.slug || '') }} />
                <div>
                  <h2 className="text-base font-black text-gray-800">{editando.name}</h2>
                  <p className="text-xs text-gray-500 font-mono">{editando.slug}</p>
                </div>
              </div>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3">
                  <Palette size={14} className="text-green-600" /> Painel visual
                </label>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setUsarImagem(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${!usarImagem ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}>
                    <Palette size={14} /> Usar cor
                  </button>
                  <button onClick={() => setUsarImagem(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${usarImagem ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}>
                    <Upload size={14} /> Usar imagem
                  </button>
                </div>
                {!usarImagem ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Escolha uma cor de fundo para o painel:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {COR_OPCOES.map(cor => (
                        <button key={cor.value} onClick={() => setEditando({ ...editando, panel_bg_color: cor.value })}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${editando.panel_bg_color === cor.value ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-gray-300'}`}>
                          <div className="w-8 h-8 rounded-lg shadow-sm" style={{ background: cor.value }} />
                          <span className="text-[10px] text-gray-600 text-center leading-tight">{cor.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs text-gray-500">Cor personalizada:</span>
                      <input type="color" value={editando.panel_bg_color || '#1e7a3c'}
                        onChange={e => setEditando({ ...editando, panel_bg_color: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                      <span className="text-xs font-mono text-gray-500">{editando.panel_bg_color || '#1e7a3c'}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Suba uma imagem para o fundo do painel. Dimensão ideal: <strong>800x400px</strong>.</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) uploadImagem(e.target.files[0]) }} />
                    {!editando.panel_image_url ? (
                      <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl p-8 flex flex-col items-center gap-3 transition-all group">
                        {uploading ? (
                          <>
                            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Enviando imagem...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={28} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-green-700">Clique para selecionar imagem</span>
                            <span className="text-xs text-gray-400">JPG, PNG ou WebP · máx. 2MB</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={editando.panel_image_url} alt="Preview" className="w-full h-36 object-cover" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button onClick={() => fileRef.current?.click()} disabled={uploading}
                            className="bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-50 flex items-center gap-1.5">
                            <Upload size={12} /> Trocar
                          </button>
                          <button onClick={removerImagem}
                            className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-red-600 flex items-center gap-1.5">
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3">
                  <AlignLeft size={14} className="text-green-600" /> Textos do painel
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Título</label>
                    <input value={editando.panel_title || ''} onChange={e => setEditando({ ...editando, panel_title: e.target.value })}
                      placeholder="Ex: Ambientes"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Frase de apoio</label>
                    <textarea value={editando.panel_tagline || ''} onChange={e => setEditando({ ...editando, panel_tagline: e.target.value })}
                      placeholder="Ex: A luz certa transforma qualquer espaço em um lugar especial."
                      rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Preview</label>
                <PainelPreview />
              </div>
              {msg && (
                <p className={`text-sm font-bold px-4 py-2.5 rounded-lg ${msg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {msg.tipo === 'ok' ? '✅' : '❌'} {msg.texto}
                </p>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black py-3 rounded-lg transition-colors">
                <Save size={16} />
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
