'use client'
import { useState, useEffect, useRef } from 'react'
import { Save, Palette, Image } from 'lucide-react'
import { registrarAuditoria } from '@/lib/auditLog'
import { supabase } from '@/lib/supabase'


type TopBarConfig = {
  id?: string
  active: boolean | null
  texto: string
  subtexto: string
  link: string
  tipo: 'cor' | 'imagem'
  cor_fundo: string
  cor_texto: string
  imagem_url: string
}

const configVazia: TopBarConfig = {
  active: true, texto: '', subtexto: '', link: '',
  tipo: 'cor', cor_fundo: '#1a5c2a', cor_texto: '#ffffff', imagem_url: ''
}

export default function TopBarTab() {
  const [config, setConfig] = useState<TopBarConfig>(configVazia)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('top_bar').select('*').order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) {
      const r = data[0]
      setConfig({
        id: r.id,
        active: r.active,
        texto: r.texto || '',
        subtexto: r.subtexto || '',
        link: r.link || '',
        tipo: (r.tipo as 'cor' | 'imagem') || 'cor',
        cor_fundo: r.cor_fundo || '#1a5c2a',
        cor_texto: r.cor_texto || '#ffffff',
        imagem_url: r.imagem_url || ''
      })
    }
    setLoading(false)
  }

  async function salvar() {
    setSalvando(true)
    setMsg(null)
    const dados = {
      active: config.active,
      texto: config.texto,
      subtexto: config.subtexto,
      link: config.link,
      tipo: config.tipo,
      cor_fundo: config.cor_fundo,
      cor_texto: config.cor_texto,
      imagem_url: config.imagem_url
    }
    if (config.id) {
      await supabase.from('top_bar').update(dados).eq('id', config.id)
      await registrarAuditoria({ executedBy: 'admin', acao: 'topbar_editada', entidade: 'top_bar', detalhe: `Texto: ${dados.texto || '-'}` })
    } else {
      await supabase.from('top_bar').insert(dados)
      await registrarAuditoria({ executedBy: 'admin', acao: 'topbar_criada', entidade: 'top_bar', detalhe: `Texto: ${dados.texto || '-'}` })
    }
    setSalvando(false)
    setMsg({ tipo: 'ok', texto: 'Top Bar salva com sucesso!' })
    setTimeout(() => setMsg(null), 3000)
  }

  async function uploadImagem(file: File) {
    const ext = file.name.split('.').pop()
    const fileName = `topbar/topbar-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('banners').getPublicUrl(fileName)
      setConfig({ ...config, imagem_url: data.publicUrl })
    }
  }

  const previewStyle = config.tipo === 'imagem' && config.imagem_url
    ? { backgroundImage: `url(${config.imagem_url})`, backgroundSize: 'cover', backgroundPosition: 'center', color: config.cor_texto }
    : { backgroundColor: config.cor_fundo, color: config.cor_texto }

  if (loading) return <div className="py-20 text-center text-gray-400 text-sm">Carregando...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <p className="text-xs font-bold text-gray-500 px-4 py-2 bg-gray-50 border-b border-gray-200 uppercase tracking-wide">Preview</p>
        {config.active ? (
          <div style={previewStyle} className="py-2.5 px-8 flex items-center justify-center gap-3 min-h-[38px]">
            <span className="text-sm font-bold">{config.texto || 'Texto da Top Bar aparece aqui'}</span>
            {config.subtexto && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{ backgroundColor: config.cor_texto, color: config.cor_fundo }}>
                {config.subtexto}
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
              <p className="text-xs text-gray-500 mt-0.5">{config.active ? 'Visível no site' : 'Oculta no site'}</p>
            </div>
            <button type="button" onClick={() => setConfig({ ...config, active: !config.active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${config.active ? 'bg-green-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.active ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Texto principal</label>
            <input type="text" value={config.texto} onChange={e => setConfig({ ...config, texto: e.target.value })}
              placeholder="Ex: FRETE GRÁTIS acima de R$ 199"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Subtexto / Cupom <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="text" value={config.subtexto} onChange={e => setConfig({ ...config, subtexto: e.target.value })}
              placeholder="Ex: USE: FRETETASCHIBRA"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Link ao clicar <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="text" value={config.link} onChange={e => setConfig({ ...config, link: e.target.value })}
              placeholder="Ex: /produtos?categoria=outlet"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Tipo de fundo</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfig({ ...config, tipo: 'cor' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${config.tipo === 'cor' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                <Palette size={16} /> Cor sólida
              </button>
              <button type="button" onClick={() => setConfig({ ...config, tipo: 'imagem' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${config.tipo === 'imagem' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                <Image size={16} /> Imagem
              </button>
            </div>
          </div>
          {config.tipo === 'cor' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Cor de fundo</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config.cor_fundo} onChange={e => setConfig({ ...config, cor_fundo: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={config.cor_fundo} onChange={e => setConfig({ ...config, cor_fundo: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['#000000','#1a5c2a','#166534','#1d4ed8','#dc2626','#ff6b00'].map(cor => (
                    <button key={cor} type="button" onClick={() => setConfig({ ...config, cor_fundo: cor })}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: cor }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Cor do texto</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config.cor_texto} onChange={e => setConfig({ ...config, cor_texto: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={config.cor_texto} onChange={e => setConfig({ ...config, cor_texto: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['#ffffff','#f0fdf4','#fef9c3','#000000'].map(cor => (
                    <button key={cor} type="button" onClick={() => setConfig({ ...config, cor_texto: cor })}
                      className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: cor }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Imagem de fundo</label>
              <p className="text-xs text-gray-500 mb-2">Recomendado: <strong>1920x50px</strong>, PNG ou JPG</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadImagem(e.target.files[0])} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl py-6 text-sm text-gray-500 flex flex-col items-center gap-2">
                <Image size={22} /> Clique para fazer upload
              </button>
              {config.imagem_url && <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <img src={config.imagem_url} alt="preview" className="w-full h-12 object-cover" />
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
