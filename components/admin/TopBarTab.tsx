'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Save, Palette, Image } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TopBarTab() {
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [active, setActive] = useState(true)
  const [texto, setTexto] = useState('')
  const [subtexto, setSubtexto] = useState('')
  const [link, setLink] = useState('')
  const [tipo, setTipo] = useState<'cor' | 'imagem'>('cor')
  const [corFundo, setCorFundo] = useState('#1a5c2a')
  const [corTexto, setCorTexto] = useState('#ffffff')
  const [imagemUrl, setImagemUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('top_bar').select('*').order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) {
      const r = data[0]
      setId(r.id)
      setActive(r.active)
      setTexto(r.texto || '')
      setSubtexto(r.subtexto || '')
      setLink(r.link || '')
      setTipo(r.tipo || 'cor')
      setCorFundo(r.cor_fundo || '#1a5c2a')
      setCorTexto(r.cor_texto || '#ffffff')
      setImagemUrl(r.imagem_url || '')
    }
    setLoading(false)
  }

  async function salvar() {
    setSalvando(true)
    setMsg(null)
    const dados = { active, texto, subtexto, link, tipo, cor_fundo: corFundo, cor_texto: corTexto, imagem_url: imagemUrl }
    if (id) {
      await supabase.from('top_bar').update(dados).eq('id', id)
    } else {
      await supabase.from('top_bar').insert(dados)
    }
    setSalvando(false)
    setMsg({ tipo: 'ok', texto: 'Top Bar salva com sucesso!' })
    setTimeout(() => setMsg(null), 3000)
    carregar()
  }

  async function uploadImagem(file: File) {
    const ext = file.name.split('.').pop()
    const fileName = `topbar/topbar-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('banners').getPublicUrl(fileName)
      setImagemUrl(data.publicUrl)
    }
  }

  const previewStyle = tipo === 'imagem' && imagemUrl
    ? { backgroundImage: `url(${imagemUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', color: corTexto }
    : { backgroundColor: corFundo, color: corTexto }

  if (loading) return <div className="py-20 text-center text-gray-400 text-sm">Carregando...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <p className="text-xs font-bold text-gray-500 px-4 py-2 bg-gray-50 border-b border-gray-200 uppercase tracking-wide">Preview</p>
        {active ? (
          <div style={previewStyle} className="py-2.5 px-8 flex items-center justify-center gap-3 min-h-[38px]">
            <span className="text-sm font-bold">{texto || 'Texto da Top Bar aparece aqui'}</span>
            {subtexto && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{ backgroundColor: corTexto, color: corFundo }}>
                {subtexto}
              </span>
            )}
          </div>
        ) : (
          <div className="py-5 text-center text-sm text-gray-400 bg-gray-50">Top Bar desativada</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="text-sm font-black text-gray-800">Status</p>
              <p className="text-xs text-gray-500 mt-0.5">{active ? 'Visível no site' : 'Oculta no site'}</p>
            </div>
            <button type="button" onClick={() => setActive(!active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${active ? 'bg-green-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Texto principal</label>
            <input type="text" value={texto} onChange={e => setTexto(e.target.value)}
              placeholder="Ex: FRETE GRÁTIS acima de R$ 199"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Subtexto / Cupom <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="text" value={subtexto} onChange={e => setSubtexto(e.target.value)}
              placeholder="Ex: USE: FRETETASCHIBRA"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Link ao clicar <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="text" value={link} onChange={e => setLink(e.target.value)}
              placeholder="Ex: /produtos?categoria=outlet"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Tipo de fundo</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTipo('cor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${tipo === 'cor' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                <Palette size={16} /> Cor sólida
              </button>
              <button type="button" onClick={() => setTipo('imagem')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${tipo === 'imagem' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                <Image size={16} /> Imagem
              </button>
            </div>
          </div>
          {tipo === 'cor' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Cor de fundo</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={corFundo} onChange={e => setCorFundo(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={corFundo} onChange={e => setCorFundo(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['#000000','#1a5c2a','#166534','#1d4ed8','#dc2626','#ff6b00'].map(cor => (
                    <button key={cor} type="button" onClick={() => setCorFundo(cor)}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: cor }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Cor do texto</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={corTexto} onChange={e => setCorTexto(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={corTexto} onChange={e => setCorTexto(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['#ffffff','#f0fdf4','#fef9c3','#000000'].map(cor => (
                    <button key={cor} type="button" onClick={() => setCorTexto(cor)}
                      className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: cor }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Imagem de fundo</label>
              <p className="text-xs text-gray-500 mb-2">Recomendado: <strong>1920×50px</strong>, PNG ou JPG</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadImagem(e.target.files[0])} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl py-6 text-sm text-gray-500 flex flex-col items-center gap-2">
                <Image size={22} /> Clique para fazer upload
              </button>
              {imagemUrl && <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <img src={imagemUrl} alt="preview" className="w-full h-12 object-cover" />
              </div>}
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-lg font-bold ${msg.tipo === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.texto}
        </div>
      )}

      <button type="button" onClick={salvar} disabled={salvando}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
        <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Top Bar'}
      </button>
    </div>
  )
}
