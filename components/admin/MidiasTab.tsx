'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Produto {
  id: string
  sku: string
  ean: string
  name: string
  slug: string
  active: boolean
  category_slug: string
  tipo: 'pai' | 'simples'
  main_image: string | null
  img_status: string
  slots: (string | null)[]
  filhos: any[]
}
interface Summary { total_ativos: number; com_imagem: number; sem_imagem: number }

export default function MidiasTab({ onEditarProduto }: { onEditarProduto?: (sku: string) => void }) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [summary, setSummary] = useState<Summary>({ total_ativos: 0, com_imagem: 0, sem_imagem: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [ativo, setAtivo] = useState('')
  const [tipo, setTipo] = useState('')
  const [categorias, setCategorias] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    supabase.from('categories').select('slug, name').order('name').then(({ data }) => {
      setCategorias(data || [])
    })
  }, [])

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (search)   params.set('search', search)
    if (status)   params.set('status', status)
    if (category) params.set('category', category)
    if (ativo)    params.set('ativo', ativo)
    if (tipo)     params.set('tipo', tipo)
    const res = await fetch('/api/admin/midias?' + params.toString())
    const json = await res.json()
    setProdutos(json.data || [])
    setTotal(json.total || 0)
    setSummary(json.summary || { total_ativos: 0, com_imagem: 0, sem_imagem: 0 })
    setLoading(false)
  }, [search, status, category, ativo, tipo])

  useEffect(() => { setPage(1); fetchData(1) }, [search, status, category, ativo, tipo])
  useEffect(() => { fetchData(page) }, [page])

  const exportar = async (formato: 'xlsx' | 'csv') => {
    setExportando(true)
    const params = new URLSearchParams({ exportar: formato })
    if (search)   params.set('search', search)
    if (status)   params.set('status', status)
    if (category) params.set('category', category)
    if (ativo)    params.set('ativo', ativo)
    if (tipo)     params.set('tipo', tipo)
    const res = await fetch('/api/admin/midias/export?' + params.toString())
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'midias_' + new Date().toISOString().slice(0, 10) + '.' + formato
    a.click()
    URL.revokeObjectURL(url)
    setExportando(false)
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Mídias</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de imagens dos produtos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportar('xlsx')} disabled={exportando}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            ↓ XLSX
          </button>
          <button onClick={() => exportar('csv')} disabled={exportando}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            ↓ CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total ativos</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.total_ativos.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-green-600 mb-1">Com imagem</p>
          <p className="text-2xl font-semibold text-green-700">{summary.com_imagem.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-red-500 mb-1">Sem imagem</p>
          <p className="text-2xl font-semibold text-red-600">{summary.sem_imagem.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input type="text" placeholder="Buscar nome, SKU ou EAN..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">Status imagem</option>
          <option value="com_imagem">Com imagem</option>
          <option value="sem_imagem">Sem imagem</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">Categoria</option>
          {categorias.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={ativo} onChange={e => setAtivo(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">Ativo/Inativo</option>
          <option value="true">Somente ativos</option>
          <option value="false">Somente inativos</option>
        </select>
        <select value={tipo} onChange={e => setTipo(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none">
          <option value="">Tipo</option>
          <option value="pai">Produto pai</option>
          <option value="simples">Simples</option>
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-16">Capa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-28">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-36">EAN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nome</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-20">Tipo</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-44">Fotos (8 slots)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-20">Ativo</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-24">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Carregando...</td></tr>
              )}
              {!loading && produtos.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Nenhum produto encontrado</td></tr>
              )}
              {!loading && produtos.map(p => (
                <ProdutoRow key={p.sku} produto={p} onEditar={onEditarProduto} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {total.toLocaleString('pt-BR')} produtos — página {page} de {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
              ← Anterior
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
              Próxima →
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 border border-green-400 inline-block"></span>Com imagem</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 border border-red-400 inline-block"></span>Sem imagem</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-300 inline-block"></span>Slot vazio</span>
      </div>
    </div>
  )
}

function SlotsBar({ slots }: { slots: (string | null)[] }) {
  const s = [...slots]
  while (s.length < 8) s.push(null)
  const ocupados = s.filter(Boolean).length
  return (
    <div>
      <div className="flex gap-1 justify-center">
        {s.slice(0, 8).map((url, i) => (
          <div key={i} title={url || 'Slot vazio'}
            className={['w-4 h-4 rounded', url ? 'bg-green-200 border border-green-400' : 'bg-gray-100 border border-gray-200'].join(' ')}
          />
        ))}
      </div>
      <p className={'text-center mt-1 text-[10px] ' + (ocupados === 0 ? 'text-red-500' : 'text-gray-400')}>
        {ocupados} / 8
      </p>
    </div>
  )
}

function ProdutoRow({ produto: p, onEditar }: { produto: Produto; onEditar?: (sku: string) => void }) {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-2">
        <div className={['w-12 h-12 rounded-lg border overflow-hidden flex items-center justify-center',
          p.main_image ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'].join(' ')}>
          {p.main_image
            ? <img src={p.main_image} alt={p.name} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : <span className="text-red-300 text-lg">✕</span>
          }
        </div>
      </td>
      <td className="px-4 py-2 text-xs text-gray-500 font-mono">{p.sku}</td>
      <td className="px-4 py-2 text-xs text-gray-500 font-mono">{p.ean || '—'}</td>
      <td className="px-4 py-2 text-gray-800 max-w-xs truncate" title={p.name}>{p.name}</td>
      <td className="px-4 py-2 text-center">
        {p.tipo === 'pai'
          ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Pai</span>
          : <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Simples</span>
        }
      </td>
      <td className="px-4 py-2">
        {p.tipo === 'pai'
          ? <p className="text-[11px] text-gray-400 text-center">via derivações</p>
          : <SlotsBar slots={p.slots} />
        }
      </td>
      <td className="px-4 py-2 text-center">
        <span className={'text-[11px] px-2 py-0.5 rounded-full ' + (p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
          {p.active ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td className="px-4 py-2 text-center">
        <button onClick={() => onEditar?.(p.sku)}
          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          Editar
        </button>
      </td>
    </tr>
  )
}