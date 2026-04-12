'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { registrarAuditoria } from '@/lib/auditLog'


type Produto = {
  id: string; name: string; sku: string; price: number; promo_price: number
  stock_qty: number; active: boolean; badge: string; badges?: string[]; is_lancamento?: boolean; family?: string
  category_slug?: string; description?: string; main_image?: string
  weight_kg?: number; warranty?: string; ean?: string
}

type Variacao = {
  id?: string; product_id: string; name: string; type: string; value: string
  sku: string; ean: string; price: number; promo_price: number
  stock_qty: number; active: boolean; technical_description?: string
}

const TIPOS_VARIACAO = [
  { value: 'angulo_abertura',     label: 'Ângulo de Abertura'           },
  { value: 'aplicacao',           label: 'Aplicação'                    },
  { value: 'comprimento',         label: 'Comprimento'                  },
  { value: 'cor',                 label: 'Cor'                          },
  { value: 'cor_peca',            label: 'Cor da Peça'                  },
  { value: 'face',                label: 'Face'                         },
  { value: 'formato',             label: 'Formato'                      },
  { value: 'indice_protecao',     label: 'Índice de Proteção'           },
  { value: 'modelo',              label: 'Modelo'                       },
  { value: 'temperatura_cor',     label: 'Temperatura de Cor'           },
  { value: 'temperatura_frontal', label: 'Temperatura de Cor (Frontal)' },
  { value: 'tensao',              label: 'Tensão'                       },
]

const tipoLabel = (tipo: string) => TIPOS_VARIACAO.find(t => t.value === tipo)?.label || tipo

const variacaoVazia = (productId: string): Variacao => ({
  product_id: productId, name: '', type: 'temperatura_cor', value: '',
  sku: '', ean: '', price: 0, promo_price: 0, stock_qty: 0, active: true
})

type Feature = { id?: string; title: string; description: string; image_url: string; sort_order: number }

