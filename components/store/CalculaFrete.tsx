'use client'
import { useState } from 'react'
import { Truck } from 'lucide-react'

type OpcaoFrete = {
  id: number
  nome: string
  transportadora: string
  logo: string
  preco: number
  prazo: string
}

export default function CalculaFrete({ produtoId }: { produtoId: string }) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [opcoes, setOpcoes] = useState<OpcaoFrete[]>([])
  const [erro, setErro] = useState('')
  const [selecionado, setSelecionado] = useState<number | null>(null)

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
  function verificarFreteGratis(cepDigitado: string): { elegivel: boolean; estado: string } {
    const n = parseInt(cepDigitado.replace(/\D/g, '').substring(0, 5))
    if (n >= 88000 && n <= 89999) return { elegivel: true, estado: 'SC' }
    if (n >= 80000 && n <= 87999) return { elegivel: true, estado: 'PR' }
    if (n >= 90000 && n <= 99999) return { elegivel: true, estado: 'RS' }
    if (n >= 1000  && n <= 19999) return { elegivel: true, estado: 'SP' }
    if (n >= 20000 && n <= 28999) return { elegivel: true, estado: 'RJ' }
    if (n >= 30000 && n <= 39999) return { elegivel: true, estado: 'MG' }
    return { elegivel: false, estado: '' }
  }

  const cepLimpo = cep.replace(/\D/g, '')
  const freteGratisInfo = cepLimpo.length >= 5 ? verificarFreteGratis(cepLimpo) : null

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
        {!freteGratisInfo && (
          <span className="text-xs font-black text-red-600">FRETE GRÁTIS EM COMPRAS ACIMA DE R$500,00 PARA SC, PR, RS, SP, RJ E MG</span>
        )}
        {freteGratisInfo && !freteGratisInfo.elegivel && (
          <span className="text-xs font-black text-red-600">FRETE GRÁTIS EM COMPRAS ACIMA DE R$500,00 PARA SC, PR, RS, SP, RJ E MG</span>
        )}
        {freteGratisInfo && freteGratisInfo.elegivel && (
          <span className="text-xs font-black text-green-600">✅ FRETE GRÁTIS ACIMA DE R$500,00 PARA {freteGratisInfo.estado}</span>
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
