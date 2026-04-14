'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Trash2, ImageIcon, Plus } from 'lucide-react'

type ProdutoImg = {
  id: string
  product_id: string
  url: string
  alt_text: string
  sort_order: number
  is_main: boolean
  created_at: string
}

export default function FotosTab({ produtoId }: { produtoId: string }) {
  const [imagens, setImagens] = useState<ProdutoImg[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [msg, setMsg] = useState<{ text: string; tipo: 'ok' | 'erro' } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (produtoId) carregar() }, [produtoId])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('product_images')
      .select('id,product_id,url,alt_text,sort_order,is_main,created_at')
      .eq('product_id', produtoId)
      .order('sort_order')
    setImagens((data as ProdutoImg[]) || [])
    setLoading(false)
  }

  function toast(text: string, tipo: 'ok' | 'erro' = 'ok') {
    setMsg({ text, tipo })
    setTimeout(() => setMsg(null), 3000)
  }

  async function uploadArquivos(files: FileList | File[]) {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    setUploading(true)
    let ok = 0
    for (const file of arr) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const nome = `produtos/${produtoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('midias')
          .upload(nome, file, { upsert: false, contentType: file.type })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('midias').getPublicUrl(nome)
        const novaOrdem = imagens.length + ok + 1
        await supabase.from('product_images').insert({
          product_id: produtoId,
          url: urlData.publicUrl,
          alt_text: '',
          sort_order: novaOrdem,
          is_main: ok === 0 && imagens.length === 0,
        })
        ok++
      } catch { /* continua */ }
    }
    setUploading(false)
    toast(`${ok} imagem(ns) adicionada(s)!`)
    carregar()
  }

  async function adicionarUrl() {
    const url = urlRef.current?.value?.trim()
    if (!url) return
    await supabase.from('product_images').insert({
      product_id: produtoId,
      url,
      alt_text: '',
      sort_order: imagens.length + 1,
      is_main: imagens.length === 0,
    })
    if (urlRef.current) urlRef.current.value = ''
    toast('Imagem adicionada!')
    carregar()
  }

  async function atualizarCampo(id: string, campo: 'alt_text' | 'sort_order' | 'is_main', valor: string | number | boolean) {
    const update: Partial<ProdutoImg> = { [campo]: valor } as Partial<ProdutoImg>
    await supabase.from('product_images').update(update).eq('id', id)
    setImagens(prev => prev.map(i => i.id === id ? { ...i, [campo]: valor } : i))
  }

  async function excluir(img: ProdutoImg) {
    if (!confirm('Excluir esta imagem?')) return
    await supabase.from('product_images').delete().eq('id', img.id)
    try {
      const path = img.url.split('/midias/')[1]
      if (path) await supabase.storage.from('midias').remove([path])
    } catch { /* ignora erro de storage */ }
    toast('Imagem removida.')
    carregar()
  }

  async function mover(img: ProdutoImg, dir: 'up' | 'down') {
    const idx = imagens.findIndex(i => i.id === img.id)
    const outro = dir === 'up' ? imagens[idx - 1] : imagens[idx + 1]
    if (!outro) return
    await Promise.all([
      supabase.from('product_images').update({ sort_order: outro.sort_order }).eq('id', img.id),
      supabase.from('product_images').update({ sort_order: img.sort_order }).eq('id', outro.id),
    ])
    carregar()
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg ${
          msg.tipo === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>{msg.text}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-gray-800">Fotos do Produto</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {imagens.length} foto(s) — mínimo recomendado: 3
          </p>
        </div>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg">
          <Plus size={15} /> Adicionar fotos
        </button>
      </div>

      {/* Drop zone */}
      <input type="file" ref={fileRef} multiple accept="image/*" className="hidden"
        onChange={e => { if (e.target.files) uploadArquivos(e.target.files) }} />
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) uploadArquivos(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
            <span className="text-sm text-gray-500 font-semibold">Enviando imagens...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={26} className="text-gray-300" />
            <p className="text-sm font-bold text-gray-500">Arraste várias fotos ou clique para selecionar</p>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP — múltiplos arquivos de uma vez</p>
          </div>
        )}
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
        <p className="font-black text-blue-800 mb-1">📋 Boas práticas de foto</p>
        <p>• <strong>1ª foto:</strong> produto isolado, fundo branco ou cinza — será a imagem principal</p>
        <p>• <strong>2ª foto:</strong> embalagem original do produto</p>
        <p>• <strong>3ª foto:</strong> produto instalado ou em ambiente real</p>
        <p>• <strong>4ª foto:</strong> diagrama técnico com dimensões</p>
        <p>• Resolução mínima recomendada: 800×800px — formato quadrado (1:1)</p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
      ) : imagens.length === 0 ? (
        <div className="text-center py-10 text-gray-300">
          <ImageIcon size={40} className="mx-auto mb-2" />
          <p className="text-sm font-semibold">Nenhuma foto adicionada.</p>
          <p className="text-xs mt-1">Adicione ao menos 3 fotos para melhorar a conversão.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {imagens.map((img, idx) => (
            <div key={img.id} className={`bg-white border rounded-xl p-4 flex gap-4 ${
              img.is_main ? 'border-green-400 bg-green-50/30' : 'border-gray-200'
            }`}>
              {/* Ordem */}
              <div className="flex flex-col items-center justify-center gap-1 w-6">
                <button onClick={() => mover(img, 'up')} disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-base">▲</button>
                <span className="text-xs font-black text-gray-400">{idx + 1}</span>
                <button onClick={() => mover(img, 'down')} disabled={idx === imagens.length - 1}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-base">▼</button>
              </div>

              {/* Preview */}
              <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                <img src={img.url} alt={img.alt_text || 'Foto'} className="w-full h-full object-contain p-1"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>

              {/* Campos */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={img.is_main}
                      onChange={e => atualizarCampo(img.id, 'is_main', e.target.checked)}
                      className="w-3.5 h-3.5 accent-green-600" />
                    <span className="text-xs font-bold text-gray-600">Imagem principal</span>
                  </label>
                  {img.is_main && (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
                <input
                  value={img.alt_text || ''}
                  onChange={e => atualizarCampo(img.id, 'alt_text', e.target.value)}
                  placeholder="Texto alternativo / legenda (Ex: Vista frontal)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-300 font-mono truncate">{img.url}</p>
              </div>

              {/* Deletar */}
              <div className="flex items-center">
                <button onClick={() => excluir(img)}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar por URL */}
      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-black text-gray-600 mb-2">Ou adicionar por URL</p>
        <div className="flex gap-2">
          <input ref={urlRef} type="text" placeholder="https://..."
            onKeyDown={e => e.key === 'Enter' && adicionarUrl()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
          <button onClick={adicionarUrl}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