export default function ProdutosTab({ meuPapel = 'master', meuEmail = 'admin' }: { meuPapel?: string, meuEmail?: string }) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [badgeModalProduto, setBadgeModalProduto] = useState<any>(null)
  const [badgesTemp, setBadgesTemp] = useState<string[]>([])

  async function toggleLancamentoProduto(produto: any) {
    const novoValor = !produto.is_lancamento
    await supabase.from('products').update({ is_lancamento: novoValor }).eq('id', produto.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: novoValor ? 'marcado_lancamento' : 'desmarcado_lancamento', entidade: 'products', detalhe: `Produto: ${produto.name}` })
    carregar()
  }

  async function salvarBadges(produto: any, novosBadges: string[]) {
    await supabase.from('products').update({ badges: novosBadges }).eq('id', produto.id)
    await registrarAuditoria({ executedBy: meuEmail, acao: 'badges_editados', entidade: 'products', detalhe: `Produto: ${produto.name} | Badges: ${novosBadges.join(', ')||'nenhum'}` })
    setBadgeModalProduto(null)
    carregar()
  }
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc')
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [variacoesPorProduto, setVariacoesPorProduto] = useState<Record<string, Variacao[]>>({})

  // Modal produto
  const [modal, setModal] = useState(false)
  const [produtoEdit, setProdutoEdit] = useState<Partial<Produto>>({})
  const [abaModal, setAbaModal] = useState<'dados' | 'variacoes' | 'funcionalidades'>('dados')

  // Modal variação
  const [modalVar, setModalVar] = useState(false)
  const [features, setFeatures] = useState<Feature[]>([])
  const [featuresSaving, setFeaturesSaving] = useState(false)

  async function carregarFeatures(id: string) {
    const { data } = await supabase.from('product_features')
      .select('id,title,description,image_url,sort_order')
      .eq('product_id', id).order('sort_order')
    setFeatures(data?.length ? data : [
      { title: '', description: '', image_url: '', sort_order: 1 },
      { title: '', description: '', image_url: '', sort_order: 2 },
      { title: '', description: '', image_url: '', sort_order: 3 },
      { title: '', description: '', image_url: '', sort_order: 4 },
    ])
  }

  async function salvarFeatures(prodId: string) {
    setFeaturesSaving(true)
    await supabase.from('product_features').delete().eq('product_id', prodId)
    const validas = features.filter(f => f.title.trim())
    if (validas.length > 0) {
      await supabase.from('product_features').insert(
        validas.map((f, i) => ({
          product_id: prodId, title: f.title,
          description: f.description, image_url: f.image_url || null, sort_order: i + 1
        }))
      )
    }
    setFeaturesSaving(false)
    alert('Funcionalidades salvas!')
  }
  const [varEdit, setVarEdit] = useState<Variacao | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('name')
    setProdutos(data || [])
    setLoading(false)
  }

  async function carregarVariacoes(produtoId: string) {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', produtoId)
      .order('type')
    setVariacoesPorProduto(prev => ({ ...prev, [produtoId]: data || [] }))
  }

  function toggleExpandir(id: string) {
    const novo = new Set(expandidos)
    if (novo.has(id)) {
      novo.delete(id)
    } else {
      novo.add(id)
      if (!variacoesPorProduto[id]) carregarVariacoes(id)
    }
    setExpandidos(novo)
  }

  async function salvarProduto() {
    if (!produtoEdit.name) return
    if (produtoEdit.id) {
      const { data: antes } = await supabase.from('products').select('name,price,promo_price,main_image').eq('id', produtoEdit.id).single()
      await supabase.from('products').update(produtoEdit).eq('id', produtoEdit.id)
      await registrarAuditoria({
        executedBy: meuEmail,
        acao: 'produto_editado',
        entidade: 'products',
        detalhe: `Produto: ${produtoEdit.name} | SKU: ${produtoEdit.sku || '-'} | Preço: R$${antes?.price ?? '-'} → R$${produtoEdit.price}`,
        valorAntes: antes || undefined,
        valorDepois: { name: produtoEdit.name, price: produtoEdit.price, promo_price: produtoEdit.promo_price }
      })
    } else {
      const slug = produtoEdit.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await supabase.from('products').insert({ ...produtoEdit, slug })
    }
    setModal(false)
    setProdutoEdit({})
    setAbaModal('dados')
    carregar()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('products').update({ active: !ativo }).eq('id', id)
    carregar()
  }

  async function excluirProduto(id: string) {
    if (!confirm('Excluir este produto e todas as suas variações?')) return
    await supabase.from('product_variants').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    carregar()
  }

  async function salvarVariacao() {
    if (!varEdit) return
    const dados = {
      product_id: varEdit.product_id,
      name: varEdit.name || `${varEdit.type} ${varEdit.value}`,
      type: varEdit.type,
      value: varEdit.value,
      sku: varEdit.sku,
      ean: varEdit.ean,
      price: Number(varEdit.price),
      promo_price: Number(varEdit.promo_price),
      stock_qty: Number(varEdit.stock_qty),
      active: varEdit.active,
      technical_description: varEdit.technical_description || null,
    }
    if (varEdit.id) {
      await supabase.from('product_variants').update(dados).eq('id', varEdit.id)
    } else {
      await supabase.from('product_variants').insert(dados)
    }
    setModalVar(false)
    setVarEdit(null)
    carregarVariacoes(varEdit.product_id)
  }

  async function excluirVariacao(v: Variacao) {
    if (!confirm('Excluir esta variação?')) return
    await supabase.from('product_variants').delete().eq('id', v.id)
    carregarVariacoes(v.product_id)
  }

  const produtosFiltrados = produtos
    .filter(p => busca === '' || p.name.toLowerCase().includes(busca.toLowerCase()) || (p.sku || '').toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => ordem === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Produtos</h1>
        <button onClick={() => { setProdutoEdit({}); setAbaModal('dados'); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome ou SKU..." value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
        <select value={ordem} onChange={e => setOrdem(e.target.value as 'asc' | 'desc')}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white font-semibold text-gray-700">
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase w-8"></th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Produto</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">SKU</th>
              {meuPapel !== 'marketing' && <th className="text-right px-5 py-3 text-xs font-black text-gray-500 uppercase">Preço</th>}
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Estoque</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Badge</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Lançamento</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : produtosFiltrados.map(p => {
              const expandido = expandidos.has(p.id)
              const variacoes = variacoesPorProduto[p.id] || []
              return (
                <>
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="pl-4 py-4">
                      <button onClick={() => toggleExpandir(p.id)}
                        className="text-gray-400 hover:text-green-600 transition-colors">
                        {expandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-sm text-gray-800 max-w-xs truncate">{p.name}</p>
                      
                      {p.family && <span className="text-xs text-gray-400 ml-1">{p.family}</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-mono">{p.sku}</td>
                    <td className="px-5 py-4 text-right">
                      {p.promo_price > 0 && <p className="text-xs text-gray-400 line-through">R$ {Number(p.price).toFixed(2).replace('.', ',')}</p>}
                      <p className="font-black text-green-700">R$ {Number(p.promo_price || p.price).toFixed(2).replace('.', ',')}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-bold text-sm ${p.stock_qty < 10 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock_qty}</span>
                    </td>
                    <td className="px-5 py-4 text-center cursor-pointer" onClick={e => { e.stopPropagation(); const bs = (p.badges && p.badges.length > 0) ? p.badges : (p.badge ? [p.badge] : []); setBadgesTemp(bs); setBadgeModalProduto(p) }} title="Clique para editar badges">
                      {(p.badges && p.badges.length > 0) || p.badge ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {((p.badges && p.badges.length > 0) ? p.badges : [p.badge]).map((b: string) => {
                            const bColors: Record<string,string> = {lancamento:'bg-purple-100 text-purple-700',exclusivo:'bg-amber-100 text-amber-700',oferta:'bg-red-100 text-red-700',promocao:'bg-orange-100 text-orange-700',smart:'bg-blue-100 text-blue-700',kit:'bg-green-100 text-green-700',novo:'bg-green-100 text-green-700'}
                            const bLabels: Record<string,string> = {lancamento:'Lançamento',exclusivo:'Exclusivo',oferta:'Oferta',promocao:'Promoção',smart:'Smart',kit:'Kit',novo:'Novo'}
                            return <span key={b} className={`text-xs font-bold px-2 py-0.5 rounded-full ${bColors[b]||'bg-gray-100 text-gray-600'}`}>{bLabels[b]||b}</span>
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs hover:text-green-600">+ badge</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center cursor-pointer" onClick={e => { e.stopPropagation(); toggleLancamentoProduto(p) }} title="Clique para alternar">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${p.is_lancamento ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-600'}`}>
                        {p.is_lancamento ? 'sim' : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => toggleAtivo(p.id, p.active)}
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${p.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setProdutoEdit(p); setAbaModal('dados'); setModal(true) }}
                          className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                        <button onClick={() => excluirProduto(p.id)}
                          className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>

                  {expandido && (
                    <tr key={`var-${p.id}`} className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={9} className="px-8 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-gray-500 uppercase tracking-wide">
                            Variações ({variacoes.length})
                          </span>
                          <button onClick={() => { setVarEdit(variacaoVazia(p.id)); setModalVar(true) }}
                            className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-800 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-50 transition-colors">
                            <Plus size={11} /> Adicionar variação
                          </button>
                        </div>
                        {variacoes.length === 0 ? (
                          <p className="text-xs text-gray-400 py-2">Nenhuma variação cadastrada.</p>
                        ) : (
                          <div className="space-y-1">
                            {variacoes.map(v => (
                              <div key={v.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
                                <span className="text-gray-400 text-xs">↳</span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-gray-700">{v.value}</span>
                                  <span className="text-gray-400 text-xs ml-2 ">{tipoLabel(v.type)}</span>
                                </div>
                                <span className="font-mono text-xs text-gray-500 w-28 truncate">{v.sku}</span>
                                <span className="font-mono text-xs text-gray-400 w-36 truncate">{v.ean}</span>
                                <span className="font-black text-green-700 w-20 text-right text-xs">
                                  R$ {Number(v.promo_price || v.price).toFixed(2).replace('.', ',')}
                                </span>
                                <span className={`text-xs font-bold w-16 text-center ${v.stock_qty === 0 ? 'text-red-500' : v.stock_qty < 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                                  {v.stock_qty} un
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold w-14 text-center ${v.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {v.active ? 'Ativo' : 'Off'}
                                </span>
                                <div className="flex gap-2">
                                  <button onClick={() => { setVarEdit(v); setModalVar(true) }}
                                    className="text-blue-400 hover:text-blue-600"><Pencil size={13} /></button>
                                  <button onClick={() => excluirVariacao(v)}
                                    className="text-red-300 hover:text-red-500"><Trash2 size={13} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Produto */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">{produtoEdit.id ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => { setModal(false); setProdutoEdit({}) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Abas do modal */}
            <div className="flex border-b border-gray-200 mb-4">
              <button onClick={() => setAbaModal('dados')}
                className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${abaModal === 'dados' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                Dados gerais
              </button>
              {produtoEdit.id && (
                <button onClick={() => { setAbaModal('variacoes'); carregarVariacoes(produtoEdit.id!) }}
                  className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${abaModal === 'variacoes' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Variações {variacoesPorProduto[produtoEdit.id!] ? `(${variacoesPorProduto[produtoEdit.id!].length})` : ''}
                </button>
              )}
              {produtoEdit.id && (
                <button onClick={() => { setAbaModal('funcionalidades'); carregarFeatures(produtoEdit.id!) }}
                  className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${abaModal === 'funcionalidades' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  Funcionalidades
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              {abaModal === 'dados' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Nome do produto *</label>
                    <input value={produtoEdit.name || ''} onChange={e => setProdutoEdit({ ...produtoEdit, name: e.target.value })}
                      placeholder="Ex: Lâmpada LED TKL 60 9W"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">SKU</label>
                      <input value={produtoEdit.sku || ''} onChange={e => setProdutoEdit({ ...produtoEdit, sku: e.target.value })}
                        placeholder="Ex: 61080246"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">EAN</label>
                      <input value={produtoEdit.ean || ''} onChange={e => setProdutoEdit({ ...produtoEdit, ean: e.target.value })}
                        placeholder="Ex: 7897079082876"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono" />
                    </div>
                  </div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Família/Linha</label>
                      <input value={produtoEdit.family || ''} onChange={e => setProdutoEdit({ ...produtoEdit, family: e.target.value })}
                        placeholder="Ex: TKL, Inlumix, Smart"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Categoria</label>
                      <input value={produtoEdit.category_slug || ''} onChange={e => setProdutoEdit({ ...produtoEdit, category_slug: e.target.value })}
                        placeholder="Ex: lampadas"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                  </div>
                  {meuPapel !== 'marketing' && <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Preço cartão *</label>
                      <input type="number" step="0.01" value={produtoEdit.price || ''}
                        onChange={e => setProdutoEdit({ ...produtoEdit, price: parseFloat(e.target.value) })}
                        placeholder="0,00"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Preço PIX</label>
                      <input type="number" step="0.01" value={produtoEdit.promo_price || ''}
                        onChange={e => setProdutoEdit({ ...produtoEdit, promo_price: parseFloat(e.target.value) })}
                        placeholder="0,00"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Estoque</label>
                      <input type="number" value={produtoEdit.stock_qty || ''}
                        onChange={e => setProdutoEdit({ ...produtoEdit, stock_qty: parseInt(e.target.value) })}
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                  </div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Peso (kg)</label>
                      <input type="number" step="0.001" value={produtoEdit.weight_kg || ''}
                        onChange={e => setProdutoEdit({ ...produtoEdit, weight_kg: parseFloat(e.target.value) })}
                        placeholder="0.045"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">Garantia</label>
                      <input value={produtoEdit.warranty || ''} onChange={e => setProdutoEdit({ ...produtoEdit, warranty: e.target.value })}
                        placeholder="Ex: 12 meses"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Descrição</label>
                    <textarea value={produtoEdit.description || ''} onChange={e => setProdutoEdit({ ...produtoEdit, description: e.target.value })}
                      rows={3} placeholder="Descrição do produto..."
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Imagem principal (URL)</label>
                    <input value={produtoEdit.main_image || ''} onChange={e => setProdutoEdit({ ...produtoEdit, main_image: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="ativo_prod" checked={produtoEdit.active ?? true}
                      onChange={e => setProdutoEdit({ ...produtoEdit, active: e.target.checked })}
                      className="w-4 h-4 accent-green-600" />
                    <label htmlFor="ativo_prod" className="text-sm font-bold text-gray-700">Produto ativo</label>
                  </div>
                </div>
              )}

              {abaModal === 'variacoes' && produtoEdit.id && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">Variações do produto (temperatura, cor, voltagem, etc.)</p>
                    <button onClick={() => { setVarEdit(variacaoVazia(produtoEdit.id!)); setModalVar(true) }}
                      className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-800 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                      <Plus size={13} /> Nova variação
                    </button>
                  </div>
                  {(variacoesPorProduto[produtoEdit.id] || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-sm">Nenhuma variação cadastrada.</p>
                      <p className="text-xs mt-1">Clique em "Nova variação" para adicionar.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(variacoesPorProduto[produtoEdit.id] || []).map(v => (
                        <div key={v.id} className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800 text-sm">{v.value}</span>
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tipoLabel(v.type)}</span>
                              {!v.active && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Inativo</span>}
                            </div>
                            <div className="flex gap-4 mt-1">
                              <span className="text-xs text-gray-400 font-mono">SKU: {v.sku || '—'}</span>
                              <span className="text-xs text-gray-400 font-mono">EAN: {v.ean || '—'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-green-700 text-sm">R$ {Number(v.promo_price || v.price).toFixed(2).replace('.', ',')}</p>
                            <p className={`text-xs ${v.stock_qty === 0 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{v.stock_qty} un</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setVarEdit(v); setModalVar(true) }}
                              className="text-blue-400 hover:text-blue-600"><Pencil size={14} /></button>
                            <button onClick={() => excluirVariacao(v)}
                              className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {abaModal === 'funcionalidades' && produtoEdit.id && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 pb-1">Cadastre até 4 funcionalidades. Campos em branco não são exibidos.</p>
                  {features.slice(0, 4).map((f, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Funcionalidade {i + 1}</span>
                        {f.title && <span className="text-xs text-green-600 font-bold">Preenchida</span>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Título</label>
                        <input value={f.title} onChange={e => {
                          const next = [...features]; next[i] = { ...next[i], title: e.target.value }; setFeatures(next)
                        }} placeholder="Ex: Alta eficiência energética"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Descrição</label>
                        <textarea value={f.description} onChange={e => {
                          const next = [...features]; next[i] = { ...next[i], description: e.target.value }; setFeatures(next)
                        }} placeholder="Descrição breve" rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">URL da imagem</label>
                        <input value={f.image_url} onChange={e => {
                          const next = [...features]; next[i] = { ...next[i], image_url: e.target.value }; setFeatures(next)
                        }} placeholder="https://..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                        {f.image_url && (
                          <img src={f.image_url} alt="" className="mt-2 h-16 object-contain border border-gray-100 rounded-lg p-1 bg-gray-50" />
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => salvarFeatures(produtoEdit.id!)} disabled={featuresSaving}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl transition-colors">
                    {featuresSaving ? 'Salvando...' : 'Salvar Funcionalidades'}
                  </button>
                </div>
              )}
            </div>

            {abaModal === 'dados' && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => { setModal(false); setProdutoEdit({}) }}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={salvarProduto} disabled={!produtoEdit.name}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                  {produtoEdit.id ? 'Salvar alterações' : 'Criar produto'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Variação */}
      {modalVar && varEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{varEdit.id ? 'Editar Variação' : 'Nova Variação'}</h2>
              <button onClick={() => { setModalVar(false); setVarEdit(null) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo *</label>
                  <select value={varEdit.type} onChange={e => setVarEdit({ ...varEdit, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white capitalize">
                    {TIPOS_VARIACAO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Valor *</label>
                  <input value={varEdit.value} onChange={e => setVarEdit({ ...varEdit, value: e.target.value })}
                    placeholder="Ex: 3000K, Preto, 127V"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">SKU</label>
                  <input value={varEdit.sku} onChange={e => setVarEdit({ ...varEdit, sku: e.target.value })}
                    placeholder="Ex: 61080246"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">EAN</label>
                  <input value={varEdit.ean} onChange={e => setVarEdit({ ...varEdit, ean: e.target.value })}
                    placeholder="Ex: 7897079082876"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Preço cartão</label>
                  <input type="number" step="0.01" value={varEdit.price || ''}
                    onChange={e => setVarEdit({ ...varEdit, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Preço PIX</label>
                  <input type="number" step="0.01" value={varEdit.promo_price || ''}
                    onChange={e => setVarEdit({ ...varEdit, promo_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Estoque</label>
                  <input type="number" value={varEdit.stock_qty || ''}
                    onChange={e => setVarEdit({ ...varEdit, stock_qty: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Descrição técnica (opcional)</label>
                <textarea value={varEdit.technical_description || ''} rows={2}
                  onChange={e => setVarEdit({ ...varEdit, technical_description: e.target.value })}
                  placeholder="Ex: Luz branca quente. Ideal para salas e quartos."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ativo_var" checked={varEdit.active}
                  onChange={e => setVarEdit({ ...varEdit, active: e.target.checked })}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="ativo_var" className="text-sm font-bold text-gray-700">Variação ativa</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModalVar(false); setVarEdit(null) }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvarVariacao} disabled={!varEdit.value}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {varEdit.id ? 'Salvar alterações' : 'Criar variação'}
              </button>
            </div>
          </div>
        </div>
      )}
      {badgeModalProduto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setBadgeModalProduto(null)}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-800 text-lg mb-1">Badges</h3>
            <p className="text-xs text-gray-400 mb-4">{badgeModalProduto.name?.substring(0, 40)} — Selecione até 3</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(['lancamento', 'exclusivo', 'oferta', 'promocao', 'smart', 'kit'] as string[]).map(b => {
                const labels: Record<string, string> = { lancamento: 'Lançamento', exclusivo: 'Exclusivo', oferta: 'Oferta', promocao: 'Promoção', smart: 'Smart', kit: 'Kit' }
                const colors: Record<string, string> = { lancamento: 'bg-purple-100 text-purple-700 border-purple-400', exclusivo: 'bg-amber-100 text-amber-700 border-amber-400', oferta: 'bg-red-100 text-red-700 border-red-400', promocao: 'bg-orange-100 text-orange-700 border-orange-400', smart: 'bg-blue-100 text-blue-700 border-blue-400', kit: 'bg-green-100 text-green-700 border-green-400' }
                const sel = badgesTemp.includes(b)
                return (
                  <button key={b} onClick={() => {
                    if (sel) setBadgesTemp(badgesTemp.filter(x => x !== b))
                    else if (badgesTemp.length < 2) setBadgesTemp([...badgesTemp, b])
                    else alert('Máximo 2 badges por produto')
                  }} className={['text-sm font-bold px-4 py-2 rounded-full border-2 transition-all', sel ? colors[b] : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'].join(' ')}>
                    {labels[b]}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setBadgeModalProduto(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => salvarBadges(badgeModalProduto, badgesTemp)} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
