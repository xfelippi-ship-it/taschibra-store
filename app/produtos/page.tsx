/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Header from "@/components/store/Header"
import Footer from "@/components/store/Footer"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const badgeColors: Record<string, string> = {
  novo: "bg-green-600", smart: "bg-blue-500", oferta: "bg-red-500", exclusivo: "bg-purple-600",
}

function ProdutosContent() {
  const params = useSearchParams()
  const categoria = params.get("categoria") || ""
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [titulo, setTitulo] = useState("Todos os Produtos")
  const { addItem } = useCart()

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      let query = supabase.from("products").select("*").eq("active", true).order("name")

      if (categoria) {
        // normalizar categoria para comparar sem acento
        query = query.ilike("category_slug", categoria)
        setTitulo(categoria.replace(/-/g, " ").replace(/\w/g, l => l.toUpperCase()))
      } else {
        setTitulo("Todos os Produtos")
      }

      const { data } = await query.limit(100)
      setProdutos(data || [])
      setLoading(false)
    }
    carregar()
  }, [categoria])

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-800">{titulo}</h1>
          <span className="text-sm text-gray-500">{produtos.length} produtos encontrados</span>
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
                      <p className="text-sm font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 hover:text-green-700">{p.name}</p>
                    </Link>
                    {preco > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="bg-teal-500 text-white text-xs font-black px-1.5 py-0.5 rounded">PIX</span>
                          <span className="font-black text-green-700 text-lg">R$ {preco.toFixed(2).replace(".", ",")}</span>
                        </div>
                        {precoCartao > preco && (
                          <p className="text-xs text-gray-400">ou R$ {precoCartao.toFixed(2).replace(".", ",")} no cartao</p>
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
