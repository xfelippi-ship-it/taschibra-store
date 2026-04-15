'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Download, Upload, X } from 'lucide-react'

interface UploadProps {
  value: string
  onChange: (url: string) => void
  sku?: string
}

export function ProdutoDatasheetUpload({ value, onChange, sku }: UploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadPDF(file: File) {
    if (file.type !== 'application/pdf') { alert('Apenas arquivos PDF'); return }
    setUploading(true)
    try {
      const prefix = sku ? `datasheets/${sku}` : 'datasheets'
      const nome = `${prefix}-${Date.now()}.pdf`
      const { error } = await supabase.storage.from('midias').upload(nome, file, { upsert: true, contentType: 'application/pdf' })
      if (error) throw error
      const { data } = supabase.storage.from('midias').getPublicUrl(nome)
      onChange(data.publicUrl)
    } catch { alert('Erro no upload do PDF') }
    finally { setUploading(false) }
  }

  return (
    <div>
      <label className="text-sm font-bold text-gray-700 mb-1 block">
        Ficha Técnica / Manual
        <span className="text-xs font-normal text-gray-400 ml-2">PDF</span>
      </label>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadPDF(f) }} />
      {value ? (
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
          <FileText size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate flex-1">PDF cadastrado</span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-bold">Ver</a>
          <button onClick={() => onChange('')} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-full flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors disabled:opacity-50">
          {uploading ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <Upload size={15} />}
          {uploading ? 'Enviando PDF...' : 'Upload ficha técnica (PDF)'}
        </button>
      )}
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Ou cole uma URL de PDF aqui..."
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-400 outline-none focus:border-green-500 mt-1.5" />
    </div>
  )
}

interface DownloadProps {
  url: string
  nomeProduto?: string
}

export function ProdutoDatasheetDownload({ url, nomeProduto }: DownloadProps) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-colors w-full">
      <FileText size={16} className="text-red-500 flex-shrink-0" />
      <span className="flex-1">Ficha Técnica / Manual</span>
      <Download size={15} className="text-gray-400" />
    </a>
  )
}
