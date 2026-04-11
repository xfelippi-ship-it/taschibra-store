'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ShoppingCart, Heart, Shield, ChevronRight, Star, Package, Zap, Thermometer, Ruler } from 'lucide-react'
import CalculaFrete from '@/components/store/CalculaFrete'
import VariacoesProduto from '@/components/store/VariacoesProduto'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Variacao = {
  id: string
  name: string
  type: string
  value: string
  sku?: string
  ean?: string
  price?: number
  promo_price?: number
  stock_qty: number
  active: boolean
  technical_description?: string
}

type Produto = {
  id: string
  name: string
  slug: string
  price: number
  promo_price: number
  category_slug: string
  sku?: string
  ean?: string
  description?: string
  technical_description?: string
  main_image?: string
  images?: string[]
  warranty?: string
  warranty_months?: number
  weight_kg?: number
  height_cm?: number
  width_cm?: number
  length_cm?: number
  voltage?: string
  power_w?: number
  color_temp_k?: number
  ip_rating?: string
  brand?: string
}


type Feature = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  sort_order: number
}

function brl(v: number) {
  return v.toFixed(2).replace('.', ',')
}

function calcParcelas(preco: number): { n: number; valor: string } {
  for (let n = 10; n >= 2; n--) {
    if (preco / n >= 15) return { n, valor: brl(preco / n) }
  }
  return { n: 1, valor: brl(preco) }
}


// ─── Card de produto ──────────────────────────────────────────────────────────

