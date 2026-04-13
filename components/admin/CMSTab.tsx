'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface CmsPage {
  id?: string
  slug: string
  titulo: string
  conteudo: string
  publicado: boolean
}

const PAGINAS_PADRAO = [
  { slug: 'quem-somos',        titulo: 'Quem Somos' },
  { slug: 'trocas-devolucoes', titulo: 'Trocas e Devoluções' },
  { slug: 'seguranca',         titulo: 'Segurança' },
]

// Editor WYSIWYG simples sem dependência externa
function EditorWYSIWYG({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
  }, [])

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val)
    ref.current?.focus()
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const btnClass = "px-2 py-1 text-xs font-bold border border-gray-200 rounded hover:bg-gray-100 transition-colors"

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold') }} className={btnClass}><strong>N</strong></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic') }} className={btnClass}><em>I</em></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('underline') }} className={btnClass}><u>S</u></button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2') }} className={btnClass}>H2</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h3') }} className={btnClass}>H3</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p') }} className={btnClass}>¶</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }} className={btnClass}>• Lista</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }} className={btnClass}>1. Lista</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }} className={btnClass}>⬅</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }} className={btnClass}>↔</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('removeFormat') }} className={`${btnClass} text-red-500`}>✕ Limpar</button>
      </div>
      {/* Área editável */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
        className="min-h-[200px] p-4 text-sm text-gray-800 outline-none prose prose-sm max-w-none
          [&>h2]:text-lg [&>h2]:font-black [&>h2]:text-gray-800 [&>h2]:mt-4 [&>h2]:mb-2
          [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-gray-700 [&>h3]:mt-3 [&>h3]:mb-1
          [&>p]:mb-2 [&>p]:leading-relaxed
          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2
          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2"
      />
    </div>
  )
}

function PaginaEditor({ pagina, onSave }: { pagina: CmsPage; onSave: (p: CmsPage) => void }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(pagina)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function salvar() {
    setSaving(true)
    const payload = {
      slug: data.slug, titulo: data.titulo,
      conteudo: data.conteudo, publicado: data.publicado,
      updated_at: new Date().toISOString()
    }
    let error
    if (data.id) {
      ({ error } = await supabase.from('cms_pages').update(payload).eq('id', data.id))
    } else {
      const res = await supabase.from('cms_pages').insert(payload).select().single()
      error = res.error
      if (res.data) setData({ ...data, id: res.data.id })
    }
    setSaving(false)
    if (error) { setMsg('Erro ao salvar'); return }
    setMsg('Salvo!')
    onSave({ ...data })
    setTimeout(() => setMsg(null), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <FileText size={16} className="text-green-700" />
          </div>
          <span className="font-black text-gray-800">{data.titulo}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {data.publicado ? 'Publicado' : 'Rascunho'}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 space-y-4 mt-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Título da página</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={data.titulo}
              onChange={e => setData({ ...data, titulo: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-2 block">Conteúdo</label>
            <EditorWYSIWYG
              value={data.conteudo}
              onChange={conteudo => setData(prev => ({ ...prev, conteudo }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button type="button" onClick={() => setData({ ...data, publicado: !data.publicado })}
                className={`relative w-11 h-6 rounded-full transition-colors ${data.publicado ? 'bg-green-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.publicado ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm font-bold text-gray-700">Publicado</span>
            </label>
            <div className="flex items-center gap-3">
              {msg && <span className={`text-sm font-bold ${msg === 'Salvo!' ? 'text-green-600' : 'text-red-500'}`}>{msg}</span>}
              <button onClick={salvar} disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors">
                <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CMSTab() {
  const [paginas, setPaginas] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('cms_pages').select('*').order('slug')
      const existentes = data || []
      const merged = PAGINAS_PADRAO.map(p => {
        const found = existentes.find(e => e.slug === p.slug)
        return found || { slug: p.slug, titulo: p.titulo, conteudo: '', publicado: true }
      })
      setPaginas(merged)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
      Carregando páginas...
    </div>
  )

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-gray-800">Páginas e Blocos</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">Edite o conteúdo das páginas institucionais da loja.</p>
      {paginas.map(p => (
        <PaginaEditor key={p.slug} pagina={p}
          onSave={updated => setPaginas(prev => prev.map(x => x.slug === updated.slug ? updated : x))} />
      ))}
    </div>
  )
}
