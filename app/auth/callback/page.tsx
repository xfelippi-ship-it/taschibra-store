'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { Check, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [estado, setEstado] = useState<'processando' | 'sucesso' | 'erro'>('processando')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function processar() {
      const tipo = searchParams.get('type') || 'signup'
      const erro = searchParams.get('error')
      const erroDescricao = searchParams.get('error_description')

      // Erro vindo do Supabase (token invalido/expirado)
      if (erro) {
        setEstado('erro')
        setMensagem(erroDescricao || 'O link expirou ou ja foi usado.')
        return
      }

      // Aguarda Supabase processar o token automaticamente via hash da URL
      // Listener captura o evento SIGNED_IN apos confirmacao
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setEstado('sucesso')
          // Auto-redirect para minha-conta apos 2s (cliente ja logado)
          setTimeout(() => router.push('/minha-conta'), 2000)
        }
      })

      // Tambem verifica imediatamente se sessao ja esta ativa
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setEstado('sucesso')
        setTimeout(() => router.push('/minha-conta'), 2000)
      }

      // Se nao detectar em 5s, considera erro
      setTimeout(() => {
        listener.subscription.unsubscribe()
        setEstado(prev => {
          if (prev === 'processando') {
            setMensagem('Nao foi possivel confirmar. Tente fazer login normalmente ou solicite novo email.')
            return 'erro'
          }
          return prev
        })
      }, 5000)
    }

    processar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Processando ────────────────────────────────────────────────
  if (estado === 'processando') {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 size={28} className="text-green-600 animate-spin" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Confirmando seu cadastro...</h1>
          <p className="text-sm text-gray-600">So um momento.</p>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Sucesso ────────────────────────────────────────────────────
  if (estado === 'sucesso') {
    return (
      <><Header />
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">E-mail confirmado!</h1>
          <p className="text-sm text-gray-600 mb-6">Tudo pronto. Redirecionando para sua conta...</p>
          <Link href="/minha-conta"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-black text-sm px-6 py-3 rounded-lg transition-colors">
            Ir para Minha Conta
          </Link>
        </div>
      </div>
      <Footer /></>
    )
  }

  // ─── Erro ───────────────────────────────────────────────────────
  return (
    <><Header />
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X size={28} className="text-red-600" />
        </div>
        <h1 className="text-xl font-black text-gray-800 mb-2">Erro na confirmacao</h1>
        <p className="text-sm text-gray-600 mb-6">{mensagem}</p>
        <div className="flex flex-col gap-2">
          <Link href="/minha-conta"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-black text-sm px-6 py-3 rounded-lg transition-colors">
            Ir para o login
          </Link>
          <Link href="/esqueci-senha"
            className="text-sm text-green-600 hover:text-green-700 font-bold hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
