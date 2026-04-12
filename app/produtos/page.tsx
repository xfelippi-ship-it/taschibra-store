/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/store/Header"
import Footer from "@/components/store/Footer"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import { supabase } from '@/lib/supabase'


const badgeColors: Record<string, string> = {
  novo: "bg-green-600", smart: "bg-blue-500", oferta: "bg-red-500", exclusivo: "bg-purple-600",
}

const PAGE_SIZE = 48

function ProdutosContent() {
  const params = useSearchParams()
  const categoria = params.get("categoria") || ""
  const busca = params.get("busca") || ""
  const [produtos, setProdutos] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [loading, setLoading] = useState(true)
  const [titulo, setTitulo] = useState("Todos os Produtos")
  const [ordem, setOrdem] = useState("sort_asc")
  const [precoMin, setPrecoMin] = useState("")
  const [precoMax, setPrecoMax] = useState("")
  const { addItem } = useCart()

  useEffect(() => { setPagina(1) }, [categoria, busca, ordem, precoMin, precoMax])

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      const from = (pagina - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const [ordemCampo, ordemDir] = ordem.split("_")
      const ascending = ordemDir === "asc"
      const campoOrdem = ordemCampo === "name" ? "name" : ordemCampo === "preco" ? "price" : ordemCampo === "sales" ? "sales_count" : ordemCampo === "sort" ? "sort_order" : "created_at"
      let query = supabase.from("products").select("*", { count: "exact" }).order(campoOrdem, { ascending })
      if (precoMin) query = query.gte("price", parseFloat(precoMin))
      if (precoMax) query = query.lte("price", parseFloat(precoMax))
      if (busca) {
        query = query.or(`name.ilike.%${busca}%,sku.ilike.%${busca}%,description.ilike.%${busca}%`)
        setTitulo(`Resultados para: "${busca}"`)
      } else if (categoria) {
        query = categoria === 'lancamentos' ? query.eq('is_lancamento', true) : query.ilike('category_slug', categoria)
        const label: Record<string, string> = {
          "lancamentos": "Lançamentos",
          "lampadas": "Lâmpadas",
          "lampadas-led": "Lâmpadas LED",
          "lampadas-decor": "Lâmpadas Decor",
          "material-eletrico": "Material Elétrico",
          "material-eletrico-carregadores-e-cabos-usb": "Carregadores e Cabos USB",
          "material-eletrico-extensoes": "Extensões",
          "smart": "SMART",
          "outlet": "Outlet",
          "teto": "Teto",
          "teto-painel": "Painel",
          "teto-spot": "Spot",
          "teto-plafon": "Plafon",
          "teto-pendente": "Pendente",
          "teto-lustre": "Lustre",
          "teto-luminaria": "Luminária",
          "refletor": "Refletor",
          "decorativo": "Decorativo",
          "parede": "Parede",
          "perfil": "Perfil",
          "exclusivos": "Exclusivos",
          "cinta-eletrificada": "Cinta Eletrificada",
          "pecas-de-reposicao": "Peças de Reposição",
          "trilho-magnetico": "Trilho Magnético",
          "marcenaria": "Marcenaria",
          "sinalizacao": "Sinalização",
          "piso": "Piso",
          "mesa": "Mesa",
          "profissional": "Profissional",
        }
        setTitulo(label[categoria] || categoria.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
      } else {
        setTitulo("Todos os Produtos")
      }

      const { data, count } = await query.range(from, to)
      setProdutos(data || [])
      setTotal(count || 0)
      setLoading(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    carregar()
  }, [categoria, pagina, busca, ordem, precoMin, precoMax])

  const totalPaginas = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold">{titulo}</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-gray-800">{titulo}</h1>
          <span className="text-sm text-gray-500">{total} produtos encontrados</span>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Ordenar por:</label>
            <select value={ordem} onChange={e => setOrdem(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white">
              <option value="sort_asc">Relevância</option>
              <option value="name_asc">Nome A-Z</option>
              <option value="name_desc">Nome Z-A</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
              <option value="created_at_desc">Mais recentes</option>
              <option value="sales_desc">Mais vendidos</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-600 whitespace-nowrap">Preço:</label>
            <input type="number" placeholder="Mín" value={precoMin} onChange={e => setPrecoMin(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 w-24 bg-white" />
            <span className="text-gray-400 text-sm">—</span>
            <input type="number" placeholder="Máx" value={precoMax} onChange={e => setPrecoMax(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 w-24 bg-white" />
          </div>
          {(precoMin || precoMax || ordem !== "name_asc") && (
            <button onClick={() => { setOrdem("name_asc"); setPrecoMin(""); setPrecoMax("") }}
              className="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-colors">
              ✕ Limpar filtros
            </button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3" />
                <div className="bg-gray-200 h-4 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Nenhum produto encontrado nesta categoria.</p>
            <Link href="/produtos" className="text-green-600 hover:underline mt-4 block">Ver todos os produtos</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {produtos.map(p => {
                const preco = p.promo_price || p.price || 0
                const precoCartao = p.price || 0
                const badge = (p.badge || "").toLowerCase()
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group">
                    <Link href={"/produto/" + p.slug}>
                      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
                        {badge && badgeColors[badge] && (
                          <span className={"absolute top-2 left-2 z-10 text-white text-xs font-black px-2 py-0.5 rounded " + badgeColors[badge]}>
                            {p.badge}
                          </span>
                        )}
                        {p.main_image ? (
                          <img src={p.main_image} alt={p.name}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={"/produto/" + p.slug}>
                        <p className="text-sm font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 min-h-[2.5rem] hover:text-green-700" style={{textTransform:"capitalize",textTransformOrigin:"initial"}}>{p.name.toLowerCase().replace(/(?:^|\s|\/|-)\S/g, l => l.toUpperCase())}</p>
                      </Link>
                      {preco > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
                            <span className="font-black text-green-700 text-lg">R$ {preco.toFixed(2).replace(".", ",")}</span>
                          </div>
                          {precoCartao > preco && (
                            <p className="text-xs text-gray-400">ou R$ {precoCartao.toFixed(2).replace(".", ",")} no cartão</p>
                          )}
                        </div>
                      )}
                      <button onClick={() => addItem({ id: p.id, name: p.name, slug: p.slug, price: precoCartao, promo_price: preco, emoji: "💡" })}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 rounded-lg transition-colors">
                        COMPRAR
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:border-green-500 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  ← Anterior
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPaginas)].map((_, i) => {
                    const n = i + 1
                    if (totalPaginas <= 7 || n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1) {
                      return (
                        <button key={n} onClick={() => setPagina(n)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${n === pagina ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600"}`}>
                          {n}
                        </button>
                      )
                    }
                    if (Math.abs(n - pagina) === 2) return <span key={n} className="w-9 h-9 flex items-center justify-center text-gray-400">…</span>
                    return null
                  })}
                </div>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:border-green-500 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default function ProdutosPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
        <ProdutosContent />
      </Suspense>
      <Footer />
    </>
  )
}
