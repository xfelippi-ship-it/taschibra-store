'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react'
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

export default function PedidoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_logado')
    if (!salvo) { router.push('/minha-conta'); return }
    carregarPedido()
  }, [])

  async function carregarPedido() {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, order_number, total, subtotal, shipping_total, discount_total,
        status, payment_status, shipping_method, tracking_code,
        shipping_address, created_at, sapiens_order_id, cte_key, cte_url,
        order_items (id, name_snapshot, quantity, unit_price, total_price),
        payments (method, status, gateway_id)
      `)
      .eq('id', params.id as string)
      .single()
    setPedido(data as any)
    setLoading(false)
  }

  if (loading) return (
    <><Header />
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
    <Footer /></>
  )

  if (!pedido) return (
    <><Header />
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <p className="text-gray-500">Pedido não encontrado.</p>
      <Link href="/minha-conta/pedidos" className="text-green-600 font-bold text-sm mt-4 block">← Voltar</Link>
    </div>
    <Footer /></>
  )

  const endereco = pedido.shipping_address || {}
  const payment = pedido.payments?.[0]
  const status = pedido.payment_status || pedido.status

  return (
    <><Header />
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/minha-conta/pedidos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-800">
            Pedido #{(pedido.order_number || pedido.id).substring(0,8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500">{new Date(pedido.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</p>
        </div>
        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${statusColor[status] || 'bg-gray-100 text-gray-600'}`}>
          {statusLabel[status] || status}
        </span>
      </div>

      {/* Itens */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">
          <Package size={16} className="text-green-600" /> Itens do pedido
        </h2>
        <div className="space-y-3">
          {((pedido as any).order_items as any[])?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.name_snapshot}</p>
                <p className="text-xs text-gray-500">Qtd: {item.quantity} × R$ {parseFloat(item.unit_price).toFixed(2).replace('.', ',')}</p>
              </div>
              <span className="text-sm font-black text-gray-800">R$ {parseFloat(item.total_price).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>R$ {parseFloat(pedido.subtotal || pedido.total).toFixed(2).replace('.', ',')}</span>
          </div>
          {(pedido.discount_total as number) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto</span>
              <span>- R$ {parseFloat(String(pedido.discount_total)).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Frete</span>
            <span>R$ {parseFloat(pedido.shipping_total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between font-black text-gray-800 text-base pt-1 border-t border-gray-100">
            <span>Total</span>
            <span className="text-green-700">R$ {parseFloat(pedido.total).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>

      {/* Entrega */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-green-600" /> Endereço de entrega
        </h2>
        <p className="text-sm text-gray-700">{endereco.logradouro}, {endereco.numero} {endereco.complemento}</p>
        <p className="text-sm text-gray-700">{endereco.bairro} — {endereco.localidade}/{endereco.uf}</p>
        <p className="text-sm text-gray-500">CEP: {endereco.cep}</p>
        {pedido.shipping_method && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Truck size={12} /> {pedido.shipping_method}
          </p>
        )}
      </div>

      {/* Rastreamento */}
      {pedido.tracking_code && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
          <h2 className="font-black text-gray-800 text-sm mb-2 flex items-center gap-2">
            <Truck size={16} className="text-blue-600" /> Rastreamento
          </h2>
          <p className="text-sm text-gray-700">Código: <strong>{pedido.tracking_code}</strong></p>
          <a href={`https://rastreamento.correios.com.br/app/index.php?objetos=${pedido.tracking_code}`} target="_blank"
            className="text-xs text-blue-600 underline mt-1 block">
            Rastrear nos Correios →
          </a>
        </div>
      )}

      {/* CTe - Conhecimento de Transporte */}
      {(pedido.cte_key || pedido.cte_url) && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-4">
          <h2 className="font-black text-gray-800 text-sm mb-2 flex items-center gap-2">
            <Truck size={16} className="text-green-600" /> Conhecimento de Transporte (CTe)
          </h2>
          {pedido.cte_key && (
            <p className="text-sm text-gray-700 font-mono mb-2">Chave: {pedido.cte_key}</p>
          )}
          {pedido.cte_url ? (
            <a href={pedido.cte_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-lg transition-colors">
              📄 Visualizar CTe
            </a>
          ) : pedido.cte_key && (
            <a href={`https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&chave=${pedido.cte_key}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-lg transition-colors">
              📄 Consultar na SEFAZ
            </a>
          )}
        </div>
      )}

      {/* Pagamento */}
      {payment && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-green-600" /> Pagamento
          </h2>
          <p className="text-sm text-gray-700">Método: <strong>{payment.method === 'pix' ? 'PIX' : 'Cartão de Crédito'}</strong></p>
          <p className="text-sm text-gray-500">Status: {statusLabel[payment.status] || payment.status}</p>
        </div>
      )}
    </div>
    <Footer /></>
  )
}
