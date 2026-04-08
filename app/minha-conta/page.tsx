'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { createClient } from '@supabase/supabase-js'
import { User, Package, LogOut, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MinhaContaPage() {
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [usuario, setUsuario] = useState<{email: string, nome?: string, id?: string} | null>(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_logado')
    if (salvo) setUsuario(JSON.parse(salvo))
    setVerificando(false)
  }, [])

  async function handleLogin() {
    setLoading(true)
    setErro('')
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !data) {
        setErro('E-mail não encontrado. Cadastre-se primeiro.')
        return
      }

      const u = { email: data.email, nome: data.name, id: data.id }
      localStorage.setItem('cliente_logado', JSON.stringify(u))
      setUsuario(u)
    } catch {
      setErro('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCadastro() {
    if (!nome || !email) { setErro('Preencha nome e e-mail.'); return }
    setLoading(true)
    setErro('')
    try {
      const { data: existente } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existente) {
        setErro('E-mail já cadastrado. Faça login.')
        setModo('login')
        return
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({ name: nome, email: email.toLowerCase().trim() })
        .select()
        .single()

      if (error || !data) {
        setErro('Erro ao cadastrar. Tente novamente.')
        return
      }

      const u = { email: data.email, nome: data.name, id: data.id }
      localStorage.setItem('cliente_logado', JSON.stringify(u))
      setUsuario(u)
    } catch {
      setErro('Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('cliente_logado')
    setUsuario(null)
  }

  if (verificando) return null

  if (usuario) {
    return (
      <><Header />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800">{usuario.nome || 'Minha Conta'}</h1>
              <p className="text-sm text-gray-500">{usuario.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/minha-conta/pedidos"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-green-600" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Meus Pedidos</p>
                  <p className="text-xs text-gray-500">Acompanhe seus pedidos e rastreamento</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
            <Link href="/minha-conta/dados"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <User size={20} className="text-green-600" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Meus Dados</p>
                  <p className="text-xs text-gray-500">Edite suas informações pessoais</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors">
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
      <Footer /></>
    )
  }

  return (
    <><Header />
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User size={24} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800">Minha Conta</h1>
          <p className="text-sm text-gray-500 mt-1">
            {modo === 'login' ? 'Entre para acompanhar seus pedidos' : 'Crie sua conta para começar'}
          </p>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setModo('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${modo === 'login' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Entrar
          </button>
          <button onClick={() => setModo('cadastro')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${modo === 'cadastro' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Cadastrar
          </button>
        </div>
        {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erro}</div>}
        <div className="space-y-4">
          {modo === 'cadastro' && (
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nome completo</label>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">E-mail</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>
          <button
            onClick={modo === 'login' ? handleLogin : handleCadastro}
            disabled={loading || !email}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
