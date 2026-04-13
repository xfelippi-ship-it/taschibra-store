'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { Package, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'


const statusLabel: Record<string, string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  approved: 'Aprovado',
  cancelled: 'Cancelado',
  failed: 'Falhou',
  shipped: 'Enviado',
  delivered: 'Entregue',
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
}

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_logado')
    if (!salvo) { router.push('/minha-conta'); return }
    const c = JSON.parse(salvo)
    carregarPedidos(c.id as string)
  }, [])

  async function carregarPedidos(clienteId: string) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, total, status, payment_status, shipping_method, created_at, order_items(id)')
      .eq('customer_id', clienteId)
      .order('created_at', { ascending: false })
    setPedidos((data as any) || [])
    setLoading(false)
  }

  return (
    <><Header />
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/minha-conta" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">Meus Pedidos</h1>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="border border-gray-200 rounded-xl h-24 animate-pulse bg-gray-50" />)}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold mb-2">Nenhum pedido ainda</p>
          <p className="text-sm text-gray-400 mb-6">Seus pedidos aparecerão aqui após a compra.</p>
          <Link href="/produtos" className="bg-green-600 text-white font-black px-6 py-3 rounded-lg text-sm">
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p: any) => (
            <Link key={p.id as string} href={`/minha-conta/pedido/${p.id as string}`}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Package size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-black text-gray-800 text-sm">
                    Pedido #{(p.order_number || p.id).substring(0,8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')} · {p.order_items?.length || 0} {p.order_items?.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-black text-gray-800 text-sm">R$ {parseFloat(p.total).toFixed(2).replace('.', ',')}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[p.payment_status] || statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[p.payment_status] || statusLabel[p.status] || p.status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    <Footer /></>
  )
}
