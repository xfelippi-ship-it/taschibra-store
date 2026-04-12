'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Plus, Trash2, Edit2, X, Check, Building2, FileText, CreditCard, Truck, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CompanySettings {
  id?: string
  razao_social: string
  cnpj: string
  endereco: string
  nome_fantasia: string
  inscricao_estadual: string
  telefone: string
  email_contato: string
}

interface BoletoSettings {
  id?: string
  desconto_percentual: number
  dias_vencimento: number
  valor_minimo: number
  aplicar_desconto_em: 'itens' | 'total'
}

interface CardSettings {
  id?: string
  max_parcelas: number
  valor_minimo_parcela: number
}

interface ExtraDay {
  id?: string
  data_inicial: string
  data_final: string
  dias_adicionais: number
  ativo: boolean
}

// ─── Seção colapsável ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children, defaultOpen = true }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Icon size={16} className="text-green-700" />
          </div>
          <span className="font-black text-gray-800">{title}</span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-gray-400" />
          : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100">{children}</div>}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ConfiguracoesLojaTab() {
  // ── State ──
  const [company, setCompany] = useState<CompanySettings>({
    razao_social: '', cnpj: '', endereco: '',
    nome_fantasia: '', inscricao_estadual: '', telefone: '', email_contato: ''
  })
  const [boleto, setBoleto] = useState<BoletoSettings>({
    desconto_percentual: 5, dias_vencimento: 2, valor_minimo: 0, aplicar_desconto_em: 'itens'
  })
  const [card, setCard] = useState<CardSettings>({
    max_parcelas: 10, valor_minimo_parcela: 50
  })
  const [extraDays, setExtraDays] = useState<ExtraDay[]>([])
  const [newDay, setNewDay] = useState<ExtraDay>({
    data_inicial: '', data_final: '', dias_adicionais: 1, ativo: true
  })
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // ── Helpers ──
  function showMsg(texto: string, tipo: 'ok' | 'erro' = 'ok') {
    setMsg({ tipo, texto })
    setTimeout(() => setMsg(null), 3000)
  }

  // ── Load ──
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [c, b, k, d] = await Promise.all([
        supabase.from('company_settings').select('*').single(),
        supabase.from('payment_boleto_settings').select('*').single(),
        supabase.from('payment_card_settings').select('*').single(),
        supabase.from('shipping_extra_days').select('*').order('data_inicial'),
      ])
      if (c.data) setCompany(c.data)
      if (b.data) setBoleto(b.data)
      if (k.data) setCard(k.data)
      if (d.data) setExtraDays(d.data)
      setLoading(false)
    }
    load()
  }, [])

  // ── Save Company ──
  async function saveCompany() {
    setSaving('company')
    const { id, ...data } = company as any
    const op = id
      ? supabase.from('company_settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
      : supabase.from('company_settings').insert(data).select().single()
    const { error } = await op
    setSaving(null)
    if (error) showMsg('Erro ao salvar dados da empresa', 'erro')
    else showMsg('✅ Dados da empresa salvos!')
  }

  // ── Save Boleto ──
  async function saveBoleto() {
    setSaving('boleto')
    const { id, ...data } = boleto as any
    const op = id
      ? supabase.from('payment_boleto_settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
      : supabase.from('payment_boleto_settings').insert(data).select().single()
    const { error } = await op
    setSaving(null)
    if (error) showMsg('Erro ao salvar configurações de boleto', 'erro')
    else showMsg('✅ Configurações de boleto salvas!')
  }

  // ── Save Card ──
  async function saveCard() {
    setSaving('card')
    const { id, ...data } = card as any
    const op = id
      ? supabase.from('payment_card_settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
      : supabase.from('payment_card_settings').insert(data).select().single()
    const { error } = await op
    setSaving(null)
    if (error) showMsg('Erro ao salvar configurações de cartão', 'erro')
    else showMsg('✅ Configurações de cartão salvas!')
  }

  // ── Extra Days CRUD ──
  async function addExtraDay() {
    if (!newDay.data_inicial || !newDay.data_final) {
      showMsg('Preencha as datas inicial e final', 'erro'); return
    }
    const { data, error } = await supabase.from('shipping_extra_days').insert(newDay).select().single()
    if (error) { showMsg('Erro ao adicionar prazo', 'erro'); return }
    setExtraDays(prev => [...prev, data])
    setNewDay({ data_inicial: '', data_final: '', dias_adicionais: 1, ativo: true })
    showMsg('✅ Prazo adicional criado!')
  }

  async function updateExtraDay(item: ExtraDay) {
    const { id, ...data } = item as any
    const { error } = await supabase
      .from('shipping_extra_days')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { showMsg('Erro ao atualizar prazo', 'erro'); return }
    setExtraDays(prev => prev.map(d => d.id === id ? item : d))
    setEditingDayId(null)
    showMsg('✅ Prazo atualizado!')
  }

  async function deleteExtraDay(id: string) {
    if (!confirm('Remover este prazo adicional?')) return
    const { error } = await supabase.from('shipping_extra_days').delete().eq('id', id)
    if (error) { showMsg('Erro ao remover', 'erro'); return }
    setExtraDays(prev => prev.filter(d => d.id !== id))
    showMsg('✅ Removido!')
  }

  // ── Render ──
  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
      Carregando configurações...
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-gray-800">Configurações da Loja</h1>
      </div>

      {/* Toast */}
      {msg && (
        <p className={`text-sm font-bold px-4 py-3 rounded-lg ${
          msg.tipo === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {msg.texto}
        </p>
      )}

      {/* ── Dados da Empresa ── */}
      <Section icon={Building2} title="Dados da Empresa">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {([
            { label: 'Razão Social', key: 'razao_social', full: true },
            { label: 'CNPJ', key: 'cnpj' },
            { label: 'Nome Fantasia', key: 'nome_fantasia' },
            { label: 'Inscrição Estadual', key: 'inscricao_estadual' },
            { label: 'Telefone', key: 'telefone' },
            { label: 'E-mail de Contato', key: 'email_contato' },
            { label: 'Endereço Completo', key: 'endereco', full: true },
          ] as { label: string; key: keyof CompanySettings; full?: boolean }[]).map(f => (
            <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
              <label className="text-xs font-bold text-gray-600 mb-1 block">{f.label}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
                value={company[f.key] as string}
                onChange={e => setCompany(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveCompany}
          disabled={saving === 'company'}
          className="mt-5 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Save size={14} />
          {saving === 'company' ? 'Salvando...' : 'Salvar Dados da Empresa'}
        </button>
      </Section>

      {/* ── Configurações de Boleto ── */}
      <Section icon={FileText} title="Configurações de Boleto" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Desconto para boleto (%)</label>
            <input
              type="number" min={0} max={100} step={0.01}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={boleto.desconto_percentual}
              onChange={e => setBoleto(prev => ({ ...prev, desconto_percentual: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Dias para vencimento</label>
            <input
              type="number" min={1}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={boleto.dias_vencimento}
              onChange={e => setBoleto(prev => ({ ...prev, dias_vencimento: parseInt(e.target.value) || 1 }))}
            />
            <p className="text-xs text-gray-400 mt-1">Deve ser ≤ ao configurado no PagarMe</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Valor mínimo para boleto (R$)</label>
            <input
              type="number" min={0} step={0.01}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={boleto.valor_minimo}
              onChange={e => setBoleto(prev => ({ ...prev, valor_minimo: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Aplicar desconto em</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white"
              value={boleto.aplicar_desconto_em}
              onChange={e => setBoleto(prev => ({ ...prev, aplicar_desconto_em: e.target.value as 'itens' | 'total' }))}
            >
              <option value="itens">Somente nos itens</option>
              <option value="total">Valor total da compra</option>
            </select>
          </div>
        </div>
        <button
          onClick={saveBoleto}
          disabled={saving === 'boleto'}
          className="mt-5 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Save size={14} />
          {saving === 'boleto' ? 'Salvando...' : 'Salvar Configurações de Boleto'}
        </button>
      </Section>

      {/* ── Configurações de Cartão ── */}
      <Section icon={CreditCard} title="Configurações de Cartão de Crédito" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Máximo de parcelas</label>
            <input
              type="number" min={1} max={24}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={card.max_parcelas}
              onChange={e => setCard(prev => ({ ...prev, max_parcelas: parseInt(e.target.value) || 1 }))}
            />
            <p className="text-xs text-gray-400 mt-1">Deve ser ≤ ao configurado no PagarMe</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Valor mínimo por parcela (R$)</label>
            <input
              type="number" min={0} step={0.01}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500"
              value={card.valor_minimo_parcela}
              onChange={e => setCard(prev => ({ ...prev, valor_minimo_parcela: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
        <button
          onClick={saveCard}
          disabled={saving === 'card'}
          className="mt-5 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Save size={14} />
          {saving === 'card' ? 'Salvando...' : 'Salvar Configurações de Cartão'}
        </button>
      </Section>

      {/* ── Prazo Adicional no Frete ── */}
      <Section icon={Truck} title="Prazo Adicional no Frete" defaultOpen={false}>
        <p className="text-xs text-gray-400 mt-3 mb-4">
          Quando mais de uma faixa estiver vigente no mesmo período, prevalece a de maior número de dias adicionais.
        </p>

        {/* Tabela de prazos existentes */}
        {extraDays.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Data Inicial</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Data Final</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Dias Adicionais</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ativo</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {extraDays.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {editingDayId === item.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input type="date"
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-500 w-full"
                            value={item.data_inicial}
                            onChange={e => setExtraDays(prev => prev.map(d => d.id === item.id ? { ...d, data_inicial: e.target.value } : d))}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input type="date"
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-500 w-full"
                            value={item.data_final}
                            onChange={e => setExtraDays(prev => prev.map(d => d.id === item.id ? { ...d, data_final: e.target.value } : d))}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input type="number" min={1}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-green-500 w-20 text-center"
                            value={item.dias_adicionais}
                            onChange={e => setExtraDays(prev => prev.map(d => d.id === item.id ? { ...d, dias_adicionais: parseInt(e.target.value) || 1 } : d))}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input type="checkbox" checked={item.ativo}
                            onChange={e => setExtraDays(prev => prev.map(d => d.id === item.id ? { ...d, ativo: e.target.checked } : d))}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateExtraDay(item)} className="text-green-600 hover:text-green-800"><Check size={14} /></button>
                            <button onClick={() => setEditingDayId(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(item.data_inicial + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(item.data_final + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-gray-800">{item.dias_adicionais}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setEditingDayId(item.id!)} className="text-blue-500 hover:text-blue-700"><Edit2 size={14} /></button>
                            <button onClick={() => deleteExtraDay(item.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Formulário novo prazo */}
        <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Adicionar novo prazo</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Data Inicial</label>
              <input type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                value={newDay.data_inicial}
                onChange={e => setNewDay(prev => ({ ...prev, data_inicial: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Data Final</label>
              <input type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                value={newDay.data_final}
                onChange={e => setNewDay(prev => ({ ...prev, data_final: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Dias Adicionais</label>
              <input type="number" min={1}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                value={newDay.dias_adicionais}
                onChange={e => setNewDay(prev => ({ ...prev, dias_adicionais: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addExtraDay}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      </Section>

    </div>
  )
}