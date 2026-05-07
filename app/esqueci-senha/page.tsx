'use client'
import { useState } from 'react'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { Mail, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleEnviar() {
    if (!email.trim()) { setErro('Digite seu e-mail.'); return }
    setLoading(true)
    setErro('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/redefinir-senha`
            : undefined,
        }
      )

      if (error) {
        setErro('Erro ao enviar e-mail: ' + error.message)
        return
      }

      // Sempre mostra tela de sucesso, mesmo se email nao existir
      // (evita user enumeration attack — padrao de seguranca)
      setEnviado(true)
    } catch {
      setErro('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Tela de sucesso ────────────────────────────────────────────
  if (enviado) {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">E-mail enviado!</h1>
          <p className="text-sm text-gray-600 mb-1">Se houver uma conta cadastrada com</p>
          <p className="text-sm font-bold text-gray-800 mb-4">{email}</p>
          <p className="text-sm text-gray-600 mb-6">enviaremos um link para redefinir sua senha.</p>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-lg mb-6 text-left">
            <p className="font-bold mb-1">O que fazer agora:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra seu e-mail</li>
              <li>Clique no link de redefinicao</li>
              <li>Crie uma nova senha</li>
            </ol>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Nao recebeu? Verifique a pasta de spam ou aguarde alguns minutos.
          </p>

          <Link href="/minha-conta" className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-bold">
            <ArrowLeft size={14} /> Voltar para o login
          </Link>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Tela inicial ───────────────────────────────────────────────
  return (
    <><Header />
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <Link href="/minha-conta" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={14} /> Voltar para o login
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail size={24} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800">Esqueci minha senha</h1>
          <p className="text-sm text-gray-500 mt-1">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
        </div>

        {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erro}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">E-mail cadastrado</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviar()}
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>
          <button
            onClick={handleEnviar}
            disabled={loading || !email.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Enviando...' : 'Enviar link de redefinicao'}
          </button>
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
