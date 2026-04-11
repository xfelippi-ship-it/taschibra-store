'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { ArrowLeft, User, MapPin, CreditCard, Bell, Plus, Trash2, Save, Check, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'


type Endereco = {
  id?: string
  label: string
  recipient_name: string
  zipcode: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  is_default: boolean
}

type Cartao = {
  id: string
  brand: string
  last_four: string
  holder_name: string
  exp_month: number
  exp_year: number
  is_default: boolean
}

const enderecoVazio: Endereco = {
  label: 'Casa', recipient_name: '', zipcode: '', street: '',
  number: '', complement: '', district: '', city: '', state: '', is_default: false
}

type Tab = 'pessoais' | 'enderecos' | 'cartoes' | 'preferencias'

export default function DadosPage() {
  const [tab, setTab] = useState<Tab>('pessoais')
  const [clienteId, setClienteId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  // Dados pessoais
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [novoEndereco, setNovoEndereco] = useState(false)
  const [enderecoForm, setEnderecoForm] = useState<Endereco>(enderecoVazio)
  const [loadingCep, setLoadingCep] = useState(false)
  const [editandoEndereco, setEditandoEndereco] = useState<string | null>(null)

  // Cartões
  const [cartoes, setCartoes] = useState<Cartao[]>([])

  // Preferências
  const [aceitaMarketing, setAceitaMarketing] = useState(false)
  const [confirmaExclusao, setConfirmaExclusao] = useState(false)
  const [senhaExclusao, setSenhaExclusao] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_logado')
    if (!salvo) { window.location.href = '/minha-conta'; return }
    const c = JSON.parse(salvo)
    setClienteId(c.id)
    carregarDados(c.id)
    carregarEnderecos(c.id)
    carregarCartoes(c.id)
  }, [])

  async function carregarDados(id: string) {
    const { data } = await supabase
      .from('customers')
      .select('first_name, last_name, email, cpf, phone, birth_date, accepts_marketing')
      .eq('id', id)
      .single()
    if (data) {
      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
      setEmail(data.email || '')
      setCpf(data.cpf || '')
      setPhone(data.phone || '')
      setBirthDate(data.birth_date || '')
      setAceitaMarketing(data.accepts_marketing || false)
    }
  }

  async function carregarEnderecos(id: string) {
    const { data } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', id)
      .order('is_default', { ascending: false })
    setEnderecos(data || [])
  }

  async function carregarCartoes(id: string) {
    const { data } = await supabase
      .from('customer_cards')
      .select('*')
      .eq('customer_id', id)
      .order('is_default', { ascending: false })
    setCartoes(data || [])
  }

  function feedback(msg: string, tipo: 'ok' | 'erro') {
    if (tipo === 'ok') { setSucesso(msg); setTimeout(() => setSucesso(''), 3000) }
    else { setErro(msg); setTimeout(() => setErro(''), 4000) }
  }

  async function excluirConta() {
    if (!senhaExclusao.trim()) return
    setExcluindo(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email, password: senhaExclusao
      })
      if (error) { alert('Senha incorreta.'); setExcluindo(false); return }
      if (clienteId) {
        await supabase.from('customer_addresses').delete().eq('customer_id', clienteId)
        await supabase.from('customers').delete().eq('id', clienteId)
      }
      await supabase.auth.signOut()
      alert('Conta excluída. Seus dados foram removidos.')
      window.location.href = '/'
    } catch { alert('Erro ao excluir conta.') }
    setExcluindo(false)
  }

  async function salvarDadosPessoais() {
    setSalvando(true)
    const { error } = await supabase
      .from('customers')
      .update({ first_name: firstName, last_name: lastName, cpf, phone, birth_date: birthDate || null, accepts_marketing: aceitaMarketing, updated_at: new Date().toISOString() })
      .eq('id', clienteId)
    setSalvando(false)
    if (error) feedback('Erro ao salvar dados.', 'erro')
    else {
      feedback('Dados salvos com sucesso!', 'ok')
      const salvo = localStorage.getItem('cliente_logado')
      if (salvo) {
        const c = JSON.parse(salvo)
        localStorage.setItem('cliente_logado', JSON.stringify({ ...c, nome: `${firstName} ${lastName}`.trim() }))
      }
    }
  }

  async function buscarCep(cep: string) {
    const limpo = cep.replace(/\D/g, '')
    if (limpo.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setEnderecoForm(prev => ({
          ...prev, street: data.logradouro, district: data.bairro,
          city: data.localidade, state: data.uf, zipcode: cep
        }))
      }
    } catch {}
    setLoadingCep(false)
  }

  async function salvarEndereco() {
    setSalvando(true)
    if (editandoEndereco) {
      const { error } = await supabase
        .from('customer_addresses')
        .update({ ...enderecoForm })
        .eq('id', editandoEndereco)
      if (!error) { setEditandoEndereco(null); setEnderecoForm(enderecoVazio); carregarEnderecos(clienteId); feedback('Endereço atualizado!', 'ok') }
    } else {
      const { error } = await supabase
        .from('customer_addresses')
        .insert({ ...enderecoForm, customer_id: clienteId })
      if (!error) { setNovoEndereco(false); setEnderecoForm(enderecoVazio); carregarEnderecos(clienteId); feedback('Endereço adicionado!', 'ok') }
    }
    setSalvando(false)
  }

  async function removerEndereco(id: string) {
    await supabase.from('customer_addresses').delete().eq('id', id)
    carregarEnderecos(clienteId)
    feedback('Endereço removido.', 'ok')
  }

  async function definirEnderecoDefault(id: string) {
    await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', clienteId)
    await supabase.from('customer_addresses').update({ is_default: true }).eq('id', id)
    carregarEnderecos(clienteId)
  }

  async function removerCartao(id: string) {
    await supabase.from('customer_cards').delete().eq('id', id)
    carregarCartoes(clienteId)
    feedback('Cartão removido.', 'ok')
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'pessoais', label: 'Dados Pessoais', icon: <User size={16} /> },
    { id: 'enderecos', label: 'Endereços', icon: <MapPin size={16} /> },
    { id: 'cartoes', label: 'Cartões', icon: <CreditCard size={16} /> },
    { id: 'preferencias', label: 'Preferências', icon: <Bell size={16} /> },
  ]

  const formularioEndereco = (
    <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-5 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Identificação</label>
          <select value={enderecoForm.label} onChange={e => setEnderecoForm(p => ({...p, label: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 bg-white">
            <option>Casa</option><option>Trabalho</option><option>Outro</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Nome do destinatário</label>
          <input value={enderecoForm.recipient_name} onChange={e => setEnderecoForm(p => ({...p, recipient_name: e.target.value}))}
            placeholder="Quem vai receber" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">CEP</label>
        <div className="flex gap-2">
          <input value={enderecoForm.zipcode}
            onChange={e => setEnderecoForm(p => ({...p, zipcode: e.target.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2').substring(0,9)}))}
            onBlur={e => buscarCep(e.target.value)} placeholder="00000-000"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
          <button onClick={() => buscarCep(enderecoForm.zipcode)} disabled={loadingCep}
            className="bg-green-600 text-white text-sm font-bold px-4 rounded-lg disabled:opacity-50">
            {loadingCep ? '...' : 'Buscar'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-bold text-gray-600 mb-1 block">Rua</label>
          <input value={enderecoForm.street} onChange={e => setEnderecoForm(p => ({...p, street: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Número</label>
          <input value={enderecoForm.number} onChange={e => setEnderecoForm(p => ({...p, number: e.target.value}))}
            placeholder="123" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Complemento</label>
          <input value={enderecoForm.complement} onChange={e => setEnderecoForm(p => ({...p, complement: e.target.value}))}
            placeholder="Apto, bloco..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Bairro</label>
          <input value={enderecoForm.district} onChange={e => setEnderecoForm(p => ({...p, district: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Cidade</label>
          <input value={enderecoForm.city} onChange={e => setEnderecoForm(p => ({...p, city: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Estado</label>
          <input value={enderecoForm.state} onChange={e => setEnderecoForm(p => ({...p, state: e.target.value}))}
            maxLength={2} placeholder="SC" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={enderecoForm.is_default} onChange={e => setEnderecoForm(p => ({...p, is_default: e.target.checked}))} className="accent-green-600" />
        <span className="text-sm text-gray-600">Definir como endereço padrão</span>
      </label>
      <div className="flex gap-3">
        <button onClick={() => { setNovoEndereco(false); setEditandoEndereco(null); setEnderecoForm(enderecoVazio) }}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={salvarEndereco} disabled={salvando || !enderecoForm.street || !enderecoForm.number}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar endereço'}
        </button>
      </div>
    </div>
  )

  return (
    <><Header />
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/minha-conta" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-black text-gray-800">Minha Conta</h1>
      </div>

      {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><Check size={16} /> {sucesso}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erro}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-1 justify-center ${tab === t.id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Dados Pessoais */}
      {tab === 'pessoais' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2"><User size={18} className="text-green-600" /> Dados Pessoais</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nome</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Sobrenome</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sobrenome"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">E-mail</label>
            <input value={email} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-400 outline-none" />
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">CPF</label>
              <input value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').substring(0,14))}
                placeholder="000.000.000-00" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Data de nascimento</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Telefone / WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{1,4})$/,'$1-$2').substring(0,15))}
              placeholder="(47) 99999-9999" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>
          <button onClick={salvarDadosPessoais} disabled={salvando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar dados pessoais'}
          </button>
        </div>
      )}

      {/* Endereços */}
      {tab === 'enderecos' && (
        <div className="space-y-3">
          {enderecos.map(e => (
            <div key={e.id} className={`bg-white border-2 rounded-xl p-4 ${e.is_default ? 'border-green-500' : 'border-gray-200'}`}>
              {editandoEndereco === e.id ? formularioEndereco : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.label}</span>
                      {e.is_default && <span className="text-xs font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Padrão</span>}
                    </div>
                    <div className="flex gap-2">
                      {!e.is_default && (
                        <button onClick={() => definirEnderecoDefault(e.id!)} className="text-xs text-green-600 font-bold hover:underline">
                          Tornar padrão
                        </button>
                      )}
                      <button onClick={() => { setEditandoEndereco(e.id!); setEnderecoForm(e) }} className="text-gray-400 hover:text-gray-600">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => removerEndereco(e.id!)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{e.recipient_name}</p>
                  <p className="text-sm text-gray-600">{e.street}, {e.number} {e.complement}</p>
                  <p className="text-sm text-gray-600">{e.district} — {e.city}/{e.state}</p>
                  <p className="text-xs text-gray-400">CEP: {e.zipcode}</p>
                </>
              )}
            </div>
          ))}
          {enderecos.length === 0 && !novoEndereco && (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
              <MapPin size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Nenhum endereço cadastrado</p>
            </div>
          )}
          {novoEndereco && formularioEndereco}
          {!novoEndereco && !editandoEndereco && (
            <button onClick={() => setNovoEndereco(true)}
              className="w-full border-2 border-dashed border-gray-300 hover:border-green-500 text-gray-500 hover:text-green-600 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Plus size={16} /> Adicionar endereço
            </button>
          )}
        </div>
      )}

      {/* Cartões */}
      {tab === 'cartoes' && (
        <div className="space-y-3">
          {cartoes.map(c => (
            <div key={c.id} className={`bg-white border-2 rounded-xl p-4 ${c.is_default ? 'border-green-500' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-gray-800 rounded-md flex items-center justify-center">
                    <CreditCard size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">{c.brand} •••• {c.last_four}</p>
                    <p className="text-xs text-gray-500">{c.holder_name} · {c.exp_month}/{c.exp_year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.is_default && <span className="text-xs font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Padrão</span>}
                  <button onClick={() => removerCartao(c.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cartoes.length === 0 && (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
              <CreditCard size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-1">Nenhum cartão salvo</p>
              <p className="text-xs text-gray-400">Os cartões são salvos automaticamente após uma compra aprovada</p>
            </div>
          )}
        </div>
      )}

      {/* Preferências */}
      {tab === 'preferencias' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-black text-gray-800 flex items-center gap-2"><Bell size={18} className="text-green-600" /> Preferências</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={aceitaMarketing} onChange={e => setAceitaMarketing(e.target.checked)} className="accent-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-800">Receber ofertas e novidades</p>
              <p className="text-xs text-gray-500">Aceito receber e-mails com promoções, lançamentos e novidades da Taschibra Store</p>
            </div>
          </label>
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-black text-red-600 mb-2">Aviso</p>
            <p className="text-xs text-gray-500 mb-3">A exclusão da conta remove permanentemente todos os seus dados, pedidos e informações pessoais.</p>
            {!confirmaExclusao ? (
              <button onClick={() => setConfirmaExclusao(true)}
                className="text-sm text-red-500 hover:text-red-700 font-bold border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition-colors">
                Solicitar exclusão de conta
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-black text-red-700">Confirme a exclusão</p>
                <p className="text-xs text-red-600">Esta ação é irreversível. Digite sua senha para confirmar.</p>
                <input type="password" value={senhaExclusao} onChange={e => setSenhaExclusao(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                <div className="flex gap-2">
                  <button onClick={() => { setConfirmaExclusao(false); setSenhaExclusao('') }}
                    className="flex-1 border border-gray-200 text-gray-600 font-bold py-2 rounded-lg text-sm hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button onClick={excluirConta} disabled={excluindo || !senhaExclusao.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-2 rounded-lg text-sm">
                    {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button onClick={salvarDadosPessoais} disabled={salvando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar preferências'}
          </button>
        </div>
      )}
    </div>
    <Footer /></>
  )
}
