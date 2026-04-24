'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, FolderArchive } from 'lucide-react'
import JSZip from 'jszip'
import { detectMediaType, getYouTubeThumbnail } from '@/lib/media-helpers'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  sku?: string
}

export default function ProdutoGaleriaUpload({ images, onChange, sku }: Props) {
  const [uploading, setUploading] = useState<number | null>(null)
  const [uploadingZip, setUploadingZip] = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [dragOverZone, setDragOverZone] = useState(false)
  const [progress, setProgress] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const multiInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const slots = 8
  const grid = Array.from({ length: slots }, (_, i) => images[i] || '')

  async function uploadSlot(file: File, idx: number) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return
    setUploading(idx)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const prefix = sku ? `produtos/${sku}` : 'produtos'
      const nome = `${prefix}/${idx + 1}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('midias').upload(nome, file, { upsert: true, contentType: file.type })
      if (error) throw error
      const { data } = supabase.storage.from('midias').getPublicUrl(nome)
      const novo = [...grid]
      novo[idx] = data.publicUrl
      onChange(novo.filter(Boolean))
    } catch { alert('Erro no upload') }
    finally { setUploading(null) }
  }

  async function uploadMultiplos(files: File[]) {
    const imgs = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (!imgs.length) return
    setUploadingZip(true)
    const prefix = sku ? `produtos/${sku}` : 'produtos'
    const novoGrid = [...grid]
    let slotIdx = novoGrid.findIndex(v => !v)
    if (slotIdx === -1) slotIdx = 0
    let count = 0
    for (const file of imgs) {
      if (slotIdx >= slots) break
      setProgress(`Subindo ${++count}/${imgs.length}...`)
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const nome = `${prefix}/${slotIdx + 1}-${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('midias').upload(nome, file, { upsert: true, contentType: file.type })
        if (error) throw error
        const { data } = supabase.storage.from('midias').getPublicUrl(nome)
        novoGrid[slotIdx] = data.publicUrl
        slotIdx++
      } catch { /* pula arquivo com erro */ }
    }
    onChange(novoGrid.filter(Boolean))
    setProgress('')
    setUploadingZip(false)
  }

  async function handleZip(file: File) {
    if (!file.name.endsWith('.zip')) return
    setUploadingZip(true)
    setProgress('Lendo ZIP...')
    try {
      const zip = await JSZip.loadAsync(file)
      const arquivos: File[] = []
      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue
        const ext = name.split('.').pop()?.toLowerCase() || ''
        if (!['jpg','jpeg','png','webp','gif'].includes(ext)) continue
        const blob = await entry.async('blob')
        arquivos.push(new File([blob], name, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` }))
      }
      if (!arquivos.length) { alert('Nenhuma imagem encontrada no ZIP'); setUploadingZip(false); setProgress(''); return }
      arquivos.sort((a, b) => a.name.localeCompare(b.name))
      await uploadMultiplos(arquivos)
    } catch { alert('Erro ao ler ZIP') }
    finally { setUploadingZip(false); setProgress('') }
  }

  function removeSlot(idx: number) {
    const novo = [...grid]
    novo[idx] = ''
    onChange(novo.filter(Boolean))
  }

  function moveSlot(from: number, to: number) {
    if (to < 0 || to >= slots) return
    const novo = [...grid]
    ;[novo[from], novo[to]] = [novo[to], novo[from]]
    onChange(novo.filter(Boolean))
  }

  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-2 block">
        Galeria de Imagens
        <span className="text-xs font-normal text-gray-400 ml-2">até 8 fotos · arraste para reordenar</span>
      </label>

      {/* Instruções para o operador */}
      <details className="mb-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg">
        <summary className="cursor-pointer px-3 py-2 font-medium text-blue-600 select-none">
          ℹ️ Como subir imagens e vídeos
        </summary>
        <ul className="px-4 pb-3 pt-1 space-y-1 list-disc list-inside text-gray-600">
          <li><strong>1 arquivo:</strong> clique no slot desejado (1 a 8) e selecione o arquivo</li>
          <li><strong>Várias fotos de uma vez:</strong> arraste múltiplos arquivos para a área abaixo ou clique nela</li>
          <li><strong>ZIP deste produto:</strong> arraste um .zip com as fotos — o sistema descompacta e preenche os slots em ordem alfabética</li>
          <li><strong>URL externa:</strong> cole no campo "Cole URL..." e pressione Enter — aceita imagens, vídeos diretos (.mp4/.webm) e links do <strong>YouTube</strong> ou <strong>Vimeo</strong> (rodam embutidos no site)</li>
          <li><strong>Vídeo:</strong> arraste arquivos .mp4 ou .webm, OU cole o link de um vídeo do YouTube/Vimeo no campo "Cole URL..."</li>
          <li><strong>Reordenar:</strong> use as setas ← → abaixo de cada imagem para mudar a ordem</li>
          <li><strong>Nomenclatura:</strong> não precisa renomear — o sistema usa o EAN do produto automaticamente</li>
        </ul>
      </details>

      {/* Drop zone múltiplo */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOverZone(true) }}
        onDragLeave={() => setDragOverZone(false)}
        onDrop={e => {
          e.preventDefault(); setDragOverZone(false)
          const files = Array.from(e.dataTransfer.files)
          const zip = files.find(f => f.name.endsWith('.zip'))
          if (zip) { handleZip(zip); return }
          uploadMultiplos(files)
        }}
        onClick={() => !uploadingZip && multiInputRef.current?.click()}
        className={`mb-3 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${dragOverZone ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'}`}
      >
        <input ref={multiInputRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden"
          onChange={e => { const files = Array.from(e.target.files || []); uploadMultiplos(files) }} />
        <input ref={zipInputRef} type="file" accept=".zip" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleZip(f) }} />
        {uploadingZip ? (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm py-1">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            {progress || 'Processando...'}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 text-gray-400 text-xs py-1">
            <div className="flex items-center gap-1"><Upload size={14} /><span>Arraste várias fotos aqui</span></div>
            <span className="text-gray-200">|</span>
            <button type="button" onClick={e => { e.stopPropagation(); zipInputRef.current?.click() }}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium">
              <FolderArchive size={14} /><span>ou solte um ZIP</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid de slots */}
      <div className="grid grid-cols-4 gap-2">
        {grid.map((url, idx) => (
          <div key={idx}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={e => { e.preventDefault(); setDragOverIdx(null); const f = e.dataTransfer.files?.[0]; if (f) uploadSlot(f, idx) }}
            className={`relative aspect-square rounded-lg border-2 transition-all ${dragOverIdx === idx ? 'border-green-500 bg-green-50' : url ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50'}`}
          >
            <input ref={el => { inputRefs.current[idx] = el }} type="file" accept="image/*,video/mp4,video/webm" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadSlot(f, idx) }} />
            {url ? (
              <>
                {(() => {
                  const tipo = detectMediaType(url)
                  if (tipo === 'youtube') {
                    const thumb = getYouTubeThumbnail(url)
                    return (
                      <>
                        {thumb && <img src={thumb} alt={`Vídeo ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">YouTube</span>
                      </>
                    )
                  }
                  if (tipo === 'vimeo') {
                    return (
                      <>
                        <div className="w-full h-full flex items-center justify-center bg-cyan-50 rounded-lg">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="#1ab7ea"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-cyan-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Vimeo</span>
                      </>
                    )
                  }
                  if (tipo === 'video') {
                    return (
                      <>
                        <video src={url} className="w-full h-full object-contain rounded-lg p-1" muted />
                        <span className="absolute bottom-1 right-1 bg-gray-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Vídeo</span>
                      </>
                    )
                  }
                  return <img src={url} alt={`Img ${idx + 1}`} className="w-full h-full object-contain rounded-lg p-1" />
                })()}
                <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{idx + 1}</span>
                <button type="button" onClick={() => removeSlot(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
                  <X size={10} />
                </button>
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                  {idx > 0 && <button type="button" onClick={() => moveSlot(idx, idx-1)} className="bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-black/60">←</button>}
                  {idx < grid.filter(Boolean).length - 1 && <button type="button" onClick={() => moveSlot(idx, idx+1)} className="bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-black/60">→</button>}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                <button type="button" onClick={() => inputRefs.current[idx]?.click()} disabled={uploading === idx}
                  className="flex-1 flex flex-col items-center justify-center text-gray-300 hover:text-green-500 transition-colors">
                  {uploading === idx
                    ? <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    : <><Upload size={18} /><span className="text-[10px] mt-1 font-medium">{idx + 1}</span></>}
                </button>
                <input
                  type="text"
                  placeholder="Cole URL..."
                  className="w-full text-[9px] px-1 py-0.5 border-t border-gray-100 text-gray-500 outline-none focus:text-green-600 bg-transparent text-center truncate"
                  onClick={e => e.stopPropagation()}
                  onBlur={e => {
                    const val = e.target.value.trim()
                    if (val) {
                      const novo = [...grid]
                      novo[idx] = val
                      onChange(novo.filter(Boolean))
                      e.target.value = ''
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val) {
                        const novo = [...grid]
                        novo[idx] = val
                        onChange(novo.filter(Boolean))
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        1-Still · 2-Lateral · 3-Detalhe · 4-Embalagem · 5-Ambiente · 6-Ambiente · 7-Técnico · 8-Lifestyle
      </p>
    </div>
  )
}
