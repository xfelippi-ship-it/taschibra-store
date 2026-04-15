'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X } from 'lucide-react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  sku?: string
}

export default function ProdutoGaleriaUpload({ images, onChange, sku }: Props) {
  const [uploading, setUploading] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const slots = 8
  const grid = Array.from({ length: slots }, (_, i) => images[i] || '')

  async function uploadSlot(file: File, idx: number) {
    if (!file.type.startsWith('image/')) return
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
      <div className="grid grid-cols-4 gap-2">
        {grid.map((url, idx) => (
          <div key={idx}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={e => { e.preventDefault(); setDragOverIdx(null); const f = e.dataTransfer.files?.[0]; if (f) uploadSlot(f, idx) }}
            className={`relative aspect-square rounded-lg border-2 transition-all ${dragOverIdx === idx ? 'border-green-500 bg-green-50' : url ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50'}`}
          >
            <input ref={el => { inputRefs.current[idx] = el }} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadSlot(f, idx) }} />
            {url ? (
              <>
                <img src={url} alt={`Img ${idx + 1}`} className="w-full h-full object-contain rounded-lg p-1" />
                <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{idx + 1}</span>
                <button onClick={() => removeSlot(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
                  <X size={10} />
                </button>
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                  {idx > 0 && <button onClick={() => moveSlot(idx, idx-1)} className="bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-black/60">←</button>}
                  {idx < grid.filter(Boolean).length - 1 && <button onClick={() => moveSlot(idx, idx+1)} className="bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-black/60">→</button>}
                </div>
              </>
            ) : (
              <button onClick={() => inputRefs.current[idx]?.click()} disabled={uploading === idx}
                className="w-full h-full flex flex-col items-center justify-center text-gray-300 hover:text-green-500 transition-colors">
                {uploading === idx
                  ? <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  : <><Upload size={18} /><span className="text-[10px] mt-1 font-medium">{idx + 1}</span></>}
              </button>
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
