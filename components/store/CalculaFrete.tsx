'use client'
import { useState, useEffect } from 'react'
import { Truck } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type OpcaoFrete = {
  id: number
  nome: string
  transportadora: string
  logo: string
  preco: number
  prazo: string
}

type RegraFreteGratis = {
  cep_from: string
  cep_to: string
  min_order_value: number
}

export default function CalculaFrete({ produtoId }: { produtoId: string }) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [opcoes, setOpcoes] = useState<OpcaoFrete[]>([])
  const [erro, setErro] = useState('')
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const [regras, setRegras] = useState<RegraFreteGratis[]>([])

  useEffect(() => {
    supabase.from('free_shipping_rules')
      .select('cep_from, cep_to, min_order_value')
      .eq('active', true)
      .then(({ data }) => { if (data) setRegras(data) })
  }, [])

  async function calcular() {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) { setErro('CEP inválido'); return }
    setLoading(true)
    setErro('')
    setOpcoes([])
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_destino: cepLimpo,
          produtos: [{ id: produtoId, quantity: 1, peso: 0.3 }]
        })
      })
      const data = await res.json()
      if (!res.ok || !data.opcoes?.length) {
        setErro('Não foi possível calcular o frete para este CEP.')
        return
      }
      setOpcoes(data.opcoes)
      setSelecionado(data.opcoes[0].id)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Verifica se o CEP digitado e elegivel para frete gratis
  function verificarFreteGratis(): { elegivel: boolean; minimo: number } {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length < 5) return { elegivel: false, minimo: 0 }
    const cepNum = parseInt(cepLimpo.substring(0, 8).padEnd(8, '0'))
    for (const r of regras) {
      const ini = parseInt(r.cep_from.replace(/\D/g, '').padEnd(8, '0'))
      const fim = parseInt(r.cep_to.replace(/\D/g, '').padEnd(8, '9'))
      if (cepNum >= ini && cepNum <= fim) return { elegivel: true, minimo: r.min_order_value }
    }
    return { elegivel: false, minimo: 0 }
  }

  const freteGratis = verificarFreteGratis()

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <p className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
        <Truck size={16} className="text-green-600" /> Calcule o frete
      </p>
      <div className="flex gap-2 mb-3">
        <input
          value={cep}
          onChange={e => setCep(e.target.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2').substring(0,9))}
          onKeyDown={e => e.key === 'Enter' && calcular()}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500"
        />
        <button
          onClick={calcular}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'OK'}
        </button>
      </div>
      <div className="flex items-center justify-between mb-2">
        <a href="https://buscacepinter.correios.com.br" target="_blank" className="text-xs text-green-600 underline">
          Não sei meu CEP
        </a>
        {freteGratis.elegivel && (
          <span className="text-xs text-red-500">
            APROVEITE! PARA SUA REGIÃO, FRETE GRÁTIS NAS COMPRAS ACIMA DE R${freteGratis.minimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
          </span>
        )}
      </div>
      {erro && <p className="text-xs text-red-500 mb-2">{erro}</p>}
      {opcoes.length > 0 && (
        <div className="space-y-2 mt-2">
          {opcoes.map(op => (
            <label key={op.id} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${selecionado === op.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="frete_produto" checked={selecionado === op.id} onChange={() => setSelecionado(op.id)} className="accent-green-600" />
              {op.logo && <img src={op.logo} alt={op.transportadora} className="h-6 w-auto object-contain" />}
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{op.nome}</p>
                <p className="text-xs text-gray-500">{op.prazo}</p>
              </div>
              <span className="text-sm font-black text-green-700">R$ {op.preco.toFixed(2).replace('.', ',')}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
