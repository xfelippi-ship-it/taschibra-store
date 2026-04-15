'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, GripVertical, Save, Wand2, ChevronDown, ChevronUp } from 'lucide-react'

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
  description?: string
}

// Sugestões de chaves comuns para iluminação Taschibra
const SUGESTOES_CHAVES = [
  'Potência (W)', 'Tensão (V)', 'Temperatura de Cor (K)', 'Fluxo Luminoso (lm)',
  'Índice de Proteção (IP)', 'Ângulo de Abertura (°)', 'IRC', 'Vida Útil (h)',
  'Dimerizável', 'Uso', 'Base / Soquete', 'Comprimento (mm)', 'Largura (mm)',
  'Altura (mm)', 'Diâmetro (mm)', 'Peso (g)', 'Garantia', 'Voltagem',
  'Cor da Peça', 'Material', 'Classe de Eficiência', 'Potência Equivalente (W)',
  'Fator de Potência', 'Lumens/Watt', 'Frequência (Hz)', 'Corrente (mA)',
]

export default function CaracteristicasTab({ meuEmail = 'admin' }: { meuEmail?: string }) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoId, setProdutoId] = useState('')
  const [busca, setBusca] = useState('')
  const [specs, setSpecs] = useState<Spec[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [novaChave, setNovaChave] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [expandido, setExpandido] = useState(true)

  // Buscar produtos
  useEffect(() => {
    async function buscarProdutos() {
      if (busca.length < 2) { setProdutos([]); return }
      const { data } = await supabase
        .from('products')
        .select('id, name, sku, description')
        .or(`name.ilike.%${busca}%,sku.ilike.%${busca}%`)
        .order('name')
        .limit(10)
      setProdutos((data || []) as Produto[])
    }
    const t = setTimeout(buscarProdutos, 300)
    return () => clearTimeout(t)
  }, [busca])

  // Carregar specs do produto selecionado
  useEffect(() => {
    if (!produtoId) { setSpecs([]); return }
    async function carregar() {
      setLoading(true)
      const { data } = await supabase
        .from('product_specs' as any)
        .select('*')
        .eq('product_id', produtoId)
        .order('sort_order')
      setSpecs((data as any[] || []) as Spec[])
      setLoading(false)
    }
    carregar()
  }, [produtoId])

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000) }

  function addSpec() {
    if (!novaChave.trim() || !novoValor.trim()) return
    const nova: Spec = {
      product_id: produtoId,
      chave: novaChave.trim(),
      valor: novoValor.trim(),
      sort_order: specs.length,
    }
    setSpecs(prev => [...prev, nova])
    setNovaChave('')
    setNovoValor('')
  }

  function updateSpec(idx: number, field: 'chave' | 'valor', value: string) {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function removeSpec(idx: number) {
    setSpecs(prev => prev.filter((_, i) => i !== idx))
  }

  function moveSpec(idx: number, dir: -1 | 1) {
    const novo = [...specs]
    const target = idx + dir
    if (target < 0 || target >= novo.length) return
    ;[novo[idx], novo[target]] = [novo[target], novo[idx]]
    novo.forEach((s, i) => { s.sort_order = i })
    setSpecs(novo)
  }

  async function salvar() {
    if (!produtoId) return
    setSalvando(true)

    // Deletar todas as specs antigas do produto
    await supabase.from('product_specs' as any).delete().eq('product_id', produtoId)

    // Inserir todas as specs atuais
    if (specs.length > 0) {
      const payload = specs.map((s, i) => ({
        product_id: produtoId,
        chave: s.chave,
        valor: s.valor,
        sort_order: i,
      }))
      await supabase.from('product_specs' as any).insert(payload)
    }

    setSalvando(false)
    showMsg(`✅ ${specs.length} característica${specs.length !== 1 ? 's' : ''} salva${specs.length !== 1 ? 's' : ''}!`)
  }

  // Gerar specs automaticamente da descrição do produto via IA simples (regex)
  async function gerarDoTexto() {
    if (!produtoId) return
    setGerando(true)

    const produto = produtos.find(p => p.id === produtoId)
    const texto = produto?.description || ''

    // Parse specs do padrão "* Chave: Valor" ou "Chave: Valor"
    const geradas: Spec[] = []
    const linhas = texto.split(/[\n\r]+/)
    let ordem = specs.length

    for (const linha of linhas) {
      const m = linha.match(/[\*\•]?\s*([^:\n\*]{3,50}):\s*([^\n]{1,150})/)
      if (m) {
        const chave = m[1].trim().replace(/^\*+/, '').trim()
        const valor = m[2].trim()
        if (chave.length > 2 && valor.length > 0 && !specs.find(s => s.chave === chave)) {
          geradas.push({ product_id: produtoId, chave, valor, sort_order: ordem++ })
        }
      }
    }

    if (geradas.length > 0) {
      setSpecs(prev => [...prev, ...geradas])
      showMsg(`✨ ${geradas.length} característica${geradas.length !== 1 ? 's' : ''} extraída${geradas.length !== 1 ? 's' : ''} da descrição!`)
    } else {
      showMsg('Nenhuma característica encontrada na descrição.')
    }
    setGerando(false)
  }

  const produtoSelecionado = produtos.find(p => p.id === produtoId)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-gray-800">Características de Produto</h1>
        {msg && <span className="text-sm font-bold text-green-600 animate-pulse">{msg}</span>}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Specs técnicas exibidas na página do produto. Ex: Potência, Tensão, IP, Temperatura de Cor.
      </p>

      {/* Busca de produto */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2 block">
          Selecionar Produto
        </label>
        <input
          value={busca}
          onChange={e => { setBusca(e.target.value); setProdutoId('') }}
          placeholder="Digite o nome ou SKU do produto..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 mb-2"
        />
        {produtos.length > 0 && !produtoId && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {produtos.map(p => (
              <button
                key={p.id}
                onClick={() => { setProdutoId(p.id); setBusca(p.name) }}
                className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-sm border-b border-gray-100 last:border-0 transition-colors"
              >
                <span className="font-bold text-gray-800">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2">SKU: {p.sku}</span>
              </button>
            ))}
          </div>
        )}
        {produtoSelecionado && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs text-green-700 font-bold">{produtoSelecionado.name}</span>
            <span className="text-xs text-gray-400">· SKU {produtoSelecionado.sku}</span>
            <button
              onClick={() => { setProdutoId(''); setBusca(''); setSpecs([]) }}
              className="text-xs text-gray-400 hover:text-red-500 ml-auto"
            >
              trocar
            </button>
          </div>
        )}
      </div>

      {produtoId && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <button
              onClick={gerarDoTexto}
              disabled={gerando}
              className="flex items-center gap-2 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Wand2 size={14} />
              {gerando ? 'Extraindo...' : 'Extrair da descrição'}
            </button>
            <button
              onClick={() => setMostrarSugestoes(s => !s)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <ChevronDown size={14} className={mostrarSugestoes ? 'rotate-180' : ''} />
              Sugestões de campos
            </button>
            <button
              onClick={salvar}
              disabled={salvando || !produtoId}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50 ml-auto"
            >
              <Save size={14} />
              {salvando ? 'Salvando...' : `Salvar ${specs.length} características`}
            </button>
          </div>

          {/* Sugestões */}
          {mostrarSugestoes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-black text-blue-700 uppercase tracking-wide mb-2">
                Clique para adicionar como nova linha
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES_CHAVES.filter(k => !specs.find(s => s.chave === k)).map(k => (
                  <button
                    key={k}
                    onClick={() => setNovaChave(k)}
                    className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors font-medium"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lista de specs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div
              className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
              onClick={() => setExpandido(e => !e)}
            >
              <span className="text-xs font-black text-gray-500 uppercase tracking-wide">
                Características ({specs.length})
              </span>
              {expandido ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>

            {expandido && (
              <>
                {loading ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
                ) : specs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhuma característica cadastrada. Adicione abaixo ou clique em &quot;Extrair da descrição&quot;.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="w-8 px-3 py-2" />
                        <th className="text-left px-4 py-2 text-xs font-black text-gray-500 uppercase">Característica</th>
                        <th className="text-left px-4 py-2 text-xs font-black text-gray-500 uppercase">Valor</th>
                        <th className="w-10 px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {specs.map((s, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 group">
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => moveSpec(idx, -1)} disabled={idx === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                                <ChevronUp size={12} />
                              </button>
                              <button onClick={() => moveSpec(idx, 1)} disabled={idx === specs.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                                <ChevronDown size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={s.chave}
                              onChange={e => updateSpec(idx, 'chave', e.target.value)}
                              className="w-full border border-transparent rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-400 focus:bg-green-50 bg-transparent"
                              placeholder="Ex: Potência (W)"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={s.valor}
                              onChange={e => updateSpec(idx, 'valor', e.target.value)}
                              className="w-full border border-transparent rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-400 focus:bg-green-50 bg-transparent"
                              placeholder="Ex: 9W"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeSpec(idx)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Adicionar nova linha */}
                <div className="border-t border-dashed border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex gap-3 items-center">
                    <input
                      value={novaChave}
                      onChange={e => setNovaChave(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSpec()}
                      placeholder="Nova característica (ex: Tensão)"
                      list="sugestoes-chaves"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white"
                    />
                    <datalist id="sugestoes-chaves">
                      {SUGESTOES_CHAVES.map(k => <option key={k} value={k} />)}
                    </datalist>
                    <input
                      value={novoValor}
                      onChange={e => setNovoValor(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSpec()}
                      placeholder="Valor (ex: 127V/220V)"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white"
                    />
                    <button
                      onClick={addSpec}
                      disabled={!novaChave.trim() || !novoValor.trim()}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-black text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Preview da tabela como vai aparecer no site */}
          {specs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">
                Preview — como aparece na página do produto
              </p>
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
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
