/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Regra = {
  id?: string
  name: string
  cep_from: string
  cep_to: string
  min_order_value: number
  delivery_days: number
  active: boolean
}

const regraVazia: Regra = {
  name: '', cep_from: '', cep_to: '',
  min_order_value: 500, delivery_days: 10, active: true
}

function formatCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8)
}

function exibirCEP(v: string) {
  if (!v) return '—'
  return v.slice(0, 5) + '-' + v.slice(5)
}

export default function FreteGratisTab() {
  const [regras, setRegras]   = useState<Regra[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editando, setEditando] = useState<Regra>(regraVazia)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('free_shipping_rules')
      .select('*')
      .order('name')
    setRegras(data || [])
    setLoading(false)
  }

  async function salvar() {
    if (!editando.name || !editando.cep_from || !editando.cep_to) return
    setSalvando(true)
    const dados = {
      name:            editando.name.trim(),
      cep_from:        editando.cep_from.replace(/\D/g, ''),
      cep_to:          editando.cep_to.replace(/\D/g, ''),
      min_order_value: Number(editando.min_order_value),
      delivery_days:   Number(editando.delivery_days),
      active:          editando.active,
      updated_at:      new Date().toISOString(),
    }
    if (editando.id) {
      await supabase.from('free_shipping_rules').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('free_shipping_rules').insert(dados)
    }
    setSalvando(false)
    setModal(false)
    setEditando(regraVazia)
    carregar()
  }

  async function toggleAtivo(regra: Regra) {
    await supabase
      .from('free_shipping_rules')
      .update({ active: !regra.active, updated_at: new Date().toISOString() })
      .eq('id', regra.id)
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta regra de frete grátis?')) return
    await supabase.from('free_shipping_rules').delete().eq('id', id)
    carregar()
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500"

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Frete Grátis por Região</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {regras.filter(r => r.active).length} regra{regras.filter(r => r.active).length !== 1 ? 's' : ''} ativa{regras.filter(r => r.active).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditando(regraVazia); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Nova Regra
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Truck size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-800">Como funciona</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Quando o CEP do cliente estiver na faixa cadastrada e o valor do pedido atingir o mínimo, 
            o frete grátis é aplicado automaticamente no checkout. Regras inativas são ignoradas.
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Carregando regras...</div>
        ) : regras.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma regra cadastrada.</p>
            <p className="text-xs mt-1">Clique em "Nova Regra" para começar.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Nome / Região</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Faixa de CEP</th>
                <th className="text-right px-5 py-3 text-xs font-black text-gray-500 uppercase">Pedido Mínimo</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Prazo</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {regras.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-gray-800">{r.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-gray-600">
                      {exibirCEP(r.cep_from)} <span className="text-gray-400">a</span> {exibirCEP(r.cep_to)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-black text-green-700 text-sm">
                      R$ {Number(r.min_order_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-sm text-gray-600">
                    {r.delivery_days} dia{r.delivery_days !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleAtivo(r)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                        r.active
                          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                      }`}>
                      {r.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => { setEditando(r); setModal(true) }}
                        className="text-blue-400 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => excluir(r.id!)}
                        className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">
                {editando.id ? 'Editar Regra' : 'Nova Regra'}
              </h2>
              <button
                onClick={() => { setModal(false); setEditando(regraVazia) }}
                className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nome da Região *</label>
                <input
                  value={editando.name}
                  onChange={e => setEditando({ ...editando, name: e.target.value })}
                  placeholder="Ex: SC, PR, São Paulo Capital"
                  className={inputCls}
                />
              </div>

              {/* CEPs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">CEP Inicial *</label>
                  <input
                    value={editando.cep_from}
                    onChange={e => setEditando({ ...editando, cep_from: formatCEP(e.target.value) })}
                    placeholder="Ex: 88000000"
                    maxLength={8}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">CEP Final *</label>
                  <input
                    value={editando.cep_to}
                    onChange={e => setEditando({ ...editando, cep_to: formatCEP(e.target.value) })}
                    placeholder="Ex: 89999999"
                    maxLength={8}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              {/* Pedido mínimo + Prazo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Pedido Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editando.min_order_value}
                    onChange={e => setEditando({ ...editando, min_order_value: parseFloat(e.target.value) || 0 })}
                    placeholder="500.00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Prazo (dias úteis)</label>
                  <input
                    type="number"
                    min="1"
                    value={editando.delivery_days}
                    onChange={e => setEditando({ ...editando, delivery_days: parseInt(e.target.value) || 1 })}
                    placeholder="10"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Toggle ativo */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-bold text-gray-700">Regra ativa</p>
                  <p className="text-xs text-gray-500">Aplicada automaticamente no checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditando({ ...editando, active: !editando.active })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${editando.active ? 'bg-green-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editando.active ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setModal(false); setEditando(regraVazia) }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando || !editando.name || !editando.cep_from || !editando.cep_to}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {salvando ? 'Salvando...' : editando.id ? 'Salvar alterações' : 'Criar regra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
