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
}

export default function RetiradaLoja() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    supabase.from('pickup_stores')
      .select('id, nome, endereco, cidade, estado, cep, telefone, prazo_dias')
      .eq('habilitado', true)
      .then(({ data }) => { if (data) setLojas(data) })
  }, [])

  if (lojas.length === 0) return null

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between text-sm font-black text-gray-800"
      >
        <span className="flex items-center gap-2">
          <MapPin size={16} className="text-green-600" /> Retirar na loja — Grátis
        </span>
        <span className="text-gray-400 text-xs">{aberto ? '▲' : '▼'}</span>
      </button>
      {aberto && (
        <div className="mt-3 space-y-3">
          {lojas.map(loja => (
            <div key={loja.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm font-bold text-gray-800">{loja.nome}</p>
              <p className="text-xs text-gray-600 mt-1">{loja.endereco}</p>
              <p className="text-xs text-gray-600">{loja.cidade}/{loja.estado} — CEP {loja.cep}</p>
              {loja.telefone && <p className="text-xs text-gray-600">{loja.telefone}</p>}
              <p className="text-xs text-green-700 font-bold mt-1">
                Prazo: {loja.prazo_dias} dia{loja.prazo_dias > 1 ? 's' : ''} útil{loja.prazo_dias > 1 ? 'is' : ''} após confirmação · Grátis
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
