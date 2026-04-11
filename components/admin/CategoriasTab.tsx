/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Pencil, X, Save, Image as ImageIcon, Palette, AlignLeft, Tag } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Categoria = {
  id: string
  name: string
  slug: string
  icon_svg: string | null
  panel_image_url: string | null
  panel_bg_color: string | null
  panel_title: string | null
  panel_tagline: string | null
}

const COR_OPCOES = [
  { label: 'Verde Taschibra', value: '#1e7a3c' },
  { label: 'Verde escuro',    value: '#155c2c' },
  { label: 'Azul petróleo',   value: '#0f4c75' },
  { label: 'Azul noite',      value: '#1a1a2e' },
  { label: 'Laranja',         value: '#e67e22' },
  { label: 'Vermelho',        value: '#c0392b' },
  { label: 'Roxo',            value: '#6c3483' },
  { label: 'Cinza escuro',    value: '#2c3e50' },
  { label: 'Marrom',          value: '#5d4037' },
  { label: 'Preto',           value: '#111111' },
]

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editando, setEditando]     = useState<Partial<Categoria>>({})
  const [salvando, setSalvando]     = useState(false)
  const [msg, setMsg]               = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [usarImagem, setUsarImagem] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, icon_svg, panel_image_url, panel_bg_color, panel_title, panel_tagline')
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

  async function salvar() {
    if (!editando.id) return
    setSalvando(true)
    setMsg(null)
    const payload = {
      icon_svg:        editando.icon_svg        || null,
      panel_title:     editando.panel_title     || null,
      panel_tagline:   editando.panel_tagline   || null,
      panel_bg_color:  editando.panel_bg_color  || '#1e7a3c',
      panel_image_url: usarImagem ? (editando.panel_image_url || null) : null,
    }
    const { error } = await supabase.from('categories').update(payload).eq('id', editando.id)
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
        <div className="w-full h-full p-5" style={{ background: 'rgba(0,0,0,0.35)' }}>
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
          <p className="text-sm text-gray-500 mt-1">Configure o ícone, painel visual e frase de apoio de cada categoria para o menu "Todas Categorias".</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Categoria</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Slug</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Painel</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Título painel</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Frase de apoio</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Carregando...</td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Nenhuma categoria encontrada.</td></tr>
            ) : categorias.map(cat => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cat.panel_bg_color || '#1e7a3c' }}>
                      {cat.icon_svg
                        ? <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: cat.icon_svg }} />
                        : <Tag size={14} color="white" opacity={0.6} />}
                    </div>
                    <span className="font-bold text-sm text-gray-800">{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{cat.slug}</span></td>
                <td className="px-5 py-4 text-center">
                  {cat.panel_image_url
                    ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit mx-auto"><ImageIcon size={10} /> Imagem</span>
                    : <span className="inline-block w-5 h-5 rounded border border-gray-200 mx-auto" style={{ background: cat.panel_bg_color || '#1e7a3c' }} />}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{cat.panel_title || <span className="text-gray-300 italic text-xs">não definido</span>}</td>
                <td className="px-5 py-4 text-sm text-gray-500 max-w-xs">
                  {cat.panel_tagline ? <span className="truncate block">{cat.panel_tagline}</span> : <span className="text-gray-300 italic text-xs">não definido</span>}
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => abrirModal(cat)} className="text-blue-500 hover:text-blue-700 transition-colors"><Pencil size={15} /></button>
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
              <div>
                <h2 className="text-base font-black text-gray-800">Editar — {editando.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Slug: <span className="font-mono">{editando.slug}</span></p>
              </div>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2"><Tag size={14} className="text-green-600" /> Ícone SVG</label>
                <p className="text-xs text-gray-500 mb-2">Cole o código SVG do ícone. O ícone será exibido sobre a cor de fundo no menu.</p>
                <textarea value={editando.icon_svg || ''} onChange={e => setEditando({ ...editando, icon_svg: e.target.value })}
                  placeholder={'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">...</svg>'}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono outline-none focus:border-green-500 resize-none bg-gray-50" />
                {editando.icon_svg && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Preview:</span>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: editando.panel_bg_color || '#1e7a3c' }}
                      dangerouslySetInnerHTML={{ __html: editando.icon_svg }} />
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3"><Palette size={14} className="text-green-600" /> Painel visual (fundo)</label>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setUsarImagem(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${!usarImagem ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}>
                    <Palette size={14} /> Usar cor
                  </button>
                  <button onClick={() => setUsarImagem(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${usarImagem ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}>
                    <ImageIcon size={14} /> Usar imagem
                  </button>
                </div>
                {!usarImagem ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Escolha uma cor de fundo para o painel desta categoria:</p>
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
                      <input type="color" value={editando.panel_bg_color || '#1e7a3c'} onChange={e => setEditando({ ...editando, panel_bg_color: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                      <span className="text-xs font-mono text-gray-500">{editando.panel_bg_color || '#1e7a3c'}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Cole a URL de uma imagem hospedada. Dimensão ideal: 600×300px.</p>
                    <input type="url" value={editando.panel_image_url || ''} onChange={e => setEditando({ ...editando, panel_image_url: e.target.value })}
                      placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    {editando.panel_image_url && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-24 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editando.panel_image_url} alt="Preview" className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3"><AlignLeft size={14} className="text-green-600" /> Textos do painel</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Título do painel</label>
                    <input value={editando.panel_title || ''} onChange={e => setEditando({ ...editando, panel_title: e.target.value })}
                      placeholder="Ex: Ambientes" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Frase de apoio</label>
                    <textarea value={editando.panel_tagline || ''} onChange={e => setEditando({ ...editando, panel_tagline: e.target.value })}
                      placeholder="Ex: A luz certa transforma qualquer espaço em um lugar especial."
                      rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
                    <p className="text-xs text-gray-400 mt-1">Frase contextual/emocional relacionada à categoria. Aparece abaixo do título no painel direito.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Preview do painel</label>
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
              <button onClick={salvar} disabled={salvando} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black py-3 rounded-lg transition-colors">
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
