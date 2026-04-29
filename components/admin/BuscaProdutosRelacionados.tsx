import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Search } from 'lucide-react'

type Produto = { id: string; name: string; sku: string; cor_id?: string }

export default function BuscaProdutosRelacionados({
  produtoAtualId,
  selecionados,
  onChange,
}: {
  produtoAtualId: string
  selecionados: string[]
  onChange: (ids: string[]) => void
}) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<Produto[]>([])
  const [nomes, setNomes] = useState<Record<string, string>>({})
  const debounce = useRef<NodeJS.Timeout>()

  // Carregar nomes dos produtos já selecionados
  useEffect(() => {
    if (!selecionados.length) return
    supabase.from('products').select('id,name').in('id', selecionados)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        data.forEach(p => { map[p.id] = p.name })
        setNomes(prev => ({ ...prev, ...map }))
      })
  }, [selecionados.join(',')])

  // Busca com debounce
  useEffect(() => {
    if (!busca.trim()) { setResultados([]); return }
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      const { data } = await supabase.from('products')
        .select('id,name,sku')
        .ilike('name', `%${busca}%`)
        .eq('active', true)
        .neq('id', produtoAtualId)
        .limit(8)
      setResultados(data || [])
    }, 300)
  }, [busca])

  function adicionar(p: Produto) {
    if (selecionados.includes(p.id)) return
    setNomes(prev => ({ ...prev, [p.id]: p.name }))
    onChange([...selecionados, p.id])
    setBusca('')
    setResultados([])
  }

  function remover(id: string) {
    onChange(selecionados.filter(s => s !== id))
  }

  return (
    <div>
      {/* Produtos já linkados */}
      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selecionados.map(id => (
            <span key={id} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
              {nomes[id] ? nomes[id].substring(0, 30) + (nomes[id].length > 30 ? '…' : '') : id.substring(0, 8) + '…'}
              <button onClick={() => remover(id)} className="hover:text-red-600 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Campo de busca */}
      <div className="relative">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-green-500">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar produto por nome..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        {resultados.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {resultados.map(p => (
              <button
                key={p.id}
                onClick={() => adicionar(p)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors flex items-center justify-between ${
                  selecionados.includes(p.id) ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-gray-800">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{p.sku}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selecionados.length > 0 && (
        <p className="text-xs text-green-600 mt-1">{selecionados.length} produto(s) linkado(s) — seletor de cor aparecerá na PDP</p>
      )}
    </div>
  )
}
