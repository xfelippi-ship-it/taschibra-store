'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { registrarAuditoria } from '@/lib/auditLog'


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
  link_href: string
  position: number
  active: boolean | null
  starts_at: string
  ends_at: string
  banner_type: string
}

const bgOpcoes = [
  { label: 'Verde Taschibra', value: 'from-green-900 via-green-700 to-green-800' },
  { label: 'Verde escuro', value: 'from-green-950 via-green-900 to-green-800' },
  { label: 'Azul profundo', value: 'from-blue-950 via-blue-800 to-blue-900' },
  { label: 'Azul petróleo', value: 'from-cyan-950 via-cyan-800 to-blue-900' },
  { label: 'Roxo', value: 'from-purple-950 via-purple-800 to-purple-900' },
  { label: 'Laranja queimado', value: 'from-orange-950 via-orange-800 to-amber-900' },
  { label: 'Vermelho', value: 'from-red-950 via-red-800 to-red-900' },
  { label: 'Grafite', value: 'from-gray-900 via-gray-700 to-gray-800' },
  { label: 'Preto', value: 'from-zinc-950 via-zinc-900 to-zinc-800' },
]

const bannerVazio: Banner = {
  title: '', subtitle: '', badge: '',
  btn1_label: '', btn1_href: '',
  btn2_label: '', btn2_href: '',
  image_url: '', bg_color: 'from-green-900 via-green-700 to-green-800',
  link_href: '', position: 0, active: true, starts_at: '', ends_at: '', banner_type: 'principal',
}

