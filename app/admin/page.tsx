/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from 'next/image'
import BannersTab from '@/components/admin/BannersTab'
import ProdutosTab from '@/components/admin/ProdutosTab'
import PedidosTab from '@/components/admin/PedidosTab'
import ImportarTab from '@/components/admin/ImportarTab'
import DashboardTab from '@/components/admin/DashboardTab'
import TopBarTab from '@/components/admin/TopBarTab'
import CategoriasTab from '@/components/admin/CategoriasTab'
import FreteGratisTab from '@/components/admin/FreteGratisTab'
import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Upload, Tag, BarChart3, Plus, Pencil, Trash2, LogOut, X, Eye, EyeOff, Users, ImageIcon, Megaphone, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { registrarAuditoria } from '@/lib/auditLog'


type Produto = {
  id: string; name: string; sku: string; price: number; promo_price: number
  stock_qty: number; active: boolean; badge: string; family?: string
  category_slug?: string; short_description?: string; description?: string
  main_image?: string; weight_kg?: number; unit?: string; warranty?: string
  images?: string[]; weight_kg_packed?: number; height_cm?: number
  width_cm?: number; depth_cm?: number; height_cm_packed?: number
  width_cm_packed?: number; depth_cm_packed?: number; tags?: string[]
}

function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [papeisSelecionados, setPapeisSelecionados] = useState<string[]>(['marketing'])
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => { carregarUsuarios() }, [])

  async function carregarUsuarios() {
    setLoading(true)
    const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
    setUsuarios(data || [])
    setLoading(false)
  }

  function togglePapel(papel: string) {
    if (papel === 'master') {
      setPapeisSelecionados(['master'])
      return
    }
    setPapeisSelecionados(prev => {
      const semMaster = prev.filter(p => p !== 'master')
      if (semMaster.includes(papel)) {
        const novo = semMaster.filter(p => p !== papel)
        return novo.length === 0 ? ['marketing'] : novo
      }
      return [...semMaster, papel]
    })
  }

  async function convidar() {
    if (!email.trim()) return
    setEnviando(true)
    setMsg(null)
    const res = await fetch('/api/admin-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), papeis: papeisSelecionados })
    })
    const json = await res.json()
    if (!res.ok) {
      setMsg({ tipo: 'erro', texto: 'Erro ao enviar convite: ' + (json.error || 'tente novamente') })
    } else {
      setMsg({ tipo: 'ok', texto: `Convite enviado para ${email.trim()}!` })
      setEmail('')
      setPapeisSelecionados(['marketing'])
      carregarUsuarios()
    }
    setEnviando(false)
  }

  async function alterarPapeis(id: string, emailUsuario: string, novosPapeis: string[]) {
    await supabase.from('admin_users').update({ papeis: novosPapeis }).eq('id', id)
    await supabase.from('audit_log').insert({
      user_email: emailUsuario,
      acao: 'papeis_alterados',
      entidade: 'admin_users',
      detalhe: `Usuário: ${emailUsuario} | Novos papéis: ${novosPapeis.join(', ')}`
    })
    carregarUsuarios()
  }

  async function desabilitarUsuario(id: string, emailUsuario: string, ativo: boolean) {
    const acao = ativo ? 'desabilitar' : 'reabilitar'
    if (!confirm(`${acao === 'desabilitar' ? 'Desabilitar' : 'Reabilitar'} acesso de ${emailUsuario}?`)) return
    await supabase.from('admin_users').update({ ativo: !ativo }).eq('id', id)
    await supabase.from('audit_log').insert({
      user_email: emailUsuario,
      acao: acao,
      entidade: 'admin_users',
      detalhe: `Usuário: ${emailUsuario} | ${acao === 'desabilitar' ? 'Desabilitado' : 'Reabilitado'}`
    })
    carregarUsuarios()
  }

  async function resetarSenha(emailUsuario: string) {
    if (!confirm(`Enviar e-mail de redefinição de senha para ${emailUsuario}?`)) return
    const { error } = await supabase.auth.resetPasswordForEmail(emailUsuario)
    if (error) {
      alert('Erro ao enviar e-mail: ' + error.message)
    } else {
      await supabase.from('audit_log').insert({
        user_email: emailUsuario,
        acao: 'reset_senha',
        entidade: 'admin_users',
        detalhe: `Usuário: ${emailUsuario} | E-mail de redefinição enviado`
      })
      alert(`E-mail de redefinição enviado para ${emailUsuario}`)
    }
  }

  const papelLabel: Record<string, string> = { master: 'Master', marketing: 'Marketing', vendas: 'Vendas' }
  const papelCor: Record<string, string> = {
    master: 'bg-purple-100 text-purple-700',
    marketing: 'bg-blue-100 text-blue-700',
    vendas: 'bg-green-100 text-green-700'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Usuários do Backoffice</h1>
      </div>

      {/* Convidar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-black text-gray-800 mb-1">Convidar novo usuário</h2>
        <p className="text-sm text-gray-500 mb-4">O usuário receberá um e-mail com link para criar a própria senha.</p>
        <div className="flex gap-3 mb-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && convidar()}
            placeholder="email@exemplo.com"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
          />
          <button
            onClick={convidar}
            disabled={enviando || !email.trim() || papeisSelecionados.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors">
            <Plus size={16} /> {enviando ? 'Enviando...' : 'Convidar'}
          </button>
        </div>
        {/* Checkboxes de papéis */}
        <div className="flex gap-4">
          <p className="text-sm font-bold text-gray-600 mr-2 self-center">Acesso:</p>
          {(['master', 'marketing', 'vendas'] as const).map(p => (
            <label key={p} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={papeisSelecionados.includes(p)}
                onChange={() => togglePapel(p)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${papelCor[p]}`}>{papelLabel[p]}</span>
              {p === 'master' && <span className="text-xs text-gray-400">(acesso total)</span>}
            </label>
          ))}
        </div>
        {msg && (
          <p className={`mt-3 text-sm font-bold px-4 py-2 rounded-lg ${msg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {msg.tipo === 'ok' ? '✅' : '❌'} {msg.texto}
          </p>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">E-mail</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Acesso</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Adicionado em</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum usuário cadastrado.</td></tr>
            ) : usuarios.map(u => {
              const papeis: string[] = u.papeis || [u.papel || 'master']
              const ativo: boolean = u.ativo !== false
              return (
                <tr key={u.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!ativo ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-gray-800">{u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {(['master', 'marketing', 'vendas'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            if (!ativo) return
                            const atual = papeis.includes(p)
                            let novos: string[]
                            if (p === 'master') {
                              novos = atual ? ['marketing'] : ['master']
                            } else {
                              const semMaster = papeis.filter(x => x !== 'master')
                              if (atual) {
                                novos = semMaster.filter(x => x !== p)
                                if (novos.length === 0) novos = ['marketing']
                              } else {
                                novos = [...semMaster.filter(x => x !== 'master'), p]
                              }
                            }
                            alterarPapeis(u.id, u.email, novos)
                          }}
                          className={`text-xs font-bold px-2 py-1 rounded-full border transition-all ${
                            papeis.includes(p)
                              ? papelCor[p] + ' border-transparent'
                              : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                          } ${!ativo ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {papelLabel[p]}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      !ativo ? 'bg-red-100 text-red-600' :
                      u.status === 'aguardando' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {!ativo ? 'Inativo' : u.status === 'aguardando' ? 'Aguardando' : 'Ativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => resetarSenha(u.email)}
                        title="Resetar senha"
                        className="text-blue-400 hover:text-blue-600 transition-colors text-xs font-bold">
                        🔑
                      </button>
                      <button
                        onClick={() => desabilitarUsuario(u.id, u.email, ativo)}
                        title={ativo ? 'Desabilitar' : 'Reabilitar'}
                        className={`transition-colors text-xs font-bold ${ativo ? 'text-orange-400 hover:text-orange-600' : 'text-green-400 hover:text-green-600'}`}>
                        {ativo ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CuponsTab() {
  const [cupons, setCupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<any>({})

  useEffect(() => { carregarCupons() }, [])

  async function carregarCupons() {
    setLoading(true)
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCupons(data || [])
    setLoading(false)
  }

  async function salvarCupom() {
    const cupom = {
      code: editando.code?.toUpperCase().trim(),
      description: editando.description || '',
      discount_type: editando.discount_type || 'percent',
      discount_value: Number(editando.discount_value) || 0,
      min_order_value: Number(editando.min_order_value) || 0,
      max_discount_value: editando.max_discount_value ? Number(editando.max_discount_value) : null,
      usage_limit: editando.usage_limit ? Number(editando.usage_limit) : null,
      starts_at: editando.starts_at || null,
      ends_at: editando.ends_at || null,
      active: editando.active !== false,
      scope: editando.scope || 'all',
      scope_ids: editando.scope_ids || [],
      free_shipping: editando.free_shipping || false,
      first_order_only: editando.first_order_only || false,
      usage_limit_per_customer: editando.usage_limit_per_customer ? Number(editando.usage_limit_per_customer) : null,
      channel: 'b2c',
    }
    if (editando.id) {
      await supabase.from('coupons').update(cupom).eq('id', editando.id)
      await registrarAuditoria({ executedBy: 'admin', acao: 'cupom_editado', entidade: 'coupons', detalhe: `Código: ${cupom.code}` })
    } else {
      await supabase.from('coupons').insert(cupom)
      await registrarAuditoria({ executedBy: 'admin', acao: 'cupom_criado', entidade: 'coupons', detalhe: `Código: ${cupom.code}` })
    }
    setModal(false)
    setEditando({})
    carregarCupons()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('coupons').update({ active: !ativo }).eq('id', id)
      await registrarAuditoria({ executedBy: 'admin', acao: ativo ? 'cupom_desativado' : 'cupom_ativado', entidade: 'coupons', detalhe: `ID: ${id}` })
    carregarCupons()
  }

  async function excluirCupom(id: string) {
    if (!confirm('Excluir este cupom?')) return
    await supabase.from('coupons').delete().eq('id', id)
      await registrarAuditoria({ executedBy: 'admin', acao: 'cupom_excluido', entidade: 'coupons', detalhe: `ID: ${id}` })
    carregarCupons()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Cupons</h1>
        <button onClick={() => { setEditando({ discount_type: 'percent', active: true }); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Novo Cupom
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Código</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Desconto</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Escopo</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Mínimo</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Usos</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Validade</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
              <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : cupons.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum cupom cadastrado.</td></tr>
            ) : cupons.map(c => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-black text-gray-800 font-mono tracking-wide">{c.code}</p>
                  <p className="text-xs text-gray-400">{c.description}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-black px-3 py-1 rounded-full ${c.discount_type === 'percent' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2).replace('.', ',')}`}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                    {c.scope === 'category' ? 'Categoria' : c.scope === 'product' ? 'Produto' : c.scope === 'family' ? 'Família' : 'Tudo'}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {c.min_order_value > 0 ? `R$ ${Number(c.min_order_value).toFixed(2).replace('.', ',')}` : '—'}
                </td>
                <td className="px-5 py-4 text-center text-sm text-gray-600">
                  {c.used_count || 0}{c.usage_limit ? `/${c.usage_limit}` : ''}
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  {c.ends_at ? new Date(c.ends_at).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => toggleAtivo(c.id, c.active)}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${c.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                    {c.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { setEditando(c); setModal(true) }} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                    <button onClick={() => excluirCupom(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{editando.id ? 'Editar Cupom' : 'Novo Cupom'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">

              {/* Codigo + Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Código *</label>
                  <input value={editando.code || ''} onChange={e => setEditando({...editando, code: e.target.value.toUpperCase()})}
                    placeholder="EX: PASCOA20"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono uppercase" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo de desconto</label>
                  <select value={editando.discount_type || 'percent'} onChange={e => setEditando({...editando, discount_type: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white">
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </div>
              </div>

              {/* Valor + Maximo + Minimo */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">{editando.discount_type === 'fixed' ? 'Valor (R$) *' : 'Desconto (%) *'}</label>
                  <input type="number" value={editando.discount_value || ''} onChange={e => setEditando({...editando, discount_value: e.target.value})}
                    placeholder="0" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                {editando.discount_type !== 'fixed' && (
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Desconto máx. (R$)</label>
                    <input type="number" value={editando.max_discount_value || ''} onChange={e => setEditando({...editando, max_discount_value: e.target.value})}
                      placeholder="Sem teto" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Pedido mínimo (R$)</label>
                  <input type="number" value={editando.min_order_value || ''} onChange={e => setEditando({...editando, min_order_value: e.target.value})}
                    placeholder="0" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Descricao */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Descrição</label>
                <input value={editando.description || ''} onChange={e => setEditando({...editando, description: e.target.value})}
                  placeholder="Ex: 20% de desconto na Páscoa acima de R$ 100"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>

              {/* Escopo */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Escopo do cupom</label>
                <select value={editando.scope || 'all'} onChange={e => setEditando({...editando, scope: e.target.value, scope_ids: []})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white">
                  <option value="all">Tudo — válido para qualquer produto</option>
                  <option value="category">Categoria específica</option>
                  <option value="family">Família de produtos</option>
                  <option value="product">Produto(s) específico(s) — SKU</option>
                </select>
                {editando.scope && editando.scope !== 'all' && (
                  <div className="mt-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                      {editando.scope === 'product' ? 'SKUs (separados por vírgula)' : editando.scope === 'category' ? 'Slugs de categoria (separados por vírgula)' : 'Nomes de família (separados por vírgula)'}
                    </label>
                    <input
                      value={(editando.scope_ids || []).join(', ')}
                      onChange={e => setEditando({...editando, scope_ids: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})}
                      placeholder={editando.scope === 'product' ? 'Ex: LED-001, LED-002' : editando.scope === 'category' ? 'Ex: lampadas, refletor' : 'Ex: Inlumix, SMART'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    {editando.scope_ids?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {editando.scope_ids.map((id: string) => (
                          <span key={id} className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{id}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Limites de uso */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Limite total de usos</label>
                  <input type="number" value={editando.usage_limit || ''} onChange={e => setEditando({...editando, usage_limit: e.target.value})}
                    placeholder="Ilimitado" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Limite por cliente</label>
                  <input type="number" value={editando.usage_limit_per_customer || ''} onChange={e => setEditando({...editando, usage_limit_per_customer: e.target.value})}
                    placeholder="Ilimitado" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Data de início</label>
                  <input type="date" value={editando.starts_at?.split('T')[0] || ''} onChange={e => setEditando({...editando, starts_at: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Data de expiração</label>
                  <input type="date" value={editando.ends_at?.split('T')[0] || ''} onChange={e => setEditando({...editando, ends_at: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Condições especiais</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Frete grátis</p>
                    <p className="text-xs text-gray-500">Zera o frete ao aplicar este cupom</p>
                  </div>
                  <button type="button" onClick={() => setEditando({...editando, free_shipping: !editando.free_shipping})}
                    className={`relative w-11 h-6 rounded-full transition-colors ${editando.free_shipping ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editando.free_shipping ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Apenas primeira compra</p>
                    <p className="text-xs text-gray-500">Válido somente para novos clientes</p>
                  </div>
                  <button type="button" onClick={() => setEditando({...editando, first_order_only: !editando.first_order_only})}
                    className={`relative w-11 h-6 rounded-full transition-colors ${editando.first_order_only ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editando.first_order_only ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Cupom ativo</p>
                    <p className="text-xs text-gray-500">Visível e aplicável no site</p>
                  </div>
                  <button type="button" onClick={() => setEditando({...editando, active: !editando.active})}
                    className={`relative w-11 h-6 rounded-full transition-colors ${editando.active !== false ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editando.active !== false ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={salvarCupom} disabled={!editando.code || !editando.discount_value}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {editando.id ? 'Salvar alterações' : 'Criar cupom'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function AuditoriaTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => { carregarLogs() }, [])

  async function carregarLogs() {
    setLoading(true)
    const res = await fetch('/api/audit-log')
    const data = await res.json()
    setLogs(data || [])
    setLoading(false)
  }

  const logsFiltrados = filtro
    ? logs.filter(l => l.user_email?.includes(filtro) || l.acao?.includes(filtro) || l.detalhe?.includes(filtro))
    : logs

  const acaoCor: Record<string, string> = {
    convite_enviado: 'bg-blue-100 text-blue-700',
    papeis_alterados: 'bg-yellow-100 text-yellow-700',
    desabilitar: 'bg-red-100 text-red-600',
    reabilitar: 'bg-green-100 text-green-700',
    reset_senha: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">Log de Auditoria</h1>
        <button onClick={carregarLogs} className="text-xs text-green-600 hover:text-green-700 font-bold border border-green-200 px-3 py-2 rounded-lg">↻ Atualizar</button>
      </div>
      <div className="mb-4">
        <input type="text" placeholder="Filtrar por e-mail, ação ou detalhe..."
          value={filtro} onChange={e => setFiltro(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Data/Hora</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Executado por</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Ação</th>
              <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Descritivo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : logsFiltrados.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhum registro encontrado.</td></tr>
            ) : logsFiltrados.map((l, i) => (
              <tr key={l.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                <td className="px-5 py-3 text-sm text-gray-700 font-bold">{l.executed_by || l.user_email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${acaoCor[l.acao] || 'bg-gray-100 text-gray-600'}`}>
                    {l.acao?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{l.detalhe || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [meuPapel, setMeuPapel] = useState<string>('master')
  const [meuEmail, setMeuEmail] = useState<string>('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [aba, setAba] = useState<'dashboard' | 'produtos' | 'pedidos' | 'cupons' | 'usuarios' | 'banners' | 'topbar' | 'categorias' | 'importar' | 'frete' | 'auditoria'>('dashboard')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState<"asc"|"desc">("asc")
  const [modal, setModal] = useState(false)
  const [produtoEdit, setProdutoEdit] = useState<Partial<Produto>>({})

  async function handleLogin() {
    setLoadingLogin(true)
    setErroLogin('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error || !data.user) {
      setErroLogin('E-mail ou senha incorretos.')
    } else {
      const { data: adminData, error: adminError } = await supabase.from('admin_users').select('id, papeis, papel').eq('user_id', data.user.id).single()
      if (!adminData || adminError) {
        await supabase.auth.signOut()
        setErroLogin('Você não tem permissão de acesso.')
        setLoadingLogin(false)
      } else {
        const papeis = (adminData as any).papeis || [(adminData as any).papel || 'master']
        setMeuPapel(papeis.includes('master') ? 'master' : papeis[0] || 'master')
        setMeuEmail(data.user.email || '')
        setLoadingLogin(false)
        setAutenticado(true)
      }
    }
  }

  useEffect(() => {
    if (autenticado) { carregarProdutos(); carregarPedidos() }
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

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
          <Image src="/images/logo.png" alt="Taschibra Store" width={200} height={48} className="h-12 w-auto mx-auto mb-4" priority />
          <h1 className="text-xl font-black text-gray-800 mb-1">Backoffice</h1>
          <p className="text-sm text-gray-500 mb-6">Área Restrita</p>
          <div className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@taschibra.com.br"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Senha</label>
              <div className="relative">
                <input type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-4 pr-10 py-3 text-sm outline-none focus:border-green-500" />
                <button type="button" onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {erroLogin && <p className="text-red-500 text-xs">{erroLogin}</p>}
            <button onClick={handleLogin} disabled={loadingLogin || !email || !senha}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors">
              {loadingLogin ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-60 bg-green-900 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-green-800 flex flex-col items-center">
          <Image src="/images/logo.png" alt="Taschibra Store" width={160} height={40} className="w-auto h-9 mb-2" priority />
          <div className="text-xs font-bold text-green-400 tracking-widest uppercase">Backoffice</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            ...([
              { id: 'dashboard',  label: 'Dashboard',  icon: <BarChart3 size={16} />,    papeis: ['master','marketing','vendas'] },
              { id: 'produtos',   label: 'Produtos',   icon: <Package size={16} />,      papeis: ['master','marketing'] },
              { id: 'pedidos',    label: 'Pedidos',    icon: <ShoppingBag size={16} />,  papeis: ['master','vendas'] },
              { id: 'cupons',     label: 'Cupons',     icon: <Tag size={16} />,          papeis: ['master','vendas'] },
              { id: 'banners',    label: 'Banners',    icon: <ImageIcon size={16} />,    papeis: ['master','marketing'] },
              { id: 'topbar',     label: 'Top Bar',    icon: <Megaphone size={16} />,    papeis: ['master','marketing'] },
              { id: 'categorias', label: 'Categorias', icon: <Tag size={16} />,          papeis: ['master'] },
              { id: 'importar',   label: 'Importar CSV', icon: <Upload size={16} />,    papeis: ['master'] },
              { id: 'frete',      label: 'Frete Grátis', icon: <Truck size={16} />,    papeis: ['master'] },
              { id: 'usuarios',   label: 'Usuários',   icon: <Users size={16} />,        papeis: ['master'] },
              { id: 'auditoria',  label: 'Auditoria',  icon: <BarChart3 size={16} />,    papeis: ['master'] },
            ].filter(a => meuPapel === 'master' ? true : a.papeis.includes(meuPapel))),
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
          <a href="/" className="flex items-center gap-2 text-xs text-green-400 hover:text-white transition-colors">← Ver loja</a>
          <button onClick={() => setAutenticado(false)} className="flex items-center gap-2 text-xs text-green-400 hover:text-red-400 transition-colors mt-2">
            <LogOut size={12} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {aba === 'dashboard' && <DashboardTab />}

        {aba === 'produtos' && <ProdutosTab meuPapel={meuPapel} meuEmail={meuEmail} />}

        {aba === 'pedidos' && <PedidosTab meuEmail={meuEmail} />}

        {aba === 'cupons' && <CuponsTab />}
        {aba === 'usuarios' && <UsuariosTab />}
        {aba === 'auditoria' && <AuditoriaTab />}
        {aba === 'banners' && <BannersTab meuEmail={meuEmail} />}
        {aba === 'topbar' && <TopBarTab />}
        {aba === 'categorias' && <CategoriasTab />}
        {aba === 'importar' && <ImportarTab meuEmail={meuEmail} />}
        {aba === 'frete' && <FreteGratisTab />}
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{produtoEdit.id ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Nome do produto *</label>
                <input value={produtoEdit.name || ''} onChange={e => setProdutoEdit({...produtoEdit, name: e.target.value})}
                  placeholder="Ex: Refletor LED Inlumix BR 50W 6500K Branco"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">SKU *</label>
                  <input value={produtoEdit.sku || ''} onChange={e => setProdutoEdit({...produtoEdit, sku: e.target.value})}
                    placeholder="Ex: REF-50W-BR"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 font-mono" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Família/Linha</label>
                  <input value={produtoEdit.family || ''} onChange={e => setProdutoEdit({...produtoEdit, family: e.target.value})}
                    placeholder="Ex: Inlumix, Smart, Factory"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>
              {meuPapel !== 'marketing' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Preço cartão *</label>
                    <input type="number" step="0.01" value={produtoEdit.price || ''} onChange={e => setProdutoEdit({...produtoEdit, price: parseFloat(e.target.value)})}
                      placeholder="0,00" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Preço PIX</label>
                    <input type="number" step="0.01" value={produtoEdit.promo_price || ''} onChange={e => setProdutoEdit({...produtoEdit, promo_price: parseFloat(e.target.value)})}
                      placeholder="0,00" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Estoque *</label>
                    <input type="number" value={produtoEdit.stock_qty || ''} onChange={e => setProdutoEdit({...produtoEdit, stock_qty: parseInt(e.target.value)})}
                      placeholder="0" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
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
