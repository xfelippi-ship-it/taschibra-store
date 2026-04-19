'use client'
import { useState } from 'react'
import { TrendingDown, TrendingUp, Minus, ExternalLink, AlertTriangle } from 'lucide-react'
import { Snapshot, Competitor, SOURCES, fmt } from './index'

interface Props {
  snapshots: Snapshot[]
  competitors: Competitor[]
  loading: boolean
}

export default function PainelPrecos({ snapshots, competitors, loading }: Props) {
  const [skuFiltro, setSkuFiltro] = useState('')
  const [sourceFiltro, setSourceFiltro] = useState('todos')

  const skusUnicos = [...new Set(snapshots.map(s => s.sku))]

  const resumoPorSku = skusUnicos.map(sku => {
    const itens = snapshots.filter(s => s.sku === sku)
    const comp = competitors.find(c => c.sku === sku)
    const mapPrice = comp?.map_price

    const porSource = SOURCES.map(src => {
      const srcItens = itens.filter(s => s.source === src.id)
      if (!srcItens.length) return null
      const precos = srcItens.map(s => s.price).filter(p => p > 0)
      if (!precos.length) return null
      return {
        source: src.id, label: src.label, cor: src.cor,
        min: Math.min(...precos),
        max: Math.max(...precos),
        avg: precos.reduce((a, b) => a + b, 0) / precos.length,
        count: srcItens.length,
        ultimo: srcItens[0],
      }
    }).filter(Boolean)

    const todosPrecos = itens.map(s => s.price).filter(p => p > 0)
    if (!todosPrecos.length) return null

    const minPreco = Math.min(...todosPrecos)
    const violacaoMAP = mapPrice && minPreco < mapPrice

    return {
      sku,
      product_name: itens[0]?.title || comp?.product_name || sku,
      min: minPreco,
      max: Math.max(...todosPrecos),
      avg: todosPrecos.reduce((a, b) => a + b, 0) / todosPrecos.length,
      mapPrice,
      violacaoMAP,
      porSource,
      total: itens.length,
      ultimo: itens[0]?.captured_at,
    }
  }).filter(Boolean).filter(r => {
    if (!r) return false
    if (skuFiltro && !r.sku.toLowerCase().includes(skuFiltro.toLowerCase()) &&
        !r.product_name.toLowerCase().includes(skuFiltro.toLowerCase())) return false
    if (sourceFiltro !== 'todos' && !r.porSource.some((ps: any) => ps?.source === sourceFiltro)) return false
    return true
  }) as NonNullable<ReturnType<typeof skusUnicos.map>[0]>[]

  const totalViolacoes = resumoPorSku.filter((r: any) => r.violacaoMAP).length

  return (
    <div className="space-y-3">
      {/* Alerta MAP global */}
      {totalViolacoes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">
              {totalViolacoes} produto{totalViolacoes > 1 ? 's' : ''} com violação de MAP
            </p>
            <p className="text-xs text-red-500">Preço de mercado abaixo do preço mínimo autorizado</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3">
        <input value={skuFiltro} onChange={e => setSkuFiltro(e.target.value)}
          placeholder="Buscar por SKU ou nome..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
        <select value={sourceFiltro} onChange={e => setSourceFiltro(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-500">
          <option value="todos">Todos os canais</option>
          {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Carregando dados...</div>
      ) : resumoPorSku.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingDown size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhum dado de preço ainda.</p>
          <p className="text-xs mt-1">Configure os SKUs na aba Configurar SKUs e aguarde a próxima execução do N8n.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">SKU / Produto</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">MAP</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Menor preço</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Média</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Maior preço</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Por canal</th>
              </tr>
            </thead>
            <tbody>
              {(resumoPorSku as any[]).map((r: any) => (
                <tr key={r.sku} className={`border-b border-gray-100 hover:bg-gray-50 ${r.violacaoMAP ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {r.violacaoMAP && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                      <div>
                        <p className="font-bold text-gray-800 text-xs font-mono">{r.sku}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{r.product_name}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{r.total} registros</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {r.mapPrice
                      ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.violacaoMAP ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          R$ {fmt(r.mapPrice)}
                        </span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-black text-sm ${r.violacaoMAP ? 'text-red-600' : 'text-green-700'}`}>
                      R$ {fmt(r.min)}
                    </span>
                    <TrendingDown size={12} className={`inline ml-1 ${r.violacaoMAP ? 'text-red-400' : 'text-green-500'}`} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-gray-700 font-bold text-sm">R$ {fmt(r.avg)}</span>
                    <Minus size={12} className="inline ml-1 text-gray-400" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-gray-600 font-black text-sm">R$ {fmt(r.max)}</span>
                    <TrendingUp size={12} className="inline ml-1 text-gray-400" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(r.porSource as any[]).map((ps: any) => (
                        <div key={ps.source} className="flex items-center gap-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ps.cor}`}>{ps.label}</span>
                          <span className={`text-xs font-bold ${r.mapPrice && ps.min < r.mapPrice ? 'text-red-600' : 'text-gray-600'}`}>
                            R$ {fmt(ps.min)}
                          </span>
                          {ps.ultimo?.url && (
                            <a href={ps.ultimo.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
