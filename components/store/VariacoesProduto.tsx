'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
}

type ColorLib = { nome: string; hex: string }

type Props = {
  produtoId: string
  onSelect: (v: Variacao | null) => void
}

const typeLabel: Record<string, string> = {
  cor: 'Cor',
  cor_peca: 'Cor da Peça',
  temperatura: 'Temperatura de Cor',
  voltagem: 'Voltagem',
  tamanho: 'Tamanho',
  potencia: 'Potência',
}

const tempColor: Record<string, string> = {
  '2700K': 'bg-amber-200 border-amber-400',
  '3000K': 'bg-amber-100 border-amber-300',
  '4000K': 'bg-yellow-50 border-yellow-300',
  '5000K': 'bg-blue-50 border-blue-200',
  '6500K': 'bg-blue-100 border-blue-300',
}

export default function VariacoesProduto({ produtoId, onSelect }: Props) {
  const [variacoes, setVariacoes] = useState<Variacao[]>([])
  const [selecionados, setSelecionados] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [cores, setCores] = useState<ColorLib[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', produtoId)
        .eq('active', true)
        .order('type')
      setVariacoes((data || []) as Variacao[])
      setLoading(false)
    }
    load()

    // Carrega biblioteca de cores via fetch direto
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/color_library?select=nome,hex&ativo=eq.true'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
      .then(r => r.json())
      .then(d => setCores(Array.isArray(d) ? d as ColorLib[] : []))
      .catch(() => setCores([]))
  }, [produtoId])

  useEffect(() => {
    const tipos = [...new Set(variacoes.map(v => v.type))]
    const todosSelecionados = tipos.every(t => selecionados[t])
    if (todosSelecionados && tipos.length > 0) {
      const match = variacoes.find(v =>
        Object.entries(selecionados).every(([tipo, valor]) =>
          v.type === tipo ? v.value === valor : true
        )
      )
      onSelect(match || null)
    } else {
      onSelect(null)
    }
  }, [selecionados, variacoes, onSelect])

  function getCorHex(nome: string): string {
    const c = cores.find(x => x.nome.toLowerCase() === nome.toLowerCase())
    return c?.hex || '#cccccc'
  }

  if (loading || variacoes.length === 0) return null

  const tipos = [...new Set(variacoes.map(v => v.type))]

  return (
    <div className="space-y-4 mb-5">
      {tipos.map(tipo => {
        const opcoes = variacoes.filter(v => v.type === tipo && v.stock_qty > 0)
        const selecionado = selecionados[tipo]
        const isCor = tipo === 'cor' || tipo === 'cor_peca'

        return (
          <div key={tipo}>
            <p className="text-sm font-black text-gray-700 mb-2">
              {typeLabel[tipo] || tipo}
              {selecionado && <span className="font-normal text-gray-500 ml-1">— {selecionado}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {opcoes.map(v => {
                const ativo = selecionado === v.value
                const isTemp = tipo === 'temperatura'

                if (isCor) {
                  const hex = getCorHex(v.value)
                  const isRainbow = hex === 'rainbow'
                  return (
                    <button
                      key={v.id}
                      title={v.value}
                      onClick={() => setSelecionados(prev => ({ ...prev, [tipo]: v.value }))}
                      className={`relative w-9 h-9 rounded-full transition-all cursor-pointer hover:scale-110 ${ativo ? 'ring-4 ring-green-500 ring-offset-2 scale-110' : 'ring-2 ring-gray-200'}`}
                      style={isRainbow
                        ? { background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }
                        : { backgroundColor: hex }
                      }
                    />
                  )
                }

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelecionados(prev => ({ ...prev, [tipo]: v.value }))}
                    className={`
                      relative px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all cursor-pointer
                      ${ativo ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-700 hover:border-gray-400'}
                      ${isTemp && tempColor[v.value] ? tempColor[v.value] : ''}
                    `}
                  >
                    {isTemp && (
                      <span className={`inline-block w-3 h-3 rounded-full mr-1.5 border ${
                        v.value.includes('2700') || v.value.includes('3000') ? 'bg-amber-300' :
                        v.value.includes('4000') ? 'bg-yellow-200' : 'bg-blue-200'
                      }`} />
                    )}
                    {v.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
