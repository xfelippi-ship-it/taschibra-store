/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { registrarAuditoria } from '@/lib/auditLog'
import { Upload, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CAMPOS = [
  { id: 'name',              label: 'Nome do produto',        col: 'name' },
  { id: 'price',             label: 'Preço normal (R$)',       col: 'price' },
  { id: 'promo_price',       label: 'Preço PIX/promo (R$)',    col: 'promo_price' },
  { id: 'stock_qty',         label: 'Estoque',                 col: 'stock_qty' },
  { id: 'short_description', label: 'Descrição curta',         col: 'short_description' },
  { id: 'description',       label: 'Descrição longa',         col: 'description' },
  { id: 'category_slug',     label: 'Categoria (slug)',        col: 'category_slug' },
  { id: 'family',            label: 'Família / Linha',         col: 'family' },
  { id: 'active',            label: 'Status ativo (sim/não)',  col: 'active' },
  { id: 'badges',            label: 'Badges (separar com |)', col: 'badges' },
  { id: 'is_lancamento',     label: 'É lançamento (sim/não)', col: 'is_lancamento' },
  { id: 'weight_kg',         label: 'Peso (kg)',               col: 'weight_kg' },
  { id: 'warranty',          label: 'Garantia',                col: 'warranty' },
  { id: 'ean',               label: 'EAN / Código de barras',  col: 'ean' },
]

type Resultado = { sku: string; status: 'criado' | 'atualizado' | 'erro'; msg?: string }

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  return lines.slice(1).map(line => {
    const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

// Mapa de colunas em PT-BR para inglês
const PT_MAP: Record<string, string> = {
  nome: 'name', preco: 'price', preco_pix: 'promo_price', estoque: 'stock_qty',
  descricao_curta: 'short_description', descricao: 'description',
  categoria: 'category_slug', familia: 'family', ativo: 'active',
  lancamento: 'is_lancamento', peso_kg: 'weight_kg', garantia: 'warranty',
}

function normalizeRow(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...row }
  Object.entries(PT_MAP).forEach(([pt, en]) => {
    if (row[pt] !== undefined && row[en] === undefined) out[en] = row[pt]
  })
  return out
}

export default function ImportarTab({ meuEmail = 'admin' }: { meuEmail?: string }) {
  const [exportCategoria, setExportCategoria] = useState('')
  const [exportando, setExportando] = useState(false)
  const [categorias, setCategorias] = useState<{slug:string,name:string}[]>([])

  useEffect(() => {
    supabase.from('categories').select('slug, name').order('name').then(({data}) => {
      if (data) setCategorias(data)
    })
  }, [])
  const [categorias, setCategorias] = useState<{slug:string,name:string}[]>([])

  useEffect(() => {
    supabase.from('categories').select('slug, name').order('name').then(({data}) => {
      if (data) setCategorias(data)
    })
  }, [])
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [camposSelecionados, setCamposSelecionados] = useState<string[]>(['price', 'promo_price'])
  const [processando, setProcessando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function toggleCampo(id: string) {
    setCamposSelecionados(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function handleArquivo(file: File) {
    setArquivo(file)
    setResultados([])
    const text = await file.text()
    const rows = parseCSV(text)
    setPreview(rows.slice(0, 5))
    setHeaders(Object.keys(rows[0] || {}))
  }

  async function exportarCSV(formato: 'csv' | 'xls') {
    setExportando(true)
    let query = supabase.from('products')
      .select('sku, name, price, promo_price, stock_qty, short_description, description, category_slug, family, active, badges, is_lancamento, weight_kg, warranty, ean')
      .order('name')
    if (exportCategoria) query = query.eq('category_slug', exportCategoria)
    const { data } = await query
    if (!data) { setExportando(false); return }

    const hdrs = ['sku','nome','preco','preco_pix','estoque','descricao_curta','descricao','categoria','familia','ativo','badges','lancamento','peso_kg','garantia','ean']
    const rows = data.map((p: any) => [
      p.sku, p.name, p.price, p.promo_price, p.stock_qty,
      p.short_description || '', p.description || '',
      p.category_slug || '', p.family || '',
      p.active ? 'sim' : 'nao',
      Array.isArray(p.badges) ? p.badges.join('|') : (p.badges || ''),
      p.is_lancamento ? 'sim' : 'nao',
      p.weight_kg || '', p.warranty || '', p.ean || ''
    ])

    const sep = formato === 'csv' ? ';' : '\t'
    const mime = formato === 'csv' ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel'
    const ext = formato === 'csv' ? 'csv' : 'xls'
    const bom = formato === 'csv' ? '\uFEFF' : ''
    const content = bom + [hdrs, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(sep)).join('\n')
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taschibra-produtos-${new Date().toISOString().slice(0,10)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setExportando(false)
  }

  async function processar() {
    if (!arquivo) return
    setProcessando(true)
    setProgresso(0)
    setResultados([])
    setMostrarResultados(true)

    const text = await arquivo.text()
    const rows = parseCSV(text)
    const total = rows.length
    const res: Resultado[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = normalizeRow(rows[i])
      const sku = (row['sku'] || row['codigo'] || '').trim()
      if (!sku) { res.push({ sku: `linha ${i+2}`, status: 'erro', msg: 'SKU ausente' }); continue }

      try {
        const { data: existe } = await supabase.from('products').select('id').eq('sku', sku).maybeSingle()
        const payload: Record<string, any> = {}
        for (const campo of CAMPOS) {
          if (!camposSelecionados.includes(campo.id)) continue
          const val = (row[campo.id] || row[campo.col] || '').trim()
          if (val === '') continue
          if (['price','promo_price','weight_kg'].includes(campo.id)) {
            payload[campo.col] = parseFloat(val.replace(',', '.')) || 0
          } else if (campo.id === 'stock_qty') {
            payload[campo.col] = parseInt(val) || 0
          } else if (['active','is_lancamento'].includes(campo.id)) {
            payload[campo.col] = val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'sim'
          } else if (campo.id === 'badges') {
            payload[campo.col] = val.split('|').map((b: string) => b.trim()).filter(Boolean)
          } else {
            payload[campo.col] = val
          }
        }

        if (existe) {
          await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('sku', sku)
          res.push({ sku, status: 'atualizado' })
        } else {
          const nome = row['name'] || row['nome'] || sku
          const slug = row['slug'] || nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          await supabase.from('products').insert({
            sku, name: nome, slug,
            price: parseFloat((row['price'] || row['preco'] || '0').replace(',', '.')) || 0,
            promo_price: parseFloat((row['promo_price'] || row['preco_pix'] || '0').replace(',', '.')) || 0,
            stock_qty: parseInt(row['stock_qty'] || row['estoque'] || '0') || 0,
            active: true,
            ...payload
          })
          res.push({ sku, status: 'criado' })
        }
      } catch (e: any) {
        res.push({ sku, status: 'erro', msg: e.message || 'Erro desconhecido' })
      }

      setProgresso(Math.round(((i + 1) / total) * 100))
      setResultados([...res])
    }

    const criados = res.filter(r => r.status === 'criado').length
    const atualizados = res.filter(r => r.status === 'atualizado').length
    const erros = res.filter(r => r.status === 'erro').length
    await registrarAuditoria({
      executedBy: meuEmail,
      acao: 'importacao_csv',
      entidade: 'products',
      detalhe: `Arquivo: ${arquivo.name} | ${total} linhas | ${criados} criados | ${atualizados} atualizados | ${erros} erros`
    })
    setProcessando(false)
  }

  const criados = resultados.filter(r => r.status === 'criado').length
  const atualizados = resultados.filter(r => r.status === 'atualizado').length
  const erros = resultados.filter(r => r.status === 'erro').length

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-black text-gray-800 mb-2">Importar / Exportar Produtos</h1>
      <p className="text-sm text-gray-500 mb-6">Exporte o catálogo para conferir ou editar em massa. Reimporte para atualizar. Identificação por SKU.</p>

      {/* EXPORTAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-black text-gray-700 mb-1 text-sm uppercase tracking-wide">↓ Exportar Catálogo</h2>
        <p className="text-xs text-gray-400 mb-4">Baixe todos os produtos ou filtre por categoria. Edite no Excel e reimporte para atualizar.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Qual categoria quer exportar?</label>
            <select value={exportCategoria} onChange={e => setExportCategoria(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white">
              <option value="">Todas as categorias (exporta tudo)</option>
              {categorias.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button onClick={() => exportarCSV('csv')} disabled={exportando}
            className="border border-green-600 text-green-700 font-bold px-4 py-2 rounded-lg hover:bg-green-50 text-sm disabled:opacity-50 transition-colors">
            ↓ CSV
          </button>
          <button onClick={() => exportarCSV('xls')} disabled={exportando}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
            {exportando ? 'Exportando...' : '↓ Excel'}
          </button>
        </div>
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs font-black text-gray-400 uppercase tracking-wide">↑ Importar</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* UPLOAD */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-black text-gray-700 mb-4 text-sm uppercase tracking-wide">1. Selecione o arquivo</h2>
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
          <Upload size={32} className="mx-auto mb-3 text-gray-300" />
          {arquivo ? (
            <div>
              <p className="font-bold text-green-700">{arquivo.name}</p>
              <p className="text-sm text-gray-400">{preview.length}+ linhas detectadas</p>
            </div>
          ) : (
            <div>
              <p className="font-bold text-gray-600">Clique para selecionar o arquivo</p>
              <p className="text-sm text-gray-400 mt-1">CSV (.csv) ou Excel (.xlsx) — vírgula ou ponto-e-vírgula</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".csv,.txt,.xlsx,.xls" className="hidden"
          onChange={e => e.target.files?.[0] && handleArquivo(e.target.files[0])} />
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-black text-gray-500 uppercase mb-1">Colunas aceitas no arquivo:</p>
          <p className="text-xs text-gray-500 font-mono">sku, nome, preco, preco_pix, estoque, descricao_curta, descricao, categoria, familia, ativo, badges, lancamento, peso_kg, garantia, ean</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">📌 Nas colunas <span className="font-mono font-bold">ativo</span> e <span className="font-mono font-bold">lancamento</span>: escreva <span className="font-mono font-bold">sim</span> para verdadeiro ou <span className="font-mono font-bold">nao</span> para falso.</p>
            <p className="text-xs text-gray-500">🏷️ Na coluna <span className="font-mono font-bold">badges</span>: para colocar mais de um badge no mesmo produto, separe com o símbolo <span className="font-mono font-bold">|</span> — exemplo: <span className="font-mono font-bold">lancamento|kit</span> coloca dois badges ao mesmo tempo.</p>
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <button onClick={() => setMostrarPreview(!mostrarPreview)}
            className="w-full flex items-center justify-between text-sm font-black text-gray-700 uppercase tracking-wide">
            <span>2. Preview — {arquivo?.name}</span>
            {mostrarPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {mostrarPreview && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50">
                  {headers.map(h => <th key={h} className="px-3 py-2 text-left font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      {headers.map(h => <td key={h} className="px-3 py-2 text-gray-600 max-w-[150px] truncate">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CAMPOS */}
      {arquivo && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-black text-gray-700 mb-1 text-sm uppercase tracking-wide">3. Campos a atualizar</h2>
          <p className="text-xs text-gray-400 mb-4">Somente os campos marcados serão tocados. Campos desmarcados são ignorados mesmo que estejam no arquivo.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CAMPOS.map(campo => (
              <label key={campo.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                  camposSelecionados.includes(campo.id) ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                <input type="checkbox" className="hidden" checked={camposSelecionados.includes(campo.id)} onChange={() => toggleCampo(campo.id)} />
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${camposSelecionados.includes(campo.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                  {camposSelecionados.includes(campo.id) && <svg viewBox="0 0 10 8" className="w-2.5 h-2.5"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                </div>
                {campo.label}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <button onClick={() => setCamposSelecionados(CAMPOS.map(c => c.id))} className="text-xs font-bold text-green-600 hover:text-green-700">Selecionar todos</button>
            <span className="text-xs text-gray-300">|</span>
            <button onClick={() => setCamposSelecionados([])} className="text-xs font-bold text-gray-400 hover:text-gray-600">Limpar</button>
            <span className="text-xs text-gray-300">|</span>
            <button onClick={() => setCamposSelecionados(['price', 'promo_price'])} className="text-xs font-bold text-blue-500 hover:text-blue-700">Só preços</button>
            <span className="text-xs text-gray-300">|</span>
            <button onClick={() => setCamposSelecionados(['stock_qty'])} className="text-xs font-bold text-orange-500 hover:text-orange-700">Só estoque</button>
          </div>
        </div>
      )}

      {/* PROCESSAR */}
      {arquivo && camposSelecionados.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-black text-gray-700 mb-4 text-sm uppercase tracking-wide">4. Processar importação</h2>
          <button onClick={processar} disabled={processando}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black px-6 py-3 rounded-lg transition-colors">
            <Upload size={16} />
            {processando ? `Processando... ${progresso}%` : `Importar — ${camposSelecionados.length} campo(s)`}
          </button>
          {processando && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progresso</span><span>{progresso}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${progresso}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULTADOS */}
      {resultados.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button onClick={() => setMostrarResultados(!mostrarResultados)} className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-gray-700 uppercase tracking-wide">Relatório</span>
              <span className="flex items-center gap-1 text-sm font-bold text-green-700"><CheckCircle size={14}/> {criados} criados</span>
              <span className="flex items-center gap-1 text-sm font-bold text-blue-700"><CheckCircle size={14}/> {atualizados} atualizados</span>
              {erros > 0 && <span className="flex items-center gap-1 text-sm font-bold text-red-600"><XCircle size={14}/> {erros} erros</span>}
            </div>
            {mostrarResultados ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          {mostrarResultados && (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">SKU</th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">Resultado</th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-mono text-gray-700">{r.sku}</td>
                      <td className="px-3 py-2">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${r.status === 'criado' ? 'bg-green-100 text-green-700' : r.status === 'atualizado' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400">{r.msg || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
