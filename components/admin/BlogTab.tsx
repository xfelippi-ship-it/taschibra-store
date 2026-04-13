'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Pencil, Trash2, Eye, EyeOff, Save } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Post = {
  id: string; title: string; slug: string; excerpt: string | null
  content: string | null; cover_image: string | null; author: string
  category: string; tags: string[] | null; published: boolean
  published_at: string | null; created_at: string
}

const CATEGORIAS = ['Geral', 'Guia', 'Dica', 'Novidade', 'Tutorial', 'Projeto']

export default function BlogTab() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Post | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function showMsg(texto: string, tipo: 'ok' | 'erro' = 'ok') {
    setMsg({ tipo, texto }); setTimeout(() => setMsg(null), 3000)
  }

  function novoPost() {
    setEditando({
      id: '', title: '', slug: '', excerpt: null, content: null,
      cover_image: null, author: 'Equipe Taschibra', category: 'Geral',
      tags: null, published: false, published_at: null, created_at: ''
    })
  }

  async function salvar() {
    if (!editando || !editando.title.trim()) { showMsg('Titulo obrigatorio', 'erro'); return }
    setSalvando(true)
    const slug = editando.slug || editando.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const payload = {
      title: editando.title, slug,
      excerpt: editando.excerpt || null,
      content: editando.content || null,
      cover_image: editando.cover_image || null,
      author: editando.author || 'Equipe Taschibra',
      category: editando.category || 'Geral',
      tags: editando.tags,
      published: editando.published,
      published_at: editando.published ? (editando.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    }
    const res = await fetch('/api/admin/blog-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editando.id || null, ...payload }),
    })
    const data = await res.json()
    setSalvando(false)
    if (data.ok) { showMsg(editando.id ? 'Post atualizado' : 'Post criado'); setEditando(null); carregar() }
    else showMsg(data.error || 'Erro ao salvar', 'erro')
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este post?')) return
    await fetch('/api/admin/blog-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    showMsg('Post excluido'); carregar()
  }

  async function togglePublicado(post: Post) {
    await fetch('/api/admin/blog-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: post.id,
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null,
      }),
    })
    carregar()
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500'

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Blog e Guias</h1>
          <p className="text-sm text-gray-500 mt-1">Crie artigos, guias de produto e conteudo para SEO.</p>
        </div>
        <button onClick={novoPost}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={14} /> Novo Post
        </button>
      </div>

      {msg && (
        <div className={'mb-4 px-4 py-3 rounded-lg text-sm font-bold ' + (msg.tipo === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
          {msg.texto}
        </div>
      )}

      {editando && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-black text-gray-800 mb-4">{editando.id ? 'Editar' : 'Novo'} Post</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Titulo</label>
              <input value={editando.title} onChange={e => setEditando({...editando, title: e.target.value})}
                className={inputCls} placeholder="Ex: Como escolher a lampada LED ideal" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Categoria</label>
              <select value={editando.category} onChange={e => setEditando({...editando, category: e.target.value})}
                className={inputCls + ' bg-white'}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Autor</label>
              <input value={editando.author} onChange={e => setEditando({...editando, author: e.target.value})}
                className={inputCls} placeholder="Ex: Equipe Taschibra" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Resumo (excerpt)</label>
              <textarea value={editando.excerpt || ''} onChange={e => setEditando({...editando, excerpt: e.target.value})}
                rows={2} className={inputCls + ' resize-none'} placeholder="Breve descricao do artigo..." />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 block mb-1">Conteudo</label>
              <textarea value={editando.content || ''} onChange={e => setEditando({...editando, content: e.target.value})}
                rows={12} className={inputCls + ' resize-y font-mono text-xs'} placeholder="Escreva o conteudo do artigo... Use ## para subtitulos e - para listas." />
              <p className="text-xs text-gray-400 mt-1">Use ## para subtitulos, ### para sub-subtitulos, - para listas.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Imagem de capa (URL)</label>
              <input value={editando.cover_image || ''} onChange={e => setEditando({...editando, cover_image: e.target.value})}
                className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Slug (URL)</label>
              <input value={editando.slug} onChange={e => setEditando({...editando, slug: e.target.value})}
                className={inputCls + ' font-mono'} placeholder="gerado-automaticamente" />
              <p className="text-xs text-gray-400 mt-1">Deixe vazio para gerar automaticamente.</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={editando.published}
                onChange={e => setEditando({...editando, published: e.target.checked})}
                className="w-4 h-4 accent-green-600" />
              <span className="text-sm font-bold text-gray-700">Publicado</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setEditando(null)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
              <button onClick={salvar} disabled={salvando}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors">
                <Save size={14} /> {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-semibold">Nenhum post cadastrado.</p>
            <button onClick={novoPost} className="text-green-600 font-bold text-sm mt-2 hover:underline">Criar primeiro post</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Titulo</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Categoria</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Data</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-bold text-sm text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">/blog/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => togglePublicado(p)}
                      className={'inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ' + (p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {p.published ? <><Eye size={11} /> Publicado</> : <><EyeOff size={11} /> Rascunho</>}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditando({...p})} className="text-blue-500 hover:text-blue-700" title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deletar(p.id)} className="text-red-400 hover:text-red-600" title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
