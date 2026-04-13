'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, Save, Image, Tag, ToggleLeft, ToggleRight, Upload } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cupom = { pct: string; desc: string; code: string }
type Banner = {
  id: string
  titulo: string
  subtitulo: string
  emoji: string
  ativo: boolean
  tipo: string
  imagem_url: string | null
  cor_fundo: string
  cupons: Cupom[]
}

const CORES = [
  { label: 'Verde Taschibra', value: 'from-green-800 to-green-600' },
  { label: 'Azul', value: 'from-blue-800 to-blue-600' },
  { label: 'Roxo', value: 'from-purple-800 to-purple-600' },
  { label: 'Laranja', value: 'from-orange-700 to-orange-500' },
  { label: 'Vermelho', value: 'from-red-800 to-red-600' },
  { label: 'Cinza escuro', value: 'from-gray-800 to-gray-600' },
]

export default function PromoBannerTab() {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function uploadImagem(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `promo-banner/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('banners').getPublicUrl(path)
      setBanner(prev => prev ? { ...prev, imagem_url: data.publicUrl } : prev)
      showToast('Imagem enviada!')
    } else {
      showToast('Erro ao enviar imagem: ' + error.message)
    }
    setUploading(false)
  }

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('promo_banners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) setBanner(data as Banner)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function salvar() {
    if (!banner) return
    setSalvando(true)
    const { error } = await supabase
      .from('promo_banners')
      .update({
        titulo:     banner.titulo,
        subtitulo:  banner.subtitulo,
        emoji:      banner.emoji,
        ativo:      banner.ativo,
        tipo:       banner.tipo,
        imagem_url: banner.imagem_url,
        cor_fundo:  banner.cor_fundo,
        cupons:     banner.cupons,
        updated_at: new Date().toISOString(),
      })
      .eq('id', banner.id)
    setSalvando(false)
    if (!error) showToast('Banner salvo com sucesso!')
    else showToast('Erro ao salvar: ' + error.message)
  }

  function addCupom() {
    if (!banner) return
    setBanner({ ...banner, cupons: [...banner.cupons, { pct: '', desc: '', code: '' }] })
  }

  function removeCupom(i: number) {
    if (!banner) return
    setBanner({ ...banner, cupons: banner.cupons.filter((_, idx) => idx !== i) })
  }

  function updateCupom(i: number, field: keyof Cupom, value: string) {
    if (!banner) return
    const novos = banner.cupons.map((c, idx) => idx === i ? { ...c, [field]: value } : c)
    setBanner({ ...banner, cupons: novos })
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!banner) return <div className="text-center py-20 text-gray-400">Nenhum banner encontrado.</div>

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 w-full'

  return (
    <div className="max-w-2xl space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-lg">
          {toast}
        </div>
      )}

      {/* Status */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-800">Status do Banner</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ativa ou desativa o banner promocional na home</p>
          </div>
          <button onClick={() => setBanner({ ...banner, ativo: !banner.ativo })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              banner.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
            {banner.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {banner.ativo ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      {/* Tipo */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="font-black text-gray-800 mb-3">Tipo de Banner</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setBanner({ ...banner, tipo: 'cupons' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
              banner.tipo === 'cupons' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
            }`}>
            <Tag size={14} /> Cupons
          </button>
          <button
            onClick={() => setBanner({ ...banner, tipo: 'imagem' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
              banner.tipo === 'imagem' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
            }`}>
            <Image size={14} /> Imagem
          </button>
        </div>
      </div>

      {/* Conteúdo por tipo */}
      {banner.tipo === 'imagem' ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
          <h3 className="font-black text-gray-800">URL da Imagem</h3>
          <input
            value={banner.imagem_url || ''}
            onChange={e => setBanner({ ...banner, imagem_url: e.target.value })}
            placeholder="https://..."
            className={inputCls}
          />
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e => e.target.files?.[0] && uploadImagem(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl py-3 text-sm text-gray-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            <Upload size={16} />
            {uploading ? 'Enviando...' : 'Upload JPG/PNG/WebP — recomendado 1200×400px, máx 500KB'}
          </button>
          {banner.imagem_url && (
            <img src={banner.imagem_url} alt="Preview" className="w-full rounded-lg object-cover max-h-40" />
          )}
        </div>
      ) : (
        <>
          {/* Textos */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            <h3 className="font-black text-gray-800">Textos</h3>
            <div className="flex gap-3">
              <div className="w-16">
                <label className="text-xs text-gray-500 mb-1 block">Emoji</label>
                <input value={banner.emoji} onChange={e => setBanner({ ...banner, emoji: e.target.value })}
                  className={inputCls} maxLength={2} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Título</label>
                <input value={banner.titulo} onChange={e => setBanner({ ...banner, titulo: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subtítulo</label>
              <input value={banner.subtitulo || ''} onChange={e => setBanner({ ...banner, subtitulo: e.target.value })}
                className={inputCls} />
            </div>
          </div>

          {/* Cor */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="font-black text-gray-800 mb-3">Cor de Fundo</h3>
            <div className="flex flex-wrap gap-2">
              {CORES.map(c => (
                <button key={c.value} onClick={() => setBanner({ ...banner, cor_fundo: c.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all bg-gradient-to-r ${c.value} text-white ${
                    banner.cor_fundo === c.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cupons */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-800">Cupons</h3>
              <button onClick={addCupom}
                className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700">
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {banner.cupons.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={c.pct} onChange={e => updateCupom(i, 'pct', e.target.value)}
                    placeholder="10%" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-16 outline-none focus:border-green-500" />
                  <input value={c.desc} onChange={e => updateCupom(i, 'desc', e.target.value)}
                    placeholder="acima de R$ 500" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm flex-1 outline-none focus:border-green-500" />
                  <input value={c.code} onChange={e => updateCupom(i, 'code', e.target.value.toUpperCase())}
                    placeholder="CUPOM10" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-28 font-mono outline-none focus:border-green-500" />
                  <button onClick={() => removeCupom(i)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Preview */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="font-black text-gray-800 mb-3">Preview</h3>
        <div className={`rounded-xl bg-gradient-to-r ${banner.cor_fundo} p-6 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden`}>
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-yellow-400 opacity-10 -translate-y-1/4 translate-x-1/4" />
          <div>
            <h3 className="text-lg font-black text-white">{banner.emoji} {banner.titulo}</h3>
            {banner.subtitulo && <p className="text-green-200 text-xs mt-1 max-w-xs">{banner.subtitulo}</p>}
          </div>
          {banner.tipo === 'cupons' && banner.cupons.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {banner.cupons.map((c, i) => (
                <div key={i} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-2 text-center min-w-[80px]">
                  <div className="text-xl font-black text-yellow-400">{c.pct}</div>
                  <div className="text-[10px] text-green-200">{c.desc}</div>
                  <div className="text-[10px] font-black text-white bg-yellow-400 bg-opacity-20 px-1 rounded">{c.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Salvar */}
      <button onClick={salvar} disabled={salvando}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl disabled:opacity-50 transition-colors">
        <Save size={16} />
        {salvando ? 'Salvando...' : 'Salvar Banner'}
      </button>
    </div>
  )
}