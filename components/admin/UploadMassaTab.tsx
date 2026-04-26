'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, FolderArchive, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import JSZip from 'jszip'

type ResultadoItem = { identificador: string; arquivo: string; status: 'ok' | 'erro' | 'nao_encontrado'; msg?: string }

export default function UploadMassaTab() {
  const [processando, setProcessando] = useState(false)
  const [progresso, setProgresso] = useState('')
  const [resultados, setResultados] = useState<ResultadoItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const zipRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  async function processarArquivos(files: File[]) {
    const imagens = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (!imagens.length) { alert('Nenhuma imagem ou vídeo encontrado.'); return }

    setProcessando(true)
    setResultados([])
    const novos: ResultadoItem[] = []

    // Carrega produtos (sku + ean) e variações (ean + product_id) de uma vez
    setProgresso('Carregando catálogo...')
    const { data: produtos } = await supabase.from('products').select('id, sku, ean, images, main_image').not('sku', 'is', null)
    const { data: variacoes } = await (supabase.from('product_variants') as any).select('id, product_id, sku, ean').not('id', 'is', null)

    // Mapas de lookup: identificador -> produto ou variacao
    const porSku = new Map<string, any>()
    const porEanProduto = new Map<string, any>()
    const porEanVariacao = new Map<string, any>()

    for (const p of (produtos || [])) {
      if (p.sku) porSku.set(p.sku.toUpperCase(), p)
      if (p.ean) porEanProduto.set(String(p.ean).trim(), p)
    }
    for (const v of (variacoes || [])) {
      if (v.ean) porEanVariacao.set(String(v.ean).trim(), v)
    }

    let count = 0
    for (const file of imagens) {
      count++
      setProgresso(`Processando ${count}/${imagens.length}: ${file.name}`)

      const nomeSemExt = file.name.replace(/\.[^.]+$/, '')
      const match = nomeSemExt.match(/^(.+?)[-_](\d+)$/)

      if (!match) {
        novos.push({ identificador: '?', arquivo: file.name, status: 'erro', msg: 'Nome inválido — use EAN-slot.ext ou SKU-slot.ext' })
        continue
      }

      const ident = match[1].trim()
      const slot = parseInt(match[2])

      if (slot < 1 || slot > 8) {
        novos.push({ identificador: ident, arquivo: file.name, status: 'erro', msg: `Slot ${slot} inválido — use 1 a 8` })
        continue
      }

      // Detectar: EAN de variação > EAN de produto > SKU de produto
      const isVariacao = porEanVariacao.has(ident)
      const isProdutoPorEan = porEanProduto.has(ident)
      const isProdutoPorSku = porSku.has(ident.toUpperCase())

      if (!isVariacao && !isProdutoPorEan && !isProdutoPorSku) {
        novos.push({ identificador: ident, arquivo: file.name, status: 'nao_encontrado', msg: `"${ident}" não encontrado (EAN ou SKU inválido)` })
        continue
      }

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const pasta = `produtos/${ident}`
        const nome = `${pasta}/${slot}-${Date.now()}.${ext}`

        const { error } = await supabase.storage.from('midias').upload(nome, file, { upsert: true, contentType: file.type })
        if (error) throw error
        const { data: urlData } = supabase.storage.from('midias').getPublicUrl(nome)
        const url = urlData.publicUrl

        if (isVariacao) {
          // Atualiza variacao — imagens ficam no produto pai
          const vari = porEanVariacao.get(ident)
          if (slot === 1) {
            await supabase.from('products').update({ main_image: url }).eq('id', vari.product_id)
          }
          // Atualiza galeria do produto pai
          const { data: prodPai } = await supabase.from('products').select('images').eq('id', vari.product_id).single()
          const imgs: string[] = (prodPai?.images as string[]) || []
          imgs[slot - 1] = url
          await supabase.from('products').update({ images: imgs }).eq('id', vari.product_id)
        } else {
          // Atualiza produto (por EAN ou SKU)
          const prod = isProdutoPorEan ? porEanProduto.get(ident) : porSku.get(ident.toUpperCase())
          const { data: prodAtual } = await supabase.from('products').select('images').eq('id', prod.id).single()
          const imgs: string[] = (prodAtual?.images as string[]) || []
          imgs[slot - 1] = url
          const upd: any = { images: imgs }
          if (slot === 1) upd.main_image = url
          await supabase.from('products').update(upd).eq('id', prod.id)
        }

        novos.push({ identificador: ident, arquivo: file.name, status: 'ok' })
      } catch (e: any) {
        novos.push({ identificador: ident, arquivo: file.name, status: 'erro', msg: e?.message || 'Erro no upload' })
      }
    }

    setResultados(novos)
    setProgresso('')
    setProcessando(false)
  }

  async function handleZip(file: File) {
    setProcessando(true)
    setProgresso('Lendo ZIP...')
    try {
      const zip = await JSZip.loadAsync(file)
      const arquivos: File[] = []
      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue
        const ext = name.split('/').pop()?.split('.').pop()?.toLowerCase() || ''
        const nomeBase = name.split('/').pop() || name
        if (!['jpg','jpeg','png','webp','gif','mp4','webm'].includes(ext)) continue
        const blob = await entry.async('blob')
        const tipo = ['mp4','webm'].includes(ext) ? `video/${ext}` : `image/${ext === 'jpg' ? 'jpeg' : ext}`
        arquivos.push(new File([blob], nomeBase, { type: tipo }))
      }
      if (!arquivos.length) { alert('Nenhum arquivo válido no ZIP'); setProcessando(false); setProgresso(''); return }
      arquivos.sort((a, b) => a.name.localeCompare(b.name))
      await processarArquivos(arquivos)
    } catch { alert('Erro ao ler ZIP') }
    finally { setProcessando(false); setProgresso('') }
  }

  const ok = resultados.filter(r => r.status === 'ok').length
  const erros = resultados.filter(r => r.status !== 'ok').length

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Upload em Massa</h2>
      <p className="text-sm text-gray-500 mb-6">Suba imagens e vídeos para múltiplos SKUs de uma vez</p>

      {/* Instruções */}
      <details className="mb-5 bg-blue-50 border border-blue-100 rounded-xl" open>
        <summary className="cursor-pointer px-4 py-3 font-semibold text-blue-700 text-sm select-none">
          ℹ️ Como usar o Upload em Massa
        </summary>
        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 space-y-2">
          <p><strong>1. Nomeie os arquivos no formato:</strong> <code className="bg-blue-100 px-1 rounded">EAN-slot.ext</code> ou <code className="bg-blue-100 px-1 rounded">SKU-slot.ext</code></p>
          <p className="text-xs text-gray-500 ml-4">Exemplos: <code>7891234567890-1.jpg</code> · <code>7891234567890-2.jpg</code> · <code>TKL225-1.jpg</code></p>
          <p><strong>2. Slots disponíveis:</strong> 1 a 8 por produto</p>
          <p className="text-xs text-gray-500 ml-4">1-Still · 2-Lateral · 3-Verso · 4-Detalhe · 5-Ambiente · 6-Ambiente · 7-Técnico · 8-Lifestyle</p>
          <p><strong>3. Formas de envio:</strong></p>
          <ul className="list-disc list-inside ml-4 text-xs text-gray-500 space-y-1">
            <li>Arraste vários arquivos diretamente para a área abaixo</li>
            <li>Selecione vários arquivos clicando na área</li>
            <li>Comprima tudo num <strong>.zip</strong> e solte aqui — mais prático para muitos arquivos</li>
          </ul>
          <p className="text-xs text-orange-600 font-medium mt-1">⚠️ O EAN ou SKU deve existir no catálogo. Arquivos não identificados serão ignorados.</p>
        </div>
      </details>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false)
          const files = Array.from(e.dataTransfer.files)
          const zip = files.find(f => f.name.endsWith('.zip'))
          if (zip) { handleZip(zip); return }
          processarArquivos(files)
        }}
        onClick={() => !processando && imgRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'}`}
      >
        <input ref={imgRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden"
          onChange={e => { const files = Array.from(e.target.files || []); processarArquivos(files) }} />
        <input ref={zipRef} type="file" accept=".zip" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleZip(f) }} />

        {processando ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">{progresso || 'Processando...'}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Upload size={32} />
            <p className="text-sm font-medium text-gray-600">Arraste imagens/vídeos ou clique para selecionar</p>
            <p className="text-xs">Formatos: JPG · PNG · WEBP · GIF · MP4 · WEBM</p>
            <button type="button"
              onClick={e => { e.stopPropagation(); zipRef.current?.click() }}
              className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-sm font-medium mt-1">
              <FolderArchive size={16} /> ou selecione um arquivo ZIP
            </button>
          </div>
        )}
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="font-bold text-gray-700">Resultado</h3>
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle size={14} />{ok} ok</span>
            {erros > 0 && <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><XCircle size={14} />{erros} com erro</span>}
          </div>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">Arquivo</th>
                  <th className="text-left px-3 py-2">EAN / SKU</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={i} className={`border-t border-gray-50 ${r.status === 'ok' ? 'bg-white' : 'bg-red-50'}`}>
                    <td className="px-3 py-2 font-mono text-gray-600">{r.arquivo}</td>
                    <td className="px-3 py-2 font-bold text-gray-700">{r.identificador}</td>
                    <td className="px-3 py-2">
                      {r.status === 'ok'
                        ? <span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} /> Enviado</span>
                        : <span className="flex items-center gap-1 text-red-500"><AlertCircle size={12} />{r.msg}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
