'use client'
import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Loja = {
  id: string
  nome: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  prazo_dias: number
  valor: number
}

export default function RetiradaLoja({ modoInfo = false }: { modoInfo?: boolean }) {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    supabase.from('pickup_stores')
      .select('id, nome, endereco, cidade, estado, cep, telefone, prazo_dias, valor')
      .eq('habilitado', true)
      .then(({ data }) => { if (data) setLojas(data) })
  }, [])

  if (lojas.length === 0) return null

  const loja = lojas[0]
  const valorTexto = loja.valor > 0
    ? `R$ ${loja.valor.toFixed(2).replace('.', ',')}`
    : 'Grátis'

  // Modo informativo — PDP
  if (modoInfo) {
    return (
      <div className="flex items-start gap-2.5 py-3 px-3 bg-green-50 border border-green-100 rounded-xl mb-4">
        <MapPin size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-green-800">
            Retire na loja — {valorTexto} · <span className="font-normal text-green-700">Selecione esta opção no checkout.</span>
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            Disponível para retirada em <strong>{loja.prazo_dias} dia{loja.prazo_dias > 1 ? 's' : ''} útil{loja.prazo_dias > 1 ? 'is' : ''}</strong> após confirmação do pedido.
          </p>
        </div>
      </div>
    )
  }

  // Modo completo — expansivel (carrinho)
  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between text-sm font-black text-gray-800"
      >
        <span className="flex items-center gap-2">
          <MapPin size={16} className="text-green-600" /> Retirar na loja — {valorTexto}
        </span>
        <span className="text-gray-400 text-xs">{aberto ? '▲' : '▼'}</span>
      </button>
      {aberto && (
        <div className="mt-3 space-y-3">
          {lojas.map(l => (
            <div key={l.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm font-bold text-gray-800">{l.nome}</p>
              <p className="text-xs text-gray-600 mt-1">{l.endereco}</p>
              <p className="text-xs text-gray-600">{l.cidade}/{l.estado} — CEP {l.cep}</p>
              {l.telefone && <p className="text-xs text-gray-600">{l.telefone}</p>}
              <p className="text-xs text-green-700 font-bold mt-1">
                Prazo: {l.prazo_dias} dia{l.prazo_dias > 1 ? 's' : ''} útil{l.prazo_dias > 1 ? 'is' : ''} após confirmação · {l.valor > 0 ? `R$ ${l.valor.toFixed(2).replace('.', ',')}` : 'Grátis'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
