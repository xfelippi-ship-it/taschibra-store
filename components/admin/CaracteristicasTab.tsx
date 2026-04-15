'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Save, Wand2, ChevronDown, ChevronUp, Search, CheckSquare, Square, Edit3, X, Layers } from 'lucide-react'

interface Spec {
  id?: string
  product_id: string
  chave: string
  valor: string
  sort_order: number
}

interface Produto {
  id: string
  name: string
  sku: string
  family?: string
  category_slug?: string
  description?: string
}

const SUGESTOES_CHAVES = [
  'Potência (W)', 'Tensão (V)', 'Temperatura de Cor (K)', 'Fluxo Luminoso (lm)',
  'Índice de Proteção (IP)', 'Ângulo de Abertura (°)', 'IRC', 'Vida Útil (h)',
  'Dimerizável', 'Uso', 'Base / Soquete', 'Comprimento (mm)', 'Largura (mm)',
  'Altura (mm)', 'Diâmetro (mm)', 'Peso (g)', 'Garantia', 'Cor da Peça',
  'Material', 'Classe de Eficiência', 'Potência Equivalente (W)',
  'Fator de Potência', 'Lumens/Watt', 'Frequência (Hz)',
]

type ModoView = 'individual' | 'lote'
type TipoBusca = 'nome' | 'sku' | 'familia' | 'caracteristica'

