'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, X, Star, Trash2 } from 'lucide-react'

interface Review {
  id: string
  product_id: string
  customer_name: string | null
  customer_email: string | null
  nota: number | null
  titulo: string | null
  descricao: string | null
  status?: string | null
  created_at: string
  products?: { name: string }
}

function Estrelas({ nota }: { nota: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13}
          className={i <= nota ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

export default function AvaliacoesTab() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'aprovado' | 'reprovado'>('pendente')

  useEffect(() => { carregar() }, [filtro])

  async function carregar() {
    setLoading(true)
    let q = supabase
      .from('product_reviews')
      .select('*, products(name)') as any
    if (filtro !== 'todos') q = q.eq('status' as any, filtro as any)
    const { data } = await q
    setReviews((data || []) as any)
    setLoading(false)
  }

  async function atualizar(id: string, status: 'aprovado' | 'reprovado') {
    const { error } = await (supabase.from('product_reviews') as any)
      .update({ status })
      .eq('id', id)
    if (error) { alert('Erro ao atualizar: ' + error.message); return }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta avaliação?')) return
    await supabase.from('product_reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const statusCor: Record<string, string> = {
    pendente:  'bg-yellow-100 text-yellow-700',
    aprovado:  'bg-green-100 text-green-700',
    reprovado: 'bg-red-100 text-red-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Avaliações de Produtos</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {(['todos','pendente','aprovado','reprovado'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors capitalize ${
              filtro === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Star size={32} className="mx-auto mb-2 opacity-30" />
          <p>Nenhuma avaliação {filtro !== 'todos' ? filtro : ''} encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className={`bg-white rounded-xl border p-5 ${
              r.status === 'pendente' ? 'border-yellow-200' :
              r.status === 'aprovado' ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Estrelas nota={r.nota} />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCor[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {r.titulo && <p className="font-black text-gray-800 mb-1">{r.titulo}</p>}
                  {r.descricao && <p className="text-sm text-gray-600 mb-2">{r.descricao}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-semibold text-gray-600">{r.customer_name || 'Anônimo'}</span>
                    {r.customer_email && <span>{r.customer_email}</span>}
                    {r.products?.name && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {r.products.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status !== 'aprovado' && (
                    <button onClick={() => atualizar(r.id, 'aprovado')}
                      title="Aprovar"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors">
                      <Check size={15} />
                    </button>
                  )}
                  {r.status !== 'reprovado' && (
                    <button onClick={() => atualizar(r.id, 'reprovado')}
                      title="Reprovar"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                      <X size={15} />
                    </button>
                  )}
                  <button onClick={() => excluir(r.id)}
                    title="Excluir"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
