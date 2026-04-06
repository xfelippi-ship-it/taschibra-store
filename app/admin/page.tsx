/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image'
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Package, ShoppingBag, Tag, BarChart3, Plus, Pencil, Trash2, LogOut, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_PIN = '1234'

type Produto = {
  id: string
  name: string
  sku: string
  price: number
  promo_price: number
  stock_qty: number
  active: boolean
  badge: string
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [pin, setPin] = useState('')
  const [erroPin, setErroPin] = useState(false)
  const [aba, setAba] = useState<'dashboard' | 'produtos' | 'pedidos' | 'cupons'>('dashboard')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [produtoEdit, setProdutoEdit] = useState<Partial<Produto>>({})

  useEffect(() => {
    if (autenticado) {
      carregarProdutos()
      carregarPedidos()
    }
  }, [autenticado])

  async function carregarProdutos() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProdutos(data || [])
    setLoading(false)
  }

  async function carregarPedidos() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20)
    setPedidos(data || [])
  }

  async function salvarProduto() {
    if (produtoEdit.id) {
      await supabase.from('products').update(produtoEdit).eq('id', produtoEdit.id)
    } else {
      await supabase.from('products').insert({ ...produtoEdit, slug: produtoEdit.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
    }
    setModal(false)
    setProdutoEdit({})
    carregarProdutos()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('products').update({ active: !ativo }).eq('id', id)
    carregarProdutos()
  }

  async function excluirProduto(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    carregarProdutos()
  }

  function handlePin() {
    if (pin === ADMIN_PIN) setAutenticado(true)
    else { setErroPin(true); setPin('') }
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
<Image src="/images/logo.png" alt="Taschibra Store" width={200} height={48} className="h-12 w-auto mx-auto mb-4" priority />
<h1 className="text-xl font-black text-gray-800 mb-1">Backoffice</h1>
<p className="text-sm text-gray-500 mb-6">Área Restrita</p>
          <input type="password" value={pin} onChange={e => { setPin(e.target.value); setErroPin(false) }}
            onKeyDown={e => e.key === 'Enter' && handlePin()}
            placeholder="PIN de acesso" maxLength={6}
            className={`w-full border-2 ${erroPin ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-black outline-none focus:border-green-500 mb-4`} />
          {erroPin && <p className="text-red-500 text-sm mb-3">PIN incorreto</p>}
          <button onClick={handlePin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl transition-colors">
            Entrar
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Produtos', value: produtos.length, icon: '📦', color: 'bg-blue-50 text-blue-600' },
    { label: 'Pedidos', value: pedidos.length, icon: '🛒', color: 'bg-green-50 text-green-600' },
    { label: 'Ativos', value: produtos.filter(p => p.active).length, icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Inativos', value: produtos.filter(p => !p.active).length, icon: '⏸️', color: 'bg-gray-50 text-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-green-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-green-800">
          <div className="text-xs font-bold text-green-400 tracking-widest uppercase mb-1">TASCHIBRA</div>
          <div className="text-lg font-black">Backoffice</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
            { id: 'produtos', label: 'Produtos', icon: <Package size={16} /> },
            { id: 'pedidos', label: 'Pedidos', icon: <ShoppingBag size={16} /> },
            { id: 'cupons', label: 'Cupons', icon: <Tag size={16} /> },
          ].map(item => (
            <button key={item.id} onClick={() => setAba(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                aba === item.id ? 'bg-green-700 text-white' : 'text-green-300 hover:bg-green-800 hover:text-white'
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-green-800">
          <a href="/" className="flex items-center gap-2 text-xs text-green-400 hover:text-white transition-colors">
            ← Ver loja
          </a>
          <button onClick={() => setAutenticado(false)} className="flex items-center gap-2 text-xs text-green-400 hover:text-red-400 transition-colors mt-2">
            <LogOut size={12} /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8 overflow-auto">

        {/* DASHBOARD */}
        {aba === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${s.color}`}>
                    {s.icon}
                  </div>
                  <div className="text-3xl font-black text-gray-800">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-black text-gray-800 mb-4">Últimos Pedidos</h2>
              {pedidos.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum pedido ainda.</p>
              ) : pedidos.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{p.order_number}</p>
                    <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    p.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{p.status}</span>
                  <span className="font-black text-green-700">R$ {Number(p.total).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUTOS */}
        {aba === 'produtos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-800">Produtos</h1>
              <button onClick={() => { setProdutoEdit({}); setModal(true) }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
                <Plus size={16} /> Novo Produto
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Produto</th>
                    <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">SKU</th>
                    <th className="text-right px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Preço</th>
                    <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Estoque</th>
                    <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr>
                  ) : produtos.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-sm text-gray-800 max-w-xs truncate">{p.name}</p>
                        {p.badge && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold capitalize">{p.badge}</span>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 font-mono">{p.sku}</td>
                      <td className="px-5 py-4 text-right">
                        {p.promo_price && <p className="text-xs text-gray-400 line-through">R$ {Number(p.price).toFixed(2).replace('.', ',')}</p>}
                        <p className="font-black text-green-700">R$ {Number(p.promo_price || p.price).toFixed(2).replace('.', ',')}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-bold text-sm ${p.stock_qty < 10 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock_qty}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => toggleAtivo(p.id, p.active)}
                          className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                            p.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                          }`}>
                          {p.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setProdutoEdit(p); setModal(true) }}
                            className="text-blue-500 hover:text-blue-700 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => excluirProduto(p.id)}
                            className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {aba === 'pedidos' && (
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">Pedidos</h1>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {pedidos.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido ainda.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Pedido</th>
                      <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Data</th>
                      <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                      <th className="text-right px-5 py-3 text-xs font-black text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p: any) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-4 font-bold text-sm text-gray-800">{p.order_number}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            p.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-green-700">R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CUPONS */}
        {aba === 'cupons' && (
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">Cupons</h1>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Tag size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Gestão de cupons em desenvolvimento.</p>
              <p className="text-xs text-gray-400">Em breve você poderá criar cupons por produto, categoria e campanhas globais.</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal produto */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{produtoEdit.id ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nome do produto</label>
                <input value={produtoEdit.name || ''} onChange={e => setProdutoEdit({...produtoEdit, name: e.target.value})}
                  placeholder="Ex: Refletor LED 50W Branco"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">SKU</label>
                  <input value={produtoEdit.sku || ''} onChange={e => setProdutoEdit({...produtoEdit, sku: e.target.value})}
                    placeholder="EX: REF-50W-BR"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Badge</label>
                  <select value={produtoEdit.badge || ''} onChange={e => setProdutoEdit({...produtoEdit, badge: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white">
                    <option value="">Sem badge</option>
                    <option value="novo">Novo</option>
                    <option value="oferta">Oferta</option>
                    <option value="smart">Smart</option>
                    <option value="exclusivo">Exclusivo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Preço</label>
                  <input type="number" step="0.01" value={produtoEdit.price || ''} onChange={e => setProdutoEdit({...produtoEdit, price: parseFloat(e.target.value)})}
                    placeholder="0,00"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Preço PIX</label>
                  <input type="number" step="0.01" value={produtoEdit.promo_price || ''} onChange={e => setProdutoEdit({...produtoEdit, promo_price: parseFloat(e.target.value)})}
                    placeholder="0,00"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Estoque</label>
                  <input type="number" value={produtoEdit.stock_qty || ''} onChange={e => setProdutoEdit({...produtoEdit, stock_qty: parseInt(e.target.value)})}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={salvarProduto} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors">
                {produtoEdit.id ? 'Salvar alterações' : 'Criar produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}