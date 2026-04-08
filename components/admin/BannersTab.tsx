'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Banner = {
  id?: string
  title: string
  subtitle: string
  badge: string
  btn1_label: string
  btn1_href: string
  btn2_label: string
  btn2_href: string
  image_url: string
  bg_color: string
  position: number
  active: boolean
  starts_at: string
  ends_at: string
}

const bgOpcoes = [
  { label: 'Verde (padrão)', value: 'from-green-900 via-green-700 to-green-800' },
  { label: 'Azul', value: 'from-blue-950 via-blue-800 to-blue-900' },
  { label: 'Roxo', value: 'from-purple-950 via-purple-800 to-purple-900' },
  { label: 'Vermelho', value: 'from-red-950 via-red-800 to-red-900' },
  { label: 'Cinza escuro', value: 'from-gray-900 via-gray-700 to-gray-800' },
]

const bannerVazio: Banner = {
  title: '', subtitle: '', badge: '',
  btn1_label: '', btn1_href: '',
  btn2_label: '', btn2_href: '',
  image_url: '', bg_color: 'from-green-900 via-green-700 to-green-800',
  position: 0, active: true, starts_at: '', ends_at: '',
}

export default function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Banner>(bannerVazio)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('position')
    setBanners(data || [])
    setLoading(false)
  }

  async function salvar() {
    const dados = {
      title: editando.title,
      subtitle: editando.subtitle,
      badge: editando.badge,
      btn1_label: editando.btn1_label,
      btn1_href: editando.btn1_href,
      btn2_label: editando.btn2_label,
      btn2_href: editando.btn2_href,
      image_url: editando.image_url,
      bg_color: editando.bg_color,
      position: Number(editando.position),
      active: editando.active,
      starts_at: editando.starts_at || null,
      ends_at: editando.ends_at || null,
    }
    if (editando.id) {
      await supabase.from('banners').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('banners').insert(dados)
    }
    setModal(false)
    setEditando(bannerVazio)
    carregar()
  }

  async function toggleAtivo(id: string | undefined, ativo: boolean) {
    if (!id) return; await supabase.from('banners').update({ active: !ativo }).eq('id', id)
    carregar()
  }

  async function excluir(id: string | undefined) {
    if (!confirm('Excluir este banner?')) return
    if (!id) return; await supabase.from('banners').delete().eq('id', id)
    carregar()
  }

  function status(b: Banner) {
    const now = new Date()
    if (!b.active) return { label: 'Inativo', cor: 'bg-gray-100 text-gray-500' }
    if (b.starts_at && new Date(b.starts_at) > now) return { label: 'Agendado', cor: 'bg-blue-100 text-blue-700' }
    if (b.ends_at && new Date(b.ends_at) < now) return { label: 'Expirado', cor: 'bg-red-100 text-red-600' }
    return { label: 'Ativo', cor: 'bg-green-100 text-green-700' }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Banners do Carousel</h1>
        <button onClick={() => { setEditando(bannerVazio); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Banner
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Ordem</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Banner</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Agendamento</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum banner cadastrado.</td></tr>
            ) : banners.map((b) => {
              const st = status(b)
              return (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-black text-sm flex items-center justify-center mx-auto">{b.position}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-gray-800 max-w-xs truncate">{b.title}</p>
                    {b.badge && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{b.badge}</span>}
                    {b.image_url && <p className="text-xs text-blue-500 mt-0.5 truncate max-w-xs">🖼️ Com imagem</p>}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {b.starts_at ? <p>▶ {new Date(b.starts_at).toLocaleDateString('pt-BR')}</p> : <p className="text-gray-300">Sem início</p>}
                    {b.ends_at ? <p>⏹ {new Date(b.ends_at).toLocaleDateString('pt-BR')}</p> : <p className="text-gray-300">Sem fim</p>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(b.id, b.active)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${st.cor}`}>
                      {st.label}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditando(b); setModal(true) }} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                      <button onClick={() => excluir(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{editando.id ? 'Editar Banner' : 'Novo Banner'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Título *</label>
                <input value={editando.title} onChange={e => setEditando({...editando, title: e.target.value})}
                  placeholder="Ex: Iluminação que transforma ambientes"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Subtítulo</label>
                <input value={editando.subtitle} onChange={e => setEditando({...editando, subtitle: e.target.value})}
                  placeholder="Ex: Mais de 3.000 produtos..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Badge/Etiqueta</label>
                  <input value={editando.badge} onChange={e => setEditando({...editando, badge: e.target.value})}
                    placeholder="Ex: Nova Coleção 2025"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Ordem (posição)</label>
                  <input type="number" value={editando.position} onChange={e => setEditando({...editando, position: parseInt(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Botão 1 — Texto</label>
                  <input value={editando.btn1_label} onChange={e => setEditando({...editando, btn1_label: e.target.value})}
                    placeholder="Ex: Ver Catálogo"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Botão 1 — Link</label>
                  <input value={editando.btn1_href} onChange={e => setEditando({...editando, btn1_href: e.target.value})}
                    placeholder="Ex: /produtos"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Botão 2 — Texto</label>
                  <input value={editando.btn2_label} onChange={e => setEditando({...editando, btn2_label: e.target.value})}
                    placeholder="Ex: Linha SMART →"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Botão 2 — Link</label>
                  <input value={editando.btn2_href} onChange={e => setEditando({...editando, btn2_href: e.target.value})}
                    placeholder="Ex: /produtos?categoria=smart"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">URL da imagem de fundo (opcional)</label>
                <input value={editando.image_url} onChange={e => setEditando({...editando, image_url: e.target.value})}
                  placeholder="https://... (deixe vazio para usar cor de fundo)"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Cor de fundo</label>
                <select value={editando.bg_color} onChange={e => setEditando({...editando, bg_color: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white">
                  {bgOpcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Data de início</label>
                  <input type="datetime-local" value={editando.starts_at?.slice(0,16) || ''} onChange={e => setEditando({...editando, starts_at: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Data de fim</label>
                  <input type="datetime-local" value={editando.ends_at?.slice(0,16) || ''} onChange={e => setEditando({...editando, ends_at: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ativo" checked={editando.active} onChange={e => setEditando({...editando, active: e.target.checked})}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="ativo" className="text-sm font-bold text-gray-700">Banner ativo</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={!editando.title}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {editando.id ? 'Salvar' : 'Criar banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
