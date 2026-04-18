'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, Edit2, X, Tag } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Badge {
  id?: string
  slug: string
  label: string
  bg_color: string
  text_color: string
  active: boolean
  sort_order: number
}

const VAZIO: Badge = { slug: '', label: '', bg_color: '#F3F4F6', text_color: '#374151', active: true, sort_order: 0 }

export default function BadgesTab() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Badge>(VAZIO)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('badges').select('*').order('sort_order')
    setBadges((data || []) as Badge[])
    setLoading(false)
  }

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 2500) }

  function slugify(text: string) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function salvar() {
    if (!form.label.trim()) return
    const payload = { ...form, slug: form.slug || slugify(form.label) }
    let error
    if (form.id) {
      const { id, ...rest } = payload as any
      ;({ error } = await supabase.from('badges').update(rest).eq('id', id))
    } else {
      ;({ error } = await supabase.from('badges').insert(payload as any))
    }
    if (error) { showMsg('Erro ao salvar: ' + error.message); return }
    setModal(false)
    setForm(VAZIO)
    carregar()
    showMsg('Badge salvo!')
  }

  async function excluir(id: string) {
    if (!confirm('Remover este badge?')) return
    await supabase.from('badges').delete().eq('id', id)
    setBadges(prev => prev.filter(b => b.id !== id))
    showMsg('Removido!')
  }

  async function toggleAtivo(badge: Badge) {
    await supabase.from('badges').update({ active: !badge.active } as any).eq('id', badge.id!)
    setBadges(prev => prev.map(b => b.id === badge.id ? { ...b, active: !b.active } : b))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Badges de Produto</h1>
          <p className="text-xs text-gray-400 mt-1">Selos exibidos nos cards de produto. Máximo 2 por produto.</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-bold text-green-600">{msg}</span>}
          <button onClick={() => { setForm({ ...VAZIO, sort_order: badges.length + 1 }); setModal(true) }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors">
            <Plus size={14} /> Novo Badge
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
          Carregando...
        </div>
      ) : badges.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Tag size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum badge cadastrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Preview</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Label</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Slug</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {badges.map(badge => (
                <tr key={badge.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <span className="text-xs font-black px-3 py-1 rounded"
                      style={{ backgroundColor: badge.bg_color, color: badge.text_color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-800">{badge.label}</td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">{badge.slug}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleAtivo(badge)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${badge.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                      {badge.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm({ ...badge }); setModal(true) }}
                        className="text-blue-500 hover:text-blue-700"><Edit2 size={14} /></button>
                      <button onClick={() => excluir(badge.id!)}
                        className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{form.id ? 'Editar Badge' : 'Novo Badge'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {form.label && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <span className="text-xs font-black">Preview:</span>
                <span className="text-xs font-black px-3 py-1 rounded"
                  style={{ backgroundColor: form.bg_color, color: form.text_color }}>
                  {form.label}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Label (texto exibido) *</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value, slug: slugify(e.target.value) })}
                  placeholder="Ex: Black Friday" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Slug (gerado automaticamente)</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono bg-gray-50"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Cor de fundo</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.bg_color}
                      onChange={e => setForm({ ...form, bg_color: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-green-500"
                      value={form.bg_color}
                      onChange={e => setForm({ ...form, bg_color: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Cor do texto</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.text_color}
                      onChange={e => setForm({ ...form, text_color: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-green-500"
                      value={form.text_color}
                      onChange={e => setForm({ ...form, text_color: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Ordem</label>
                  <input type="number" min={0}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                    value={form.sort_order}
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4 accent-green-600" />
                    <span className="text-sm font-bold text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={!form.label.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg">
                {form.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
