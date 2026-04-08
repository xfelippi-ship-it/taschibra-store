'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, User, Save } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DadosPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [clienteId, setClienteId] = useState('')

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_logado')
    if (!salvo) { router.push('/minha-conta'); return }
    const c = JSON.parse(salvo)
    setClienteId(c.id)
    carregarDados(c.id)
  }, [])

  async function carregarDados(id: string) {
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('name, email, phone')
      .eq('id', id)
      .single()
    if (data) {
      setNome(data.name || '')
      setEmail(data.email || '')
      setTelefone(data.phone || '')
    }
    setLoading(false)
  }

  async function salvar() {
    setSalvando(true)
    setErro('')
    setSucesso(false)
    try {
      const { error } = await supabase
        .from('customers')
        .update({ name: nome, phone: telefone, updated_at: new Date().toISOString() })
        .eq('id', clienteId)

      if (error) { setErro('Erro ao salvar. Tente novamente.'); return }

      // Atualiza localStorage
      const salvo = localStorage.getItem('cliente_logado')
      if (salvo) {
        const c = JSON.parse(salvo)
        localStorage.setItem('cliente_logado', JSON.stringify({ ...c, nome }))
      }
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <><Header />
    <div className="max-w-lg mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/minha-conta" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-800">Meus Dados</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-black text-gray-800">{nome || 'Minha Conta'}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>}
            {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">✅ Dados salvos com sucesso!</div>}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nome completo</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">E-mail</label>
              <input value={email} readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-400 outline-none" />
              <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Telefone / WhatsApp</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(47) 99999-9999"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500" />
            </div>
            <button onClick={salvar} disabled={salvando || !nome}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}
      </div>
    </div>
    <Footer /></>
  )
}