function calcStatus(b: Banner) {
  const now = new Date()
  if (!b.active) return { label: 'Inativo', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500' }
  if (b.starts_at && new Date(b.starts_at) > now) return { label: 'Agendado', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' }
  if (b.ends_at && new Date(b.ends_at) < now) return { label: 'Finalizado', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500' }
  return { label: 'Em vigor', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700' }
}

function BannerPreview({ b }: { b: Banner }) {
  return (
    <div className={`relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-r ${b.bg_color} flex items-center px-6`}>
      {b.image_url && (
        <img src={b.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="relative z-10 flex-1 min-w-0">
        {b.badge && <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full mb-1">{b.badge}</span>}
        <p className="text-white font-black text-sm leading-tight truncate">{b.title || 'Título do banner'}</p>
        <p className="text-white/70 text-xs mt-0.5 truncate">{b.subtitle}</p>
        <div className="flex gap-2 mt-2">
          {b.btn1_label && <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">{b.btn1_label}</span>}
          {b.btn2_label && <span className="border border-white/50 text-white text-xs font-bold px-3 py-1 rounded-full">{b.btn2_label}</span>}
        </div>
      </div>
      {b.link_href && (
        <div className="relative z-10 ml-4 text-white/50 text-xs truncate max-w-[120px]">
          🔗 {b.link_href}
        </div>
      )}
    </div>
  )
}

export default function BannersTab({ meuEmail = 'admin' }: { meuEmail?: string }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [preview, setPreview] = useState(false)
  const [editando, setEditando] = useState<Banner>(bannerVazio)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('position')
    setBanners((data || []) as any)
    setLoading(false)
  }

  async function uploadImagem(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const nome = `banner-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('banners').upload(nome, file, { upsert: true })
    if (error) { alert('Erro no upload: ' + error.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nome)
    setEditando(prev => ({ ...prev, image_url: urlData.publicUrl }))
    setUploading(false)
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
      link_href: editando.link_href || null,
      position: Number(editando.position),
      active: editando.active,
      starts_at: editando.starts_at || null,
      ends_at: editando.ends_at || null,
      banner_type: editando.banner_type || 'principal',
    }
    if (editando.id) {
      const { error } = await supabase.from('banners').update(dados).eq('id', editando.id)
      if (error) { alert('Erro ao salvar: ' + error.message); return }
      await registrarAuditoria({ executedBy: meuEmail, acao: 'banner_editado', entidade: 'banners', detalhe: `Banner ID: ${editando.id}` })
    } else {
      const { error } = await supabase.from('banners').insert([dados])
      if (error) { alert('Erro ao criar: ' + error.message); return }
      await registrarAuditoria({ executedBy: meuEmail, acao: 'banner_criado', entidade: 'banners', detalhe: 'Novo banner criado' })
    }
    setModal(false)
    setPreview(false)
    setEditando(bannerVazio)
    carregar()
  }

  async function toggleAtivo(id: string | undefined, ativo: boolean) {
    if (!id) return
    await supabase.from('banners').update({ active: !ativo }).eq('id', id)
      await registrarAuditoria({ executedBy: 'admin', acao: ativo ? 'banner_desativado' : 'banner_ativado', entidade: 'banners', detalhe: `Banner ID: ${id}` })
    carregar()
  }

  async function excluir(id: string | undefined) {
    if (!confirm('Excluir este banner?')) return
    if (!id) return
    await supabase.from('banners').delete().eq('id', id)
      await registrarAuditoria({ executedBy: meuEmail, acao: 'banner_excluido', entidade: 'banners', detalhe: `Banner ID: ${id}` })
    carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Banners do Carrossel</h1>
        <button onClick={() => { setEditando(bannerVazio); setPreview(false); setModal(true) }}
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
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Tipo</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum banner cadastrado.</td></tr>
            ) : banners.map((b) => {
              const st = calcStatus(b)
                  const tipo = b.banner_type || 'principal'
              return (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-black text-sm flex items-center justify-center mx-auto">{b.position}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-gray-800 max-w-xs truncate">{b.title}</p>
                    {b.badge && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{b.badge}</span>}
                    {b.link_href && <p className="text-xs text-blue-400 mt-0.5 truncate max-w-xs">🔗 {b.link_href}</p>}
                    {b.image_url && <p className="text-xs text-green-500 mt-0.5">🖼 Com imagem</p>}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {b.starts_at ? <p>▶ {new Date(b.starts_at).toLocaleDateString('pt-BR')}</p> : <p className="text-gray-300">Sem início</p>}
                    {b.ends_at ? <p>⏹ {new Date(b.ends_at).toLocaleDateString('pt-BR')}</p> : <p className="text-gray-300">Sem fim</p>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(b.id, b.active)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${st.badge}`}>
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tipo === 'carrinho' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {tipo === 'carrinho' ? 'Carrinho' : 'Principal'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditando(b); setPreview(false); setModal(true) }} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">{editando.id ? 'Editar Banner' : 'Novo Banner'}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(p => !p)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${preview ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                  {preview ? 'Fechar preview' : 'Preview'}
                </button>
                <button onClick={() => { setModal(false); setPreview(false) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
            </div>

            {preview && (
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wide">Preview — como vai aparecer no site</p>
                <BannerPreview b={editando} />
              </div>
            )}

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
                  placeholder="Ex: Mais de 3.000 produtos para iluminar sua casa"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Link de destino (clique no banner inteiro)</label>
                <input value={editando.link_href} onChange={e => setEditando({...editando, link_href: e.target.value})}
                  placeholder="Ex: /produtos?categoria=lancamentos"
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
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Ordem</label>
                  <input type="number" value={editando.position} onChange={e => setEditando({...editando, position: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo</label>
                  <select value={editando.banner_type || 'principal'} onChange={e => setEditando({...editando, banner_type: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white">
                    <option value="principal">Principal (Carrossel home)</option>
                    <option value="carrinho">Carrinho</option>
                  </select>
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
                    placeholder="Ex: Linha SMART"
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
                <label className="text-sm font-bold text-gray-700 mb-1 block">Imagem de fundo</label>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && uploadImagem(e.target.files[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl py-4 text-sm text-gray-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <Upload size={16} />
                    {uploading ? 'Enviando...' : 'Clique para upload (JPG/WebP, 1440×480px, máx 500KB)'}
                  </button>
                  {editando.image_url && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={editando.image_url} alt="preview" className="w-full h-20 object-cover" />
                      <button onClick={() => setEditando(prev => ({...prev, image_url: ''}))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                    </div>
                  )}
                  <input value={editando.image_url} onChange={e => setEditando({...editando, image_url: e.target.value})}
                    placeholder="Ou cole uma URL de imagem"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Cor de fundo</label>
                <div className="grid grid-cols-3 gap-2">
                  {bgOpcoes.map(o => (
                    <button key={o.value} type="button" onClick={() => setEditando({...editando, bg_color: o.value})}
                      className={`h-10 rounded-lg bg-gradient-to-r ${o.value} flex items-center justify-center text-white text-xs font-bold border-2 transition-all ${editando.bg_color === o.value ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      {editando.bg_color === o.value ? '✓ ' : ''}{o.label}
                    </button>
                  ))}
                </div>
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
              <button onClick={() => { setModal(false); setPreview(false) }} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={!editando.title}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {editando.id ? 'Salvar alterações' : 'Criar banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