export default function CaracteristicasTab({ meuEmail = 'admin' }: { meuEmail?: string }) {
  const [modo, setModo] = useState<ModoView>('individual')
  const [tipoBusca, setTipoBusca] = useState<TipoBusca>('nome')
  const [termoBusca, setTermoBusca] = useState('')
  const [resultados, setResultados] = useState<Produto[]>([])
  const [buscando, setBuscando] = useState(false)
  const [produtoId, setProdutoId] = useState('')
  const [produtoSel, setProdutoSel] = useState<Produto | null>(null)
  const [specs, setSpecs] = useState<Spec[]>([])
  const [loadingSpecs, setLoadingSpecs] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [novaChave, setNovaChave] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [loteChave, setLoteChave] = useState('')
  const [loteValor, setLoteValor] = useState('')
  const [loteAcao, setLoteAcao] = useState<'adicionar' | 'sobrescrever'>('adicionar')
  const [aplicandoLote, setAplicandoLote] = useState(false)
  const [progressoLote, setProgressoLote] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3500) }

  const buscar = useCallback(async () => {
    if (termoBusca.length < 2) { setResultados([]); return }
    setBuscando(true)
    if (tipoBusca === 'caracteristica') {
      const { data: specData } = await (supabase as any).from('product_specs').select('product_id').or(`chave.ilike.%${termoBusca}%,valor.ilike.%${termoBusca}%`)
      if (!specData?.length) { setResultados([]); setBuscando(false); return }
      const ids = [...new Set((specData as any[]).map((s: any) => s.product_id))]
      const { data } = await supabase.from('products').select('id,name,sku,family,category_slug').in('id', ids).order('name').limit(50)
      setResultados((data || []) as Produto[])
    } else {
      const campo = tipoBusca === 'familia' ? 'family' : tipoBusca === 'sku' ? 'sku' : 'name'
      const { data } = await supabase.from('products').select('id,name,sku,family,category_slug,description').ilike(campo, `%${termoBusca}%`).order('name').limit(50)
      setResultados((data || []) as Produto[])
    }
    setBuscando(false)
  }, [termoBusca, tipoBusca])

  useEffect(() => { const t = setTimeout(buscar, 350); return () => clearTimeout(t) }, [buscar])

  async function carregarSpecs(id: string) {
    setLoadingSpecs(true)
    const { data } = await (supabase as any).from('product_specs').select('*').eq('product_id', id).order('sort_order')
    setSpecs((data as any[] || []) as Spec[])
    setLoadingSpecs(false)
  }

  function selecionarProduto(p: Produto) {
    setProdutoId(p.id); setProdutoSel(p); setResultados([]); setTermoBusca(p.name); carregarSpecs(p.id)
  }

  function addSpec() {
    if (!novaChave.trim() || !novoValor.trim()) return
    setSpecs(prev => [...prev, { product_id: produtoId, chave: novaChave.trim(), valor: novoValor.trim(), sort_order: prev.length }])
    setNovaChave(''); setNovoValor('')
  }

  function updateSpec(idx: number, field: 'chave' | 'valor', value: string) {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function removeSpec(idx: number) { setSpecs(prev => prev.filter((_, i) => i !== idx)) }

  function moveSpec(idx: number, dir: -1 | 1) {
    const novo = [...specs]; const t = idx + dir
    if (t < 0 || t >= novo.length) return
    ;[novo[idx], novo[t]] = [novo[t], novo[idx]]
    novo.forEach((s, i) => { s.sort_order = i }); setSpecs(novo)
  }

  async function salvarIndividual() {
    if (!produtoId) return
    setSalvando(true)
    await (supabase as any).from('product_specs').delete().eq('product_id', produtoId)
    if (specs.length > 0) await (supabase as any).from('product_specs').insert(specs.map((s, i) => ({ product_id: produtoId, chave: s.chave, valor: s.valor, sort_order: i })))
    setSalvando(false)
    showMsg(`\u2705 ${specs.length} características salvas!`)
  }

  async function gerarDoTexto() {
    if (!produtoId || !produtoSel?.description) { showMsg('Produto sem descrição para extrair.'); return }
    setGerando(true)
    const geradas: Spec[] = []; let ordem = specs.length
    for (const linha of produtoSel.description.split(/[\n\r]+/)) {
      const m = linha.match(/[\*\u2022]?\s*([^:\n\*]{3,50}):\s*([^\n]{1,150})/)
      if (m) {
        const chave = m[1].trim().replace(/^\*+/, '').trim()
        const valor = m[2].trim()
        if (chave.length > 2 && valor.length > 0 && !specs.find(s => s.chave === chave))
          geradas.push({ product_id: produtoId, chave, valor, sort_order: ordem++ })
      }
    }
    if (geradas.length > 0) { setSpecs(prev => [...prev, ...geradas]); showMsg(`\u2728 ${geradas.length} extraídas!`) }
    else showMsg('Nenhuma encontrada na descrição.')
    setGerando(false)
  }

  function toggleSel(id: string) {
    setSelecionados(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleTodos() {
    setSelecionados(selecionados.size === resultados.length ? new Set() : new Set(resultados.map(p => p.id)))
  }

  async function aplicarLote() {
    if (!loteChave.trim() || !loteValor.trim() || selecionados.size === 0) return
    if (!confirm(`Aplicar "${loteChave}: ${loteValor}" em ${selecionados.size} produto(s)?`)) return
    setAplicandoLote(true); setProgressoLote(0)
    const ids = Array.from(selecionados); let ok = 0
    for (let i = 0; i < ids.length; i++) {
      const pid = ids[i]
      const { data: specsExist } = await (supabase as any).from('product_specs').select('id,chave').eq('product_id', pid)
      const existente = (specsExist as any[] || []).find((s: any) => s.chave === loteChave.trim())
      if (existente && loteAcao === 'sobrescrever') {
        await (supabase as any).from('product_specs').update({ valor: loteValor.trim() }).eq('id', existente.id)
      } else if (!existente) {
        await (supabase as any).from('product_specs').insert({ product_id: pid, chave: loteChave.trim(), valor: loteValor.trim(), sort_order: (specsExist as any[] || []).length })
      }
      ok++; setProgressoLote(Math.round((ok / ids.length) * 100))
    }
    setAplicandoLote(false)
    showMsg(`\u2705 Aplicado em ${ok} produto(s)!`)
    setSelecionados(new Set()); setLoteChave(''); setLoteValor('')
  }

  const todosSelec = resultados.length > 0 && selecionados.size === resultados.length

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Características de Produto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Specs técnicas exibidas na página do produto.</p>
        </div>
        {msg && <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">{msg}</span>}
      </div>

      <div className="flex gap-2 mb-5 mt-4">
        {([['individual', 'Individual', 'edit'] as const, ['lote', 'Edição em Lote', 'layers'] as const]).map(([id, label]) => (
          <button key={id} onClick={() => setModo(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${modo === id ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
            {id === 'individual' ? <Edit3 size={14} /> : <Layers size={14} />} {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Buscar por:</span>
          {([['nome','Nome'],['sku','SKU'],['familia','Família / Linha'],['caracteristica','Característica']] as [TipoBusca,string][]).map(([id, label]) => (
            <button key={id} onClick={() => { setTipoBusca(id); setTermoBusca(''); setResultados([]) }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${tipoBusca === id ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={termoBusca}
            onChange={e => { setTermoBusca(e.target.value); if (modo === 'individual') { setProdutoId(''); setProdutoSel(null) } }}
            placeholder={tipoBusca === 'sku' ? 'Ex: 61080246...' : tipoBusca === 'familia' ? 'Ex: TKL, Inlumix...' : tipoBusca === 'caracteristica' ? 'Ex: Potência, 9W, IP65...' : 'Ex: Lâmpada LED TKL...'}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500" />
          {buscando && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />}
        </div>

        {resultados.length > 0 && (
          <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
            {modo === 'lote' && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <button onClick={toggleTodos} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-green-700">
                  {todosSelec ? <CheckSquare size={15} className="text-green-600" /> : <Square size={15} />}
                  {todosSelec ? 'Desselecionar todos' : `Selecionar todos (${resultados.length})`}
                </button>
                {selecionados.size > 0 && <span className="ml-auto text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}</span>}
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
              {resultados.map(p => (
                <div key={p.id}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${modo === 'individual' ? 'hover:bg-green-50' : selecionados.has(p.id) ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                  onClick={() => modo === 'individual' ? selecionarProduto(p) : toggleSel(p.id)}>
                  {modo === 'lote' && (selecionados.has(p.id) ? <CheckSquare size={15} className="text-green-600 flex-shrink-0" /> : <Square size={15} className="text-gray-300 flex-shrink-0" />)}
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm text-gray-800 truncate block">{p.name}</span>
                    <div className="flex gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">SKU: {p.sku}</span>
                      {p.family && <span className="text-xs text-purple-600 font-medium">Família: {p.family}</span>}
                      {p.category_slug && <span className="text-xs text-blue-500">{p.category_slug}</span>}
                    </div>
                  </div>
                  {modo === 'individual' && <span className="text-xs text-green-600 font-bold flex-shrink-0">Editar →</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modo === 'lote' && selecionados.size > 0 && (
        <div className="bg-white rounded-xl border border-green-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-green-600" />
            <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">Aplicar em {selecionados.size} produto{selecionados.size !== 1 ? 's' : ''}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Característica</label>
              <input value={loteChave} onChange={e => setLoteChave(e.target.value)} list="sugestoes-lote"
                placeholder="Ex: Temperatura de Cor (K)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
              <datalist id="sugestoes-lote">{SUGESTOES_CHAVES.map(k => <option key={k} value={k} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Valor</label>
              <input value={loteValor} onChange={e => setLoteValor(e.target.value)} placeholder="Ex: 3000K"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <label className="text-xs font-bold text-gray-600">Se já existir:</label>
            {(['adicionar','sobrescrever'] as const).map(op => (
              <label key={op} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={loteAcao === op} onChange={() => setLoteAcao(op)} className="accent-green-600" />
                <span className={`text-xs font-bold ${op === 'sobrescrever' ? 'text-orange-600' : 'text-gray-600'}`}>
                  {op === 'adicionar' ? 'Ignorar (não duplica)' : 'Sobrescrever valor'}
                </span>
              </label>
            ))}
          </div>
          {aplicandoLote && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Aplicando...</span><span>{progressoLote}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${progressoLote}%` }} /></div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setSelecionados(new Set())} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-bold text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              <X size={14} /> Limpar seleção
            </button>
            <button onClick={aplicarLote} disabled={aplicandoLote || !loteChave.trim() || !loteValor.trim()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2 rounded-lg ml-auto">
              <Save size={14} /> {aplicandoLote ? 'Aplicando...' : `Aplicar em ${selecionados.size} produto${selecionados.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {modo === 'individual' && produtoId && produtoSel && (
        <>
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-black text-sm text-green-800">{produtoSel.name}</span>
              <span className="text-xs text-green-600 ml-2">SKU {produtoSel.sku}</span>
              {produtoSel.family && <span className="text-xs text-purple-600 ml-2">· {produtoSel.family}</span>}
            </div>
            <button onClick={() => { setProdutoId(''); setProdutoSel(null); setSpecs([]); setTermoBusca('') }} className="text-green-600 hover:text-red-500"><X size={16} /></button>
          </div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <button onClick={gerarDoTexto} disabled={gerando}
              className="flex items-center gap-2 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50">
              <Wand2 size={14} /> {gerando ? 'Extraindo...' : 'Extrair da descrição'}
            </button>
            <button onClick={() => setMostrarSugestoes(s => !s)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm px-4 py-2 rounded-lg">
              <ChevronDown size={14} className={mostrarSugestoes ? 'rotate-180' : ''} /> Sugestões
            </button>
            <button onClick={salvarIndividual} disabled={salvando}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2 rounded-lg disabled:opacity-50 ml-auto">
              <Save size={14} /> {salvando ? 'Salvando...' : `Salvar ${specs.length} características`}
            </button>
          </div>
          {mostrarSugestoes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-black text-blue-700 uppercase tracking-wide mb-2">Clique para usar como chave</p>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES_CHAVES.filter(k => !specs.find(s => s.chave === k)).map(k => (
                  <button key={k} onClick={() => setNovaChave(k)} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 font-medium">{k}</button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Características ({specs.length})</span>
            </div>
            {loadingSpecs ? <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
            : specs.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Nenhuma característica. Adicione abaixo ou use &quot;Extrair da descrição&quot;.</div>
            : (
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="w-8 px-3 py-2" />
                  <th className="text-left px-4 py-2 text-xs font-black text-gray-500 uppercase">Característica</th>
                  <th className="text-left px-4 py-2 text-xs font-black text-gray-500 uppercase">Valor</th>
                  <th className="w-10 px-3 py-2" />
                </tr></thead>
                <tbody>
                  {specs.map((s, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveSpec(idx, -1)} disabled={idx === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronUp size={12} /></button>
                          <button onClick={() => moveSpec(idx, 1)} disabled={idx === specs.length-1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronDown size={12} /></button>
                        </div>
                      </td>
                      <td className="px-4 py-2"><input value={s.chave} onChange={e => updateSpec(idx,'chave',e.target.value)} className="w-full border border-transparent rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-400 focus:bg-green-50 bg-transparent" /></td>
                      <td className="px-4 py-2"><input value={s.valor} onChange={e => updateSpec(idx,'valor',e.target.value)} className="w-full border border-transparent rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-400 focus:bg-green-50 bg-transparent" /></td>
                      <td className="px-3 py-2"><button onClick={() => removeSpec(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="border-t border-dashed border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex gap-3 items-center">
                <input value={novaChave} onChange={e => setNovaChave(e.target.value)} onKeyDown={e => e.key==='Enter' && addSpec()} placeholder="Característica" list="sugestoes-chaves"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                <datalist id="sugestoes-chaves">{SUGESTOES_CHAVES.map(k => <option key={k} value={k} />)}</datalist>
                <input value={novoValor} onChange={e => setNovoValor(e.target.value)} onKeyDown={e => e.key==='Enter' && addSpec()} placeholder="Valor"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                <button onClick={addSpec} disabled={!novaChave.trim() || !novoValor.trim()}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-black text-sm px-4 py-2 rounded-lg">
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>
          </div>
          {specs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Preview — como aparece no produto</p>
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={i} className={i%2===0?'bg-gray-50':'bg-white'}>
                      <td className="py-2.5 px-4 text-gray-500 font-medium w-1/2">{s.chave}</td>
                      <td className="py-2.5 px-4 text-gray-800 font-semibold">{s.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
