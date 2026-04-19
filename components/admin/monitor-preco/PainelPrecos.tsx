'use client'
import { useState, useMemo } from 'react'
import { TrendingDown, TrendingUp, ExternalLink, AlertTriangle, Package, Store, BarChart3, Bell } from 'lucide-react'
import { Snapshot, Competitor } from './types'
import { CANAIS_LIST, CANAIS, fmt } from './constants'

interface Props {
  snapshots: Snapshot[]
  competitors: Competitor[]
  loading: boolean
}

export default function PainelPrecos({ snapshots, competitors, loading }: Props) {
  const [skuFiltro, setSkuFiltro] = useState('')
  const [sourceFiltro, setSourceFiltro] = useState('todos')

  // ============ KPIs ============
  const kpis = useMemo(() => {
    const skusUnicos = new Set(snapshots.map(s => s.sku)).size
    const revendedores = new Set(snapshots.map(s => s.seller).filter(Boolean)).size
    const totalRegistros = snapshots.length

    // Violações MAP
    const violacoes = competitors.filter(c => {
      if (!c.map_price) return false
      const snaps = snapshots.filter(s => s.sku === c.sku)
      if (!snaps.length) return false
      const min = Math.min(...snaps.map(s => s.price).filter(p => p > 0))
      return min < c.map_price
    }).length

    return { skusUnicos, revendedores, totalRegistros, violacoes }
  }, [snapshots, competitors])

  // ============ Alertas recentes (últimos 5 SKUs com violação MAP) ============
  const alertasRecentes = useMemo(() => {
    return competitors
      .filter(c => c.map_price)
      .map(c => {
        const snaps = snapshots.filter(s => s.sku === c.sku)
        if (!snaps.length) return null
        const precos = snaps.map(s => s.price).filter(p => p > 0)
        if (!precos.length) return null
        const min = Math.min(...precos)
        const snap = snaps.find(s => s.price === min)
        if (min >= (c.map_price || 0)) return null
        return {
          sku: c.sku,
          product_name: c.product_name || c.sku,
          min,
          map: c.map_price!,
          source: snap?.source || '',
          url: snap?.url,
        }
      })
      .filter(Boolean)
      .slice(0, 5) as any[]
  }, [snapshots, competitors])

  // ============ Resumo por SKU ============
  const resumoPorSku = useMemo(() => {
    const skus = [...new Set(snapshots.map(s => s.sku))]
    return skus.map(sku => {
      const itens = snapshots.filter(s => s.sku === sku)
      const comp = competitors.find(c => c.sku === sku)
      const mapPrice = comp?.map_price

      const porSource = CANAIS_LIST.map(src => {
        const srcItens = itens.filter(s => s.source === src.id)
        if (!srcItens.length) return null
        const precos = srcItens.map(s => s.price).filter(p => p > 0)
        if (!precos.length) return null
        return {
          source: src.id,
          label: src.label,
          cor: src.cor,
          min: Math.min(...precos),
          ultimo: srcItens[0],
        }
      }).filter(Boolean) as any[]

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
      }
    }).filter((r): r is NonNullable<typeof r> => {
      if (!r) return false
      if (skuFiltro && !r.sku.toLowerCase().includes(skuFiltro.toLowerCase()) &&
          !r.product_name.toLowerCase().includes(skuFiltro.toLowerCase())) return false
      if (sourceFiltro !== 'todos' && !r.porSource.some((ps: any) => ps?.source === sourceFiltro)) return false
      return true
    })
  }, [snapshots, competitors, skuFiltro, sourceFiltro])

  return (
    <div className="space-y-5">
      {/* ============ KPI Cards ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Produtos Monitorados</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{competitors.length}</p>
            <p className="text-xs text-gray-400">SKUs cadastrados</p>
          </div>
          <div className="bg-green-100 rounded-xl p-2.5"><Package size={18} className="text-green-600" /></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Revendedores</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{kpis.revendedores}</p>
            <p className="text-xs text-gray-400">rastreados</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-2.5"><Store size={18} className="text-blue-600" /></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Registros de Preço</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{kpis.totalRegistros}</p>
            <p className="text-xs text-gray-400">entradas capturadas</p>
          </div>
          <div className="bg-purple-100 rounded-xl p-2.5"><BarChart3 size={18} className="text-purple-600" /></div>
        </div>

        <div className={`rounded-xl border p-4 flex items-center justify-between ${
          kpis.violacoes > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
        }`}>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Violações MAP</p>
            <p className={`text-2xl font-black mt-1 ${kpis.violacoes > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {kpis.violacoes}
            </p>
            <p className="text-xs text-gray-400">abaixo do mínimo</p>
          </div>
          <div className={`rounded-xl p-2.5 ${kpis.violacoes > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
            <AlertTriangle size={18} className={kpis.violacoes > 0 ? 'text-red-600' : 'text-gray-400'} />
          </div>
        </div>
      </div>

      {/* ============ Layout 2 colunas: tabela + alertas ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Coluna principal — Tabela de SKUs */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filtros */}
          <div className="flex gap-3">
            <input value={skuFiltro} onChange={e => setSkuFiltro(e.target.value)}
              placeholder="Buscar por SKU ou nome..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
            <select value={sourceFiltro} onChange={e => setSourceFiltro(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-500">
              <option value="todos">Todos os canais</option>
              {CANAIS_LIST.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Carregando dados...</div>
          ) : resumoPorSku.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400">
              <TrendingDown size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Nenhum dado de preço ainda.</p>
              <p className="text-xs mt-1">Configure os SKUs e aguarde a próxima execução do N8n.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-3 py-3 text-xs font-black text-gray-500 uppercase">SKU</th>
                    <th className="text-center px-3 py-3 text-xs font-black text-gray-500 uppercase">MAP</th>
                    <th className="text-center px-3 py-3 text-xs font-black text-gray-500 uppercase">Menor</th>
                    <th className="text-center px-3 py-3 text-xs font-black text-gray-500 uppercase">Média</th>
                    <th className="text-center px-3 py-3 text-xs font-black text-gray-500 uppercase">Maior</th>
                    <th className="text-left px-3 py-3 text-xs font-black text-gray-500 uppercase">Canais</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoPorSku.map(r => (
                    <tr key={r.sku} className={`border-b border-gray-100 hover:bg-gray-50 ${r.violacaoMAP ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {r.violacaoMAP && <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />}
                          <div>
                            <p className="font-bold text-gray-800 text-xs font-mono">{r.sku}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{r.product_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {r.mapPrice
                          ? <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.violacaoMAP ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>R$ {fmt(r.mapPrice)}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`font-black text-sm ${r.violacaoMAP ? 'text-red-600' : 'text-green-700'}`}>R$ {fmt(r.min)}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-gray-700 font-bold text-sm">R$ {fmt(r.avg)}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-gray-600 font-bold text-sm">R$ {fmt(r.max)}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.porSource.map((ps: any) => (
                            <span key={ps.source} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ps.cor}`}>{ps.label}</span>
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

        {/* Coluna lateral — Alertas recentes */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-red-500" />
                <p className="text-xs font-bold text-gray-800">Alertas Recentes</p>
              </div>
              <span className="text-xs text-gray-400">{alertasRecentes.length}</span>
            </div>
            {alertasRecentes.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                Nenhum alerta
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alertasRecentes.map((a, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-bold text-gray-800 font-mono">{a.sku}</p>
                      {a.url && (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1.5">{a.product_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-bold">R$ {fmt(a.min)}</span>
                      <span className="text-xs text-gray-400">vs MAP R$ {fmt(a.map)}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CANAIS[a.source as keyof typeof CANAIS]?.cor || 'bg-gray-100 text-gray-600'}`}>
                        {CANAIS[a.source as keyof typeof CANAIS]?.label || a.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box informativo */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <p className="font-bold mb-1">💡 Sobre os dados</p>
            <p>Coleta automática 1x/dia via N8n. Use "Atualizar tela" para recarregar.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
