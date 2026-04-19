'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, Trash2, Search, X, Check } from 'lucide-react'
import { Competitor } from './types'
import { CANAIS, CANAIS_LIST, fmt } from './constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  competitors: Competitor[]
  onUpdate: () => void
  showMsg: (t: string) => void
}

type Produto = { id: string; sku: string; name: string; price: number }

export default function ConfigurarSKUs({ competitors, onUpdate, showMsg }: Props) {
  const [open, setOpen] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})
  const [canalSelecionado, setCanalSelecionado] = useState('mercadolivre')
  const [mapInput, setMapInput] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [editandoMap, setEditandoMap] = useState<string | null>(null)
  const [mapTemp, setMapTemp] = useState('')

  async function carregarProdutos() {
    if (produtos.length) return
    const { data } = await supabase
      .from('products' as any)
      .select('id,sku,name,price')
      .eq('active', true)
      .order('name')
      .limit(2000)
    setProdutos(((data || []) as any[]).filter(p => p.sku))
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen) {
      setSelecionados({})
      setBusca('')
      setCanalSelecionado('mercadolivre')
      setMapInput('')
      carregarProdutos()
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    !busca ||
    p.sku.toLowerCase().includes(busca.toLowerCase()) ||
    p.name.toLowerCase().includes(busca.toLowerCase())
  )

  const totalSelecionados = Object.values(selecionados).filter(Boolean).length

  async function salvar() {
    const skus = Object.entries(selecionados).filter(([, v]) => v).map(([k]) => k)
    if (!skus.length) return
    setSalvando(true)
    const registros = skus.map(sku => {
      const prod = produtos.find(p => p.sku === sku)
      return {
        sku,
        product_name: prod?.name || sku,
        source: canalSelecionado,
        search_term: prod?.name?.toLowerCase() || sku.toLowerCase(),
        map_price: mapInput ? parseFloat(mapInput) : null,
      }
    })
    const { error } = await supabase.from('market_competitors' as any).insert(registros)
    setSalvando(false)
    if (error) { showMsg('Erro ao salvar'); return }
    showMsg(`${skus.length} SKU(s) adicionados!`)
    setOpen(false)
    onUpdate()
  }

  async function excluir(id: string) {
    await supabase.from('market_competitors' as any).delete().eq('id', id)
    showMsg('SKU removido')
    onUpdate()
  }

  async function trocarCanal(id: string, source: string) {
    await supabase.from('market_competitors' as any).update({ source }).eq('id', id)
    onUpdate()
  }

  async function salvarMap(id: string) {
    const val = parseFloat(mapTemp)
    if (isNaN(val)) { setEditandoMap(null); return }
    await supabase.from('market_competitors' as any).update({ map_price: val }).eq('id', id)
    showMsg('Preço MAP salvo')
    setEditandoMap(null)
    setMapTemp('')
    onUpdate()
  }

  async function removerMap(id: string) {
    await supabase.from('market_competitors' as any).update({ map_price: null }).eq('id', id)
    showMsg('MAP removido')
    onUpdate()
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">SKUs configurados para monitoramento de preço e MAP.</p>
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
              <Plus size={13} /> Adicionar SKUs
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl outline-none flex flex-col">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <Dialog.Title className="text-lg font-black text-gray-800">Selecionar SKUs</Dialog.Title>
                  <Dialog.Description className="text-xs text-gray-400 mt-0.5">{totalSelecionados} selecionado(s)</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                </Dialog.Close>
              </div>

              {/* Canal + MAP */}
              <div className="px-6 py-3 border-b border-gray-100 flex gap-4 bg-gray-50 flex-shrink-0">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Canal</label>
                  <select value={canalSelecionado} onChange={e => setCanalSelecionado(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-green-500">
                    {CANAIS_LIST.filter(c => c.tipo !== 'service').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="w-36">
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Preço MAP (opcional)</label>
                  <input type="number" step="0.01" value={mapInput} onChange={e => setMapInput(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Busca */}
              <div className="px-6 py-3 border-b border-gray-100 flex gap-3 items-center flex-shrink-0">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={busca} onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar por SKU ou nome..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500" />
                </div>
                <button type="button"
                  onClick={() => { const n: Record<string,boolean> = {}; produtosFiltrados.forEach(p => { n[p.sku] = true }); setSelecionados(prev => ({...prev,...n})) }}
                  className="text-xs font-bold text-green-600 hover:text-green-700 whitespace-nowrap">Selecionar todos</button>
                <button type="button" onClick={() => setSelecionados({})}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 whitespace-nowrap">Desmarcar</button>
              </div>

              {/* Lista — agora funcionando perfeitamente com Radix */}
              <div className="overflow-y-auto flex-1 px-2 py-1">
                {produtosFiltrados.map(p => (
                  <button key={p.sku} type="button"
                    onClick={() => setSelecionados(prev => ({...prev, [p.sku]: !prev[p.sku]}))}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 cursor-pointer rounded-lg">
                    <input type="checkbox" readOnly checked={!!selecionados[p.sku]}
                      className="w-4 h-4 accent-green-600 flex-shrink-0 pointer-events-none" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono font-bold text-gray-600 mr-2">{p.sku}</span>
                      <span className="text-sm text-gray-800">{p.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">R$ {fmt(p.price)}</span>
                  </button>
                ))}
                {produtosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">Nenhum produto encontrado.</div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <Dialog.Close asChild>
                  <button className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm">Cancelar</button>
                </Dialog.Close>
                <button onClick={salvar} disabled={totalSelecionados === 0 || salvando}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-2.5 rounded-lg text-sm">
                  {salvando ? 'Salvando...' : `Adicionar ${totalSelecionados} SKU(s)`}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {competitors.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhum SKU configurado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">SKU / Produto</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Canal</th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Termo de busca</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">MAP</th>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(c => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800 text-xs font-mono">{c.sku}</p>
                    {c.product_name && <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.product_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <select value={c.source} onChange={e => trocarCanal(c.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-green-500">
                      {CANAIS_LIST.filter(canal => canal.tipo !== 'service').map(canal => (
                        <option key={canal.id} value={canal.id}>{canal.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.search_term}</td>
                  <td className="px-4 py-3 text-center">
                    {editandoMap === c.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <input type="number" step="0.01" autoFocus value={mapTemp}
                          onChange={e => setMapTemp(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') salvarMap(c.id); if (e.key === 'Escape') setEditandoMap(null) }}
                          className="w-20 text-xs border border-green-400 rounded px-1.5 py-1 outline-none text-center"
                          placeholder="0.00" />
                        <button onClick={() => salvarMap(c.id)} className="text-green-600"><Check size={13} /></button>
                        <button onClick={() => setEditandoMap(null)} className="text-gray-400"><X size={13} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditandoMap(c.id); setMapTemp(c.map_price ? String(c.map_price) : '') }}
                        className="group flex items-center gap-1 justify-center w-full">
                        {c.map_price
                          ? <span className="text-xs font-bold text-gray-700 group-hover:text-green-600">R$ {fmt(c.map_price)}</span>
                          : <span className="text-xs text-gray-300 group-hover:text-green-500">+ MAP</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {c.map_price && (
                        <button onClick={() => removerMap(c.id)} className="text-orange-400 hover:text-orange-600"><X size={12} /></button>
                      )}
                      <button onClick={() => excluir(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
