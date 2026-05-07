'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { Lock, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [tokenValido, setTokenValido] = useState(false)

  // Validacao de senha em tempo real (mesmo padrao de /minha-conta)
  const senhaTemMinChars = senha.length >= 8
  const senhaTemMaiuscula = /[A-Z]/.test(senha)
  const senhaTemNumero = /[0-9]/.test(senha)
  const senhaForte = senhaTemMinChars && senhaTemMaiuscula && senhaTemNumero
  const senhasCoincidem = senha.length > 0 && senha === confirmarSenha

  // Valida sessao de recovery vinda do link do email
  useEffect(() => {
    async function verificarToken() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setTokenValido(true)
      } else {
        // Escuta evento PASSWORD_RECOVERY que o Supabase dispara ao processar o link
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            setTokenValido(true)
            setVerificando(false)
          }
        })
        // Se nao detectar em 2s, considera token invalido
        setTimeout(() => {
          setVerificando(false)
          listener.subscription.unsubscribe()
        }, 2000)
        return
      }
      setVerificando(false)
    }
    verificarToken()
  }, [])

  async function handleRedefinir() {
    if (!senhaForte) { setErro('A senha precisa ter no minimo 8 caracteres, 1 maiuscula e 1 numero.'); return }
    if (!senhasCoincidem) { setErro('As senhas nao coincidem.'); return }

    setLoading(true)
    setErro('')
    try {
      const { error } = await supabase.auth.updateUser({ password: senha })
      if (error) {
        setErro('Erro ao redefinir senha: ' + error.message)
        return
      }
      setSucesso(true)
      // Auto-redirect para minha-conta apos 3s
      setTimeout(() => router.push('/minha-conta'), 3000)
    } catch {
      setErro('Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Carregando (verificando token) ─────────────────────────────
  if (verificando) {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500">Verificando link...</p>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Token invalido / expirado ──────────────────────────────────
  if (!tokenValido && !sucesso) {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={28} className="text-red-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Link invalido ou expirado</h1>
          <p className="text-sm text-gray-600 mb-6">
            O link de redefinicao expirou ou ja foi usado.
            Solicite um novo link para continuar.
          </p>
          <Link href="/esqueci-senha"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-black text-sm px-6 py-3 rounded-lg transition-colors">
            Solicitar novo link
          </Link>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Sucesso ────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Senha redefinida!</h1>
          <p className="text-sm text-gray-600 mb-6">Sua senha foi atualizada com sucesso. Redirecionando...</p>
          <Link href="/minha-conta"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-black text-sm px-6 py-3 rounded-lg transition-colors">
            Ir para Minha Conta
          </Link>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Form de redefinir ──────────────────────────────────────────
  return (
    <><Header />
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <Link href="/minha-conta" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={14} /> Cancelar
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={24} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800">Redefinir senha</h1>
          <p className="text-sm text-gray-500 mt-1">Crie uma nova senha forte para sua conta.</p>
        </div>

        {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{erro}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nova senha</label>
            <div className="relative">
              <input
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Crie uma senha forte"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm outline-none focus:border-green-500" />
              <button type="button" onClick={() => setMostrarSenha(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {senha.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {senhaTemMinChars ? <Check size={13} className="text-green-600" /> : <X size={13} className="text-gray-300" />}
                  <span className={senhaTemMinChars ? 'text-green-700' : 'text-gray-400'}>Minimo 8 caracteres</span>
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

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Confirmar nova senha</label>
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

          <button
            onClick={handleRedefinir}
            disabled={loading || !senhaForte || !senhasCoincidem}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
