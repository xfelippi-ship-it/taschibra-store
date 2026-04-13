'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Eye, EyeOff, Save, Trash2, Plus, Palette } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Popup = {
  id: string; title: string; subtitle: string | null
  image_url: string | null; button_text: string
  button_link: string; bg_color: string; active: boolean
  created_at: string
}

const CORES_PRESET = [
  { label: 'Verde Taschibra', cor: '#1e7a3c' },
  { label: 'Verde escuro',    cor: '#14532d' },
  { label: 'Azul',            cor: '#1e40af' },
  { label: 'Roxo',            cor: '#6b21a8' },
  { label: 'Vermelho',        cor: '#b91c1c' },
  { label: 'Laranja',         cor: '#c2410c' },
  { label: 'Preto',           cor: '#18181b' },
]

export default function PopupTab() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Popup | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('popup_promos').select('*').order('created_at', { ascending: false })
    setPopups(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function showMsg(texto: string, tipo: 'ok' | 'erro' = 'ok') {
    setMsg({ tipo, texto })
    setTimeout(() => setMsg(null), 3000)
  }

  function novoPopup() {
    setEditando({
      id: '', title: 'Novo Popup', subtitle: 'Subtitulo do popup',
      image_url: null, button_text: 'Ver Ofertas', button_link: '/produtos',
      bg_color: '#1e7a3c', active: false, created_at: ''
    })
  }

  async function salvar() {
    if (!editando) return
    setSalvando(true)
    const payload = {
      title: editando.title,
      subtitle: editando.subtitle || null,
      image_url: editando.image_url || null,
      button_text: editando.button_text,
      button_link: editando.button_link,
      bg_color: editando.bg_color,
      active: editando.active,
    }
    if (editando.id) {
      await supabase.from('popup_promos').update(payload).eq('id', editando.id)
      showMsg('Popup atualizado')
    } else {
      await supabase.from('popup_promos').insert(payload)
      showMsg('Popup criado')
    }
    setSalvando(false)
    setEditando(null)
    carregar()
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este popup?')) return
    await supabase.from('popup_promos').delete().eq('id', id)
    showMsg('Popup excluido')
    carregar()
  }

  async function toggleAtivo(popup: Popup) {
    await supabase.from('popup_promos').update({ active: !popup.active }).eq('id', popup.id)
    carregar()
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Popup Promocional</h1>
          <p className="text-sm text-gray-500 mt-1">Configure o popup que aparece na home para visitantes.</p>
        </div>
        <button onClick={novoPopup}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={14} /> Novo Popup
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-bold ${msg.tipo === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.texto}
        </div>
      )}

      {/* Modal de edicao */}
      {editando && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-black text-gray-800 mb-4">{editando.id ? 'Editar' : 'Novo'} Popup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Titulo</label>
              <input value={editando.title} onChange={e => setEditando({...editando, title: e.target.value})}
                className={inputCls} placeholder="Ex: Frete Gratis em todo o site" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Subtitulo</label>
              <input value={editando.subtitle || ''} onChange={e => setEditando({...editando, subtitle: e.target.value})}
                className={inputCls} placeholder="Ex: Para compras acima de R$ 299" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Texto do botao</label>
              <input value={editando.button_text} onChange={e => setEditando({...editando, button_text: e.target.value})}
                className={inputCls} placeholder="Ex: Ver Ofertas" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Link do botao</label>
              <input value={editando.button_link} onChange={e => setEditando({...editando, button_link: e.target.value})}
                className={inputCls} placeholder="Ex: /produtos ou /produtos?categoria=outlet" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">URL da imagem (opcional)</label>
              <input value={editando.image_url || ''} onChange={e => setEditando({...editando, image_url: e.target.value})}
                className={inputCls} placeholder="https://... (imagem de topo do popup)" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Cor de fundo</label>
              <div className="flex items-center gap-2">
                <input type="color" value={editando.bg_color}
                  onChange={e => setEditando({...editando, bg_color: e.target.value})}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={editando.bg_color} onChange={e => setEditando({...editando, bg_color: e.target.value})}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-green-500" />
              </div>
              <div className="flex gap-1.5 mt-2">
                {CORES_PRESET.map(c => (
                  <button key={c.cor} onClick={() => setEditando({...editando, bg_color: c.cor})}
                    title={c.label}
                    className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                    style={{ backgroundColor: c.cor, borderColor: editando.bg_color === c.cor ? '#000' : 'transparent' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Palette size={12} /> Preview</p>
            <div className="rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto" style={{ background: editando.bg_color }}>
              {editando.image_url && (
                <div className="w-full h-32 overflow-hidden">
                  <img src={editando.image_url} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
              <div className="p-5 text-center">
                <h3 className="text-lg font-black text-white leading-tight mb-1">{editando.title || 'Titulo'}</h3>
                {editando.subtitle && <p className="text-xs text-white/80 mb-4">{editando.subtitle}</p>}
                <span className="inline-block bg-white text-sm font-bold px-5 py-2 rounded-full"
                  style={{ color: editando.bg_color }}>
                  {editando.button_text || 'Botao'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={editando.active}
                onChange={e => setEditando({...editando, active: e.target.checked})}
                className="w-4 h-4 accent-green-600" />
              <span className="text-sm font-bold text-gray-700">Ativo (visivel na home)</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setEditando(null)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
              <button onClick={salvar} disabled={salvando}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors">
                <Save size={14} /> {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de popups */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : popups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-semibold">Nenhum popup cadastrado.</p>
            <button onClick={novoPopup} className="text-green-600 font-bold text-sm mt-2 hover:underline">Criar primeiro popup</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Preview</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Titulo</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Destino</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {popups.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="w-16 h-10 rounded-lg flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ background: p.bg_color }}>
                      {p.title.slice(0, 12)}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-sm text-gray-800">{p.title}</p>
                    {p.subtitle && <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{p.button_link}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => toggleAtivo(p)}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? <><Eye size={11} /> Ativo</> : <><EyeOff size={11} /> Inativo</>}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditando({...p})}
                        className="text-blue-500 hover:text-blue-700 transition-colors" title="Editar">
                        <Palette size={15} />
                      </button>
                      <button onClick={() => deletar(p.id)}
                        className="text-red-400 hover:text-red-600 transition-colors" title="Excluir">
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
