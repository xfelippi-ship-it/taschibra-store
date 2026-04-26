'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'


export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleLogin() {
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('E-mail ou senha incorretos.')
    else window.location.href = '/'
    setLoading(false)
  }

  async function handleCadastro() {
    setLoading(true)
    setErro('')
    if (!nome.trim()) { setErro('Digite seu nome.'); setLoading(false); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } }
    })
    if (error) setErro('Erro ao criar conta. Verifique seus dados.')
    else setSucesso('Conta criada! Verifique seu e-mail para confirmar.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
<Image src="/images/logo.webp" alt="Taschibra Store" width={200} height={48} className="h-12 w-auto mx-auto mb-4" priority />          </Link>
          <h1 className="text-2xl font-black text-gray-800">
            {modo === 'login' ? 'Bem-vindo de volta!' : 'Criar conta'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {modo === 'login' ? 'Acesse sua conta Taschibra Store' : 'É rápido e gratuito'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => { setModo('login'); setErro(''); setSucesso('') }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${modo === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
              Entrar
            </button>
            <button onClick={() => { setModo('cadastro'); setErro(''); setSucesso('') }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${modo === 'cadastro' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
              Criar conta
            </button>
          </div>

          <div className="space-y-4">
            {modo === 'cadastro' && (
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nome completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={nome} onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-green-500 transition-colors" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-green-500 transition-colors" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-gray-700">Senha</label>
                {modo === 'login' && (
                  <a href="#" className="text-xs text-green-600 hover:underline">Esqueci minha senha</a>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-3 text-sm outline-none focus:border-green-500 transition-colors" />
                <button type="button" onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                {sucesso}
              </div>
            )}

            <button
              onClick={modo === 'login' ? handleLogin : handleCadastro}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3.5 rounded-lg transition-colors mt-2">
              {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar na conta' : 'Criar minha conta'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Ao criar uma conta você concorda com nossos{' '}
              <a href="#" className="text-green-600 hover:underline">Termos de Uso</a> e{' '}
              <a href="#" className="text-green-600 hover:underline">Política de Privacidade</a>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="text-green-600 hover:underline font-semibold">
            ← Voltar para a loja
          </Link>
        </p>
      </div>
    </div>
  )
}