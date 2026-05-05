'use client'
import { useState } from 'react'
import { X, Bell, Check } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  productId: string
  productName: string
  variantSku?: string
  variantLabel?: string
}

export default function AviseMeModal({ open, onClose, productId, productName, variantSku, variantLabel }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [erro, setErro] = useState('')

  if (!open) return null

  const prodLabel = variantLabel ? `${productName} — ${variantLabel}` : productName

  async function handleSubmit() {
    if (!nome.trim() || !email.trim()) { setErro('Nome e e-mail são obrigatórios.'); return }
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, variant_sku: variantSku, product_name: productName, variant_label: variantLabel, nome, email, whatsapp })
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setErro('Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setDone(false)
    setNome('')
    setEmail('')
    setWhatsapp('')
    setErro('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-sm">
        {!done ? (
          <>
            <div className="flex items-start justify-between mb-1">
              <p className="text-base font-bold text-gray-800">Avise-me quando disponível</p>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-0.5"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{prodLabel}</p>

            <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-4 flex items-center gap-3">
              <Bell size={16} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500">Você será notificado assim que o produto estiver disponível.</p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">WhatsApp <span className="text-gray-400">(opcional)</span></label>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(47) 99999-9999"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
            </div>

            {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Cadastrando...' : 'Cadastrar aviso'}
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-green-600" />
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">Cadastrado com sucesso</p>
            <p className="text-sm text-gray-500 mb-5">Te avisamos assim que <strong>{variantLabel || productName}</strong> estiver disponível.</p>
            <button onClick={handleClose} className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">Fechar</button>
          </div>
        )}
      </div>
    </div>
  )
}
