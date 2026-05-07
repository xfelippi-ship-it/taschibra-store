'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { User, Package, LogOut, ChevronRight, Heart, Eye, EyeOff, Mail, Check, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Usuario = { email: string; nome?: string; id?: string }

export default function MinhaContaPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [nome, setNome] = useState('')
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [verificando, setVerificando] = useState(true)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)

  // Validacao de senha em tempo real
  const senhaTemMinChars = senha.length >= 8
  const senhaTemMaiuscula = /[A-Z]/.test(senha)
  const senhaTemNumero = /[0-9]/.test(senha)
  const senhaForte = senhaTemMinChars && senhaTemMaiuscula && senhaTemNumero
  const senhasCoincidem = senha.length > 0 && senha === confirmarSenha

  // Detecta sessao ao montar + escuta mudancas
  useEffect(() => {
    async function carregarSessao() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const u: Usuario = {
          email: session.user.email || '',
          nome: (session.user.user_metadata?.nome as string) || '',
          id: session.user.id,
        }
        setUsuario(u)
        // Compatibilidade legada: mantem localStorage pra UserMenu/outras paginas
        localStorage.setItem('cliente_logado', JSON.stringify(u))
        window.dispatchEvent(new Event('cliente-changed'))
      }
      setVerificando(false)
    }
    carregarSessao()

    // Escuta mudancas de auth (login em outra aba, logout, etc)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: Usuario = {
          email: session.user.email || '',
          nome: (session.user.user_metadata?.nome as string) || '',
          id: session.user.id,
        }
        setUsuario(u)
        localStorage.setItem('cliente_logado', JSON.stringify(u))
        window.dispatchEvent(new Event('cliente-changed'))
      } else {
        setUsuario(null)
        localStorage.removeItem('cliente_logado')
        window.dispatchEvent(new Event('cliente-changed'))
      }
    })

    return () => { listener.subscription.unsubscribe() }
  }, [])

  async function handleLogin() {
    if (!email || !senha) { setErro('Preencha email e senha.'); return }
    setLoading(true)
    setErro('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: senha,
      })

      if (error) {
        // Mensagens amigaveis
        if (error.message.includes('Invalid login credentials')) {
          setErro('E-mail ou senha incorretos. Se voce ja comprou conosco antes, clique em \"Esqueci minha senha\" para atualizar sua conta.')
        } else if (error.message.includes('Email not confirmed')) {
          setErro('Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada (e a pasta de spam).')
        } else {
          setErro('Erro ao fazer login: ' + error.message)
        }
        return
      }

      // onAuthStateChange vai cuidar do resto
    } catch {
      setErro('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCadastro() {
    if (!nome.trim()) { setErro('Preencha seu nome.'); return }
    if (!email) { setErro('Preencha seu email.'); return }
    if (!senhaForte) { setErro('A senha precisa ter no minimo 8 caracteres, 1 letra maiuscula e 1 numero.'); return }
    if (!senhasCoincidem) { setErro('As senhas nao coincidem.'); return }

    setLoading(true)
    setErro('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: senha,
        options: {
          data: { nome: nome.trim() },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?type=signup` : undefined,
        }
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setErro('Este e-mail ja esta cadastrado. Faca login ou clique em \"Esqueci minha senha\".')
          setModo('login')
        } else if (error.message.includes('Password should be at least')) {
          setErro('A senha precisa ter no minimo 8 caracteres.')
        } else {
          setErro('Erro ao cadastrar: ' + error.message)
        }
        return
      }

      // Cria registro em customer_profiles (mesmo id do auth.users)
      // Cast 'as any' porque tipo de customer_profiles ainda nao foi regenerado
      // (mesmo padrao usado em favoritos/page.tsx com tabela favorites)
      if (data.user) {
        await (supabase.from as any)('customer_profiles').insert({
          id: data.user.id,
          nome: nome.trim(),
          tipo: 'PF',
          status: 'aprovado',
          password_set_at: new Date().toISOString(),
        })
      }

      // Como Confirm email esta ativo, session sera null aqui
      // Cliente precisa abrir o email pra confirmar
      setEmailEnviado(true)
    } catch {
      setErro('Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    // onAuthStateChange limpa o resto
  }

  function trocarModo(novo: 'login' | 'cadastro') {
    setModo(novo)
    setErro('')
    setSenha('')
    setConfirmarSenha('')
    setEmailEnviado(false)
  }

  if (verificando) return null

  // ─── Tela: Email enviado (apos cadastro) ────────────────────────
  if (emailEnviado) {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Verifique seu e-mail</h1>
          <p className="text-sm text-gray-600 mb-1">Enviamos um link de confirmacao para</p>
          <p className="text-sm font-bold text-gray-800 mb-6">{email}</p>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-lg mb-6 text-left">
            <p className="font-bold mb-1">Proximos passos:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra seu e-mail</li>
              <li>Clique no link de confirmacao</li>
              <li>Volte aqui e faca login normalmente</li>
            </ol>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Nao recebeu? Verifique a pasta de spam ou aguarde alguns minutos.
          </p>
          <button onClick={() => trocarModo('login')}
            className="text-sm text-green-600 hover:text-green-700 font-bold">
            Ir para o login
          </button>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Tela: Logado (dashboard pos-login) ─────────────────────────
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
            <Link href="/minha-conta/favoritos"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-green-600" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Meus Favoritos</p>
                  <p className="text-xs text-gray-500">Produtos salvos para comprar depois</p>
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
                  <p className="text-xs text-gray-500">Edite suas informacoes pessoais</p>
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

  // ─── Tela: Login / Cadastro ─────────────────────────────────────
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
            {modo === 'login' ? 'Entre para acompanhar seus pedidos' : 'Crie sua conta para comecar'}
          </p>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => trocarModo('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${modo === 'login' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Entrar
          </button>
          <button onClick={() => trocarModo('cadastro')}
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
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email" autoComplete="email"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Senha</label>
            <div className="relative">
              <input
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder={modo === 'cadastro' ? 'Crie uma senha forte' : 'Sua senha'}
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm outline-none focus:border-green-500" />
              <button type="button" onClick={() => setMostrarSenha(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {modo === 'cadastro' && senha.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {senhaTemMinChars ? <Check size={13} className="text-green-600" /> : <X size={13} className="text-gray-300" />}
                  <span className={senhaTemMinChars ? 'text-green-700' : 'text-gray-400'}>Mininmo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {senhaTemMaiuscula ? <Check size={13} className="text-green-600" /> : <X size={13} className="text-gray-300" />}
                  <span className={senhaTemMaiuscula ? 'text-green-700' : 'text-gray-400'}>1 letra maiuscula</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {senhaTemNumero ? <Check size={13} className="text-green-600" /> : <X size={13} className="text-gray-300" />}
                  <span className={senhaTemNumero ? 'text-green-700' : 'text-gray-400'}>1 numero</span>
                </div>
              </div>
            )}
          </div>
          {modo === 'cadastro' && (
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Confirmar senha</label>
              <input
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 ${
                  confirmarSenha.length > 0 && !senhasCoincidem ? 'border-red-300' : 'border-gray-200'
                }`} />
              {confirmarSenha.length > 0 && !senhasCoincidem && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">As senhas nao coincidem</p>
              )}
            </div>
          )}
          <button
            onClick={modo === 'login' ? handleLogin : handleCadastro}
            disabled={loading || !email || !senha || (modo === 'cadastro' && (!senhaForte || !senhasCoincidem || !nome.trim()))}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
          {modo === 'login' && (
            <div className="text-center pt-2">
              <Link href="/esqueci-senha" className="text-sm text-green-600 hover:text-green-700 font-bold hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
