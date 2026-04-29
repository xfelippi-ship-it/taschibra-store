'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type ProdutoCor = {
  id: string
  name: string
  slug: string
  cor_id: string
  cor_nome: string
  cor_hex: string
}

export default function SwatchesCor({ produtoId }: { produtoId: string }) {
  const [produtos, setProdutos] = useState<ProdutoCor[]>([])
  const router = useRouter()

  useEffect(() => {
    async function carregar() {
      // Buscar familia_cor do produto atual
      const { data: prod } = await (supabase.from('products') as any)
        .select('id, familia_cor, cor_id')
        .eq('id', produtoId)
        .single()

      if (!prod?.familia_cor || !prod?.cor_id) return

      // Buscar todos os produtos da mesma familia com cor cadastrada
      const { data: prods } = await (supabase.from('products') as any)
        .select('id, name, slug, cor_id')
        .eq('familia_cor', prod.familia_cor)
        .eq('active', true)
        .not('cor_id', 'is', null)

      if (!prods || prods.length < 2) return

      // Buscar dados das cores
      const corIds = [...new Set(prods.map((p: any) => p.cor_id))]
      const { data: cores } = await (supabase.from as any)('color_library')
        .select('id, nome, hex')
        .in('id', corIds)

      if (!cores) return

      const result: ProdutoCor[] = prods
        .map((p: any) => {
          const cor = cores.find((c: any) => c.id === p.cor_id)
          return cor ? {
            id: p.id, name: p.name, slug: p.slug,
            cor_id: p.cor_id, cor_nome: cor.nome, cor_hex: cor.hex
          } : null
        })
        .filter(Boolean) as ProdutoCor[]

      setProdutos(result)
    }
    carregar()
  }, [produtoId])

  if (produtos.length < 2) return null

  const corAtual = produtos.find(p => p.id === produtoId)

  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-2">
        Cor: <span className="font-medium text-gray-800">{corAtual?.cor_nome || ''}</span>
      </p>
      <div className="flex gap-2 flex-wrap">
        {produtos.map(p => (
          <button
            key={p.id}
            onClick={() => router.push(`/produto/${p.slug}`)}
            title={p.cor_nome}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                p.id === produtoId
                  ? 'border-green-600 scale-110'
                  : 'border-gray-200 hover:border-green-400'
              }`}
              style={{
                background: p.cor_hex === 'rainbow'
                  ? 'linear-gradient(135deg,red,orange,yellow,green,blue,purple)'
                  : p.cor_hex
              }}
            >
              {p.id === produtoId && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500 text-center leading-tight" style={{maxWidth:'48px'}}>
              {p.cor_nome}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