function ProdutoCard({ p }: { p: Produto }) {
  const preco = p.promo_price && p.promo_price > 0 ? p.promo_price : p.price
  const desconto = p.promo_price && p.promo_price > 0 && p.price > p.promo_price
    ? Math.round((1 - p.promo_price / p.price) * 100) : 0
  return (
    <Link href={`/produto/${p.slug}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-md transition-all group flex flex-col">
      <div className="bg-gray-50 flex items-center justify-center h-36 p-3 relative">
        {desconto > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">-{desconto}%</span>
        )}
        {p.main_image
          ? <img src={p.main_image} alt={p.name} className="h-28 object-contain group-hover:scale-105 transition-transform" />
          : <span className="text-5xl">💡</span>}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-semibold text-gray-700 leading-tight line-clamp-2 mb-auto pb-2">{p.name}</p>
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          <span className="text-xs bg-teal-500 text-white font-black px-1.5 py-0.5 rounded">PIX</span>
          <span className="text-sm font-black text-green-700">R$ {brl(preco)}</span>
        </div>
        {p.price > preco && (
          <p className="text-[10px] text-gray-400 mt-0.5">ou R$ {brl(p.price)} no cartão</p>
        )}
      </div>
    </Link>
  )
}

// ─── Seção de produtos sugeridos (similares + complementares) ─────────────────

function ProdutosRelacionados({ categorySlug, produtoAtualId }: { categorySlug: string; produtoAtualId: string }) {
  const [similares, setSimilares] = useState<Produto[]>([])
  const [complementares, setComplementares] = useState<{ label: string; produtos: Produto[] }[]>([])

  useEffect(() => {
    if (!categorySlug) return

    // Similares — mesma categoria
    supabase
      .from('products')
      .select('id, name, slug, price, promo_price, main_image')
      .eq('category_slug', categorySlug)
      .neq('id', produtoAtualId)
      .eq('active', true)
      .limit(4)
      .then(({ data }) => setSimilares(data || []))

    // Regras de complementares para esta categoria
    supabase
      .from('complement_rules')
      .select('target_slug, label, sort_order')
      .eq('source_slug', categorySlug)
      .order('sort_order')
      .then(async ({ data: rules }) => {
        if (!rules?.length) return
        const grupos = await Promise.all(
          rules.map(async (rule) => {
            const { data: prods } = await supabase
              .from('products')
              .select('id, name, slug, price, promo_price, main_image')
              .eq('category_slug', rule.target_slug)
              .eq('active', true)
              .limit(4)
            return { label: rule.label, produtos: prods || [] }
          })
        )
        setComplementares(grupos.filter(g => g.produtos.length > 0))
      })
  }, [categorySlug, produtoAtualId])

  if (!similares.length && !complementares.length) return null

  return (
    <div className="border-t border-gray-100 mt-4">
      {/* Similares */}
      {similares.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-green-600 rounded-full" />
            <h2 className="text-base font-black text-gray-800">Produtos Similares</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similares.map(p => <ProdutoCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* Complementares — todos os grupos numa única seção */}
      {complementares.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-yellow-400 rounded-full" />
            <h2 className="text-base font-black text-gray-800">Produtos Complementares</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {complementares.flatMap(grupo => grupo.produtos).slice(0, 4).map(p => <ProdutoCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProdutoPage() {
  const { slug } = useParams<{ slug: string }>()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [imgAtiva, setImgAtiva] = useState(0)
  const [adicionado, setAdicionado] = useState(false)
  const [variacaoSelecionada, setVariacaoSelecionada] = useState<Variacao | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'descricao' | 'tecnico' | 'garantia'>('descricao')
  const [features, setFeatures] = useState<Feature[]>([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewAuthor, setReviewAuthor] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [reviews, setReviews] = useState<{id:string;author_name:string;rating:number;comment:string;verified:boolean;created_at:string}[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()
      setProduto(data)
      setLoading(false)
    }
    async function loadExtras(id: string) {
      const [{ data: feats }, { data: revs }] = await Promise.all([
        supabase.from('product_features').select('id,title,description,image_url,sort_order').eq('product_id', id).order('sort_order'),
        supabase.from('product_reviews').select('id,author_name,rating,comment,verified,created_at').eq('product_id', id).order('created_at', { ascending: false })
      ])
      setFeatures(feats || [])
      setReviews(revs || [])
    }
    if (slug) load().then(() => {
      supabase.from('products').select('id').eq('slug', slug).single().then(({ data }) => {
        if (data?.id) loadExtras(data.id)
      })
    })
  }, [slug])

  if (loading) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>

      {/* ── Avaliações ── */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="border-t border-gray-100 py-8">
          <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-1 h-5 bg-yellow-400 rounded-full block" />
            Avaliações dos clientes
          </h2>
          <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
            {/* Painel resumo */}
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <div className="text-4xl font-black text-gray-800">
                {reviews.length > 0 ? (reviews.reduce((a,r) => a + r.rating, 0) / reviews.length).toFixed(1) : '—'}
              </div>
              <div className="text-yellow-400 text-lg my-1">
                {reviews.length > 0 ? '★'.repeat(Math.round(reviews.reduce((a,r) => a + r.rating,0)/reviews.length)) : '☆☆☆☆☆'}
              </div>
              <div className="text-xs text-gray-500">{reviews.length} avaliações</div>
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => r.rating === star).length
                const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="text-gray-500 w-3">{star}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: pct + '%' }} />
                    </div>
                    <span className="text-gray-400 w-7 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
            {/* Lista de reviews */}
            <div className="flex flex-col gap-3">
              {reviews.length === 0 && (
                <p className="text-sm text-gray-400 italic">Nenhuma avaliação ainda. Seja o primeiro!</p>
              )}
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                      {r.author_name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{r.author_name}</p>
                      <p className="text-xs text-gray-400">{r.verified ? 'Compra verificada · ' : ''}{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
              {/* Form nova avaliação */}
              {!reviewSent ? (
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm font-bold text-gray-700 mb-3">Deixe sua avaliação</p>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewRating(s)}
                        className={`text-xl transition-colors ${s <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                    ))}
                  </div>
                  <input value={reviewAuthor} onChange={e => setReviewAuthor(e.target.value)}
                    placeholder="Seu nome" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:border-green-500" />
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                    placeholder="Conte sua experiência com o produto..." rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-green-500 resize-none" />
                  <button onClick={async () => {
                    if (!reviewAuthor.trim() || !reviewText.trim()) return
                    await supabase.from('product_reviews').insert({
                      product_id: produto!.id, author_name: reviewAuthor,
                      rating: reviewRating, comment: reviewText, verified: false
                    })
                    setReviewSent(true)
                  }} className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
                    Enviar avaliação
                  </button>
                </div>
              ) : (
                <div className="border border-green-200 rounded-xl p-4 bg-green-50 text-sm text-green-700 font-semibold text-center">
                  ✅ Obrigado pela sua avaliação!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </>
  )

  if (!produto) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        <Link href="/produtos" className="text-green-600 font-bold underline">Ver todos os produtos</Link>
      </div>
      
    </>
  )

  const descricaoTecnica = variacaoSelecionada?.technical_description || produto.technical_description

  const precoVista = variacaoSelecionada?.promo_price && variacaoSelecionada.promo_price > 0
    ? variacaoSelecionada.promo_price
    : variacaoSelecionada?.price && variacaoSelecionada.price > 0
    ? variacaoSelecionada.price
    : produto.promo_price && produto.promo_price > 0
    ? produto.promo_price
    : produto.price

  const precoCartao = variacaoSelecionada?.price && variacaoSelecionada.price > 0
    ? variacaoSelecionada.price
    : produto.price

  const desconto = precoCartao > precoVista ? Math.round((1 - precoVista / precoCartao) * 100) : 0
  const { n: nParcelas, valor: valorParcela } = calcParcelas(precoCartao)

  const garantia = produto.warranty
    || (produto.warranty_months ? `${produto.warranty_months} meses` : null)
    || 'Garantia do fabricante'

  const imagens = produto.images?.filter(Boolean).length
    ? produto.images!.filter(Boolean)
    : produto.main_image ? [produto.main_image] : []

  const specs: { label: string; valor: string; icon?: React.ReactNode }[] = []
  if (produto.voltage) specs.push({ label: 'Tensão', valor: produto.voltage, icon: <Zap size={13} /> })
  if (produto.power_w) specs.push({ label: 'Potência', valor: `${produto.power_w}W`, icon: <Zap size={13} /> })
  if (produto.color_temp_k) specs.push({ label: 'Temperatura de Cor', valor: `${produto.color_temp_k}K`, icon: <Thermometer size={13} /> })
  if (produto.ip_rating) specs.push({ label: 'Índice de Proteção', valor: produto.ip_rating })
  if (produto.weight_kg) specs.push({ label: 'Peso', valor: `${produto.weight_kg} kg`, icon: <Package size={13} /> })
  if (produto.height_cm || produto.width_cm || produto.length_cm) {
    const dims = [produto.height_cm, produto.width_cm, produto.length_cm].filter(Boolean).join(' × ')
    specs.push({ label: 'Dimensões (A×L×C)', valor: `${dims} cm`, icon: <Ruler size={13} /> })
  }
  if (variacaoSelecionada?.ean || produto.ean) specs.push({ label: 'EAN', valor: variacaoSelecionada?.ean || produto.ean! })
  if (variacaoSelecionada?.sku || produto.sku) specs.push({ label: 'SKU', valor: variacaoSelecionada?.sku || produto.sku! })

  const categoriaLabel = produto.category_slug
    ? produto.category_slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Produtos'
  const categoriaHref = produto.category_slug ? `/produtos?categoria=${produto.category_slug}` : '/produtos'

  function handleAdd() {
    addItem({
      id: variacaoSelecionada?.id || produto!.id,
      slug: produto!.slug,
      name: variacaoSelecionada ? `${produto!.name} — ${variacaoSelecionada.value}` : produto!.name,
      price: precoCartao,
      promo_price: precoVista,
      emoji: '💡',
    })
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2000)
  }

  const temAbas = !!(produto.description || descricaoTecnica || specs.length > 0)

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto text-xs text-gray-500 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <Link href={categoriaHref} className="text-green-600 hover:underline">{categoriaLabel}</Link>
          <ChevronRight size={12} className="flex-shrink-0" />
          <span className="text-gray-700 font-semibold truncate max-w-[200px]">{produto.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 md:grid md:grid-cols-2 md:gap-16 md:items-start pb-24 md:pb-8 overflow-visible">

        {/* Imagens */}
        <div className="mb-4 md:mb-0">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center h-64 md:h-96 overflow-hidden mb-3">
            {imagens.length > 0
              ? <img src={imagens[imgAtiva]} alt={produto.name} className="h-56 md:h-80 object-contain" />
              : <span className="text-8xl md:text-9xl">💡</span>
            }
          </div>
          {imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((img, i) => (
                <button key={i} onClick={() => setImgAtiva(i)}
                  className={`flex-shrink-0 w-14 h-14 border-2 rounded-lg overflow-hidden transition-colors ${imgAtiva === i ? 'border-green-500' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div>
          <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-1">
            {produto.brand || 'TASCHIBRA'}
          </p>
          <h1 className="text-xl md:text-2xl font-black text-gray-800 leading-tight mb-1">{produto.name}</h1>

          {(variacaoSelecionada?.sku || produto.sku) && (
            <p className="text-xs text-gray-400 mb-3">
              SKU: {variacaoSelecionada?.sku || produto.sku}
              {(variacaoSelecionada?.ean || produto.ean) && (
                <span className="ml-3">EAN: {variacaoSelecionada?.ean || produto.ean}</span>
              )}
            </p>
          )}

          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />)}
            <span className="text-xs text-gray-500 ml-1">Taschibra</span>
          </div>

          {/* Variações — antes do preço pois definem o valor */}
          <VariacoesProduto produtoId={produto.id} onSelect={setVariacaoSelecionada} />

          <CalculaFrete produtoId={produto.id} />

          {/* Preço */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
            {nParcelas > 1 && (
              <p className="text-xs text-gray-600 mb-1">
                No cartão em até <strong className="text-gray-800">{nParcelas}x de R$ {valorParcela}</strong> sem juros
              </p>
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-green-100 mt-2">
              <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
              <span className="text-2xl md:text-3xl font-black text-green-700">R$ {brl(precoVista)}</span>
              {desconto > 0 && (
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{desconto}%</span>
              )}
            </div>
            {desconto > 0 && (
              <p className="text-xs text-gray-500 mt-1">ou R$ {brl(precoCartao)} no cartão</p>
            )}
          </div>

          {/* Qty + Comprar desktop */}
          <div className="hidden md:flex gap-3 mb-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">−</button>
              <span className="w-12 h-12 flex items-center justify-center text-sm font-black border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-10 h-12 bg-gray-50 text-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">+</button>
            </div>
            <button onClick={handleAdd}
              className={`flex-1 font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${adicionado ? 'bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              <ShoppingCart size={18} />
              {adicionado ? 'ADICIONADO! ✓' : 'ADICIONAR AO CARRINHO'}
            </button>
          </div>

          <div className="hidden md:flex gap-3 mb-5">
            <button className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:border-green-500 hover:text-green-600 flex items-center justify-center gap-2 transition-colors">
              <Heart size={15} /> Favoritar
            </button>
          </div>


          {/* Abas */}
          {temAbas && (
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="flex border-b border-gray-200">
                {produto.description && (
                  <button onClick={() => setAbaAtiva('descricao')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors ${abaAtiva === 'descricao' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Descrição
                  </button>
                )}
                {(descricaoTecnica || specs.length > 0) && (
                  <button onClick={() => setAbaAtiva('tecnico')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors ${abaAtiva === 'tecnico' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Especificações
                  </button>
                )}
                <button onClick={() => setAbaAtiva('garantia')}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${abaAtiva === 'garantia' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Garantia
                </button>
              </div>

              <div className="p-4">
                {abaAtiva === 'descricao' && produto.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{produto.description}</p>
                )}
                {abaAtiva === 'tecnico' && (
                  <div>
                    {descricaoTecnica && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{descricaoTecnica}</p>
                    )}
                    {specs.length > 0 && (
                      <table className="w-full text-sm">
                        <tbody>
                          {specs.map((s, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-1.5 px-2 text-gray-500 font-medium w-1/2">
                                <span className="flex items-center gap-1">{s.icon}{s.label}</span>
                              </td>
                              <td className="py-1.5 px-2 text-gray-800 font-semibold">{s.valor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {!descricaoTecnica && specs.length === 0 && (
                      <p className="text-sm text-gray-400">Especificações não disponíveis.</p>
                    )}
                  </div>
                )}
                {abaAtiva === 'garantia' && (
                  <div className="flex items-start gap-3">
                    <Shield size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-800 mb-1">Garantia do produto</p>
                      <p className="text-sm text-gray-600">{garantia}</p>
                      <p className="text-xs text-gray-400 mt-2">Para acionar a garantia, guarde a nota fiscal e entre em contato com a Taschibra.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Garantia simples se não há abas */}
          {!temAbas && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-gray-600">
              <Shield size={16} className="text-green-600 flex-shrink-0" />
              <span><strong>Garantia:</strong> {garantia}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 md:hidden z-50 shadow-lg">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-11 bg-gray-50 text-lg font-bold text-gray-700">−</button>
          <span className="w-9 h-11 flex items-center justify-center text-sm font-black border-x border-gray-200">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="w-9 h-11 bg-gray-50 text-lg font-bold text-gray-700">+</button>
        </div>
        <button onClick={handleAdd}
          className={`flex-1 font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${adicionado ? 'bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
          <ShoppingCart size={16} />
          {adicionado ? 'Adicionado! ✓' : 'Comprar'}
        </button>
        <button className="border border-gray-200 rounded-lg px-3 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
          <Heart size={18} />
        </button>
      </div>


      {/* ── Seções inferiores ── */}
      <div className="max-w-7xl mx-auto px-4 pb-24 md:pb-8">

        {/* Detalhes + Funcionalidades — sempre visível se houver descrição */}
        {(produto.description || features.length > 0) && (
          <div className="border-t border-gray-100 py-8">
            {produto.description && (
              <>
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-3">
                  <span className="w-1 h-5 bg-green-600 rounded-full block" />
                  Detalhes
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-3xl">{produto.description}</p>
              </>
            )}
            {features.length > 0 && (
              <>
                <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-3">
                  <span className="w-1 h-5 bg-blue-500 rounded-full block" />
                  Principais funcionalidades
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map(f => (
                    <div key={f.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-gray-50 h-28 flex items-center justify-center">
                        {f.image_url
                          ? <img src={f.image_url} alt={f.title} className="h-24 object-contain" />
                          : <span className="text-4xl opacity-20">⚡</span>}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-800 mb-1">{f.title}</p>
                        {f.description && <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Especificações técnicas — obrigatório se tiver specs */}
        {specs.length > 0 && (
          <div className="border-t border-gray-100 py-8">
            <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-3">
              <span className="w-1 h-5 bg-indigo-500 rounded-full block" />
              Especificações técnicas
            </h2>
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <tbody>
                {specs.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2.5 px-4 text-gray-500 font-medium w-1/2">
                      <span className="flex items-center gap-1.5">{s.icon}{s.label}</span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-800 font-semibold">{s.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
      <ProdutosRelacionados categorySlug={produto.category_slug} produtoAtualId={produto.id} />
      <Footer />
    </>
  )
}
