/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Pencil, Trash2, X, HelpCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type FAQ = { id?: string; question: string; answer: string; available: boolean; sort_order?: number }
const vazio: FAQ = { question: '', answer: '', available: true }

export default function FAQTab() {
  const [faqs, setFaqs]       = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editando, setEditando] = useState<FAQ>(vazio)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca]     = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase.from('faqs').select('*').order('sort_order').order('created_at')
    setFaqs(data || [])
    setLoading(false)
  }

  async function salvar() {
    if (!editando.question.trim()) return
    setSalvando(true)
    const dados = {
      question:   editando.question.trim(),
      answer:     editando.answer.trim(),
      available:  editando.available,
      updated_at: new Date().toISOString()
    }
    if (editando.id) {
      await supabase.from('faqs').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('faqs').insert({ ...dados, sort_order: faqs.length + 1 })
    }
    setSalvando(false)
    setModal(false)
    setEditando(vazio)
    carregar()
  }

  async function toggleDisponivel(faq: FAQ) {
    await supabase.from('faqs').update({ available: !faq.available }).eq('id', faq.id)
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta pergunta?')) return
    await supabase.from('faqs').delete().eq('id', id)
    carregar()
  }

  const faqsFiltrados = busca
    ? faqs.filter(f => f.question.toLowerCase().includes(busca.toLowerCase()) || f.answer.toLowerCase().includes(busca.toLowerCase()))
    : faqs

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-800">FAQ — Perguntas Frequentes</h1>
          <p className="text-xs text-gray-400 mt-0.5">{faqs.length} pergunta{faqs.length !== 1 ? 's' : ''} · {faqs.filter(f => f.available).length} disponível{faqs.filter(f => f.available).length !== 1 ? 'is' : ''} no site</p>
        </div>
        <button onClick={() => { setEditando(vazio); setModal(true) }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> Nova Pergunta
        </button>
      </div>

      <div className="mb-3">
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar pergunta ou resposta..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : faqsFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma pergunta cadastrada.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase w-10">Resp?</th>
                <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase">Pergunta</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase w-32">Disponível no site</th>
                <th className="text-center px-5 py-3 text-xs font-black text-gray-500 uppercase w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faqsFiltrados.map((f, i) => (
                <tr key={f.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.answer?.trim() ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {f.answer?.trim() ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm text-gray-800 line-clamp-2">{f.question}</p>
                    {f.answer && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{f.answer}</p>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleDisponivel(f)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${f.available ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${f.available ? 'translate-x-5' : ''}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setEditando(f); setModal(true) }} className="text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                      <button onClick={() => excluir(f.id!)} className="text-red-300 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-800">{editando.id ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
              <button onClick={() => { setModal(false); setEditando(vazio) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Pergunta *</label>
                <input value={editando.question} onChange={e => setEditando({ ...editando, question: e.target.value })}
                  placeholder="Ex: Como cancelar meu pedido?"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Resposta</label>
                <textarea value={editando.answer} onChange={e => setEditando({ ...editando, answer: e.target.value })}
                  rows={4} placeholder="Digite a resposta aqui..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-bold text-gray-700">Disponível no site</p>
                  <p className="text-xs text-gray-500">Visível para clientes na página de ajuda</p>
                </div>
                <button type="button" onClick={() => setEditando({ ...editando, available: !editando.available })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${editando.available ? 'bg-green-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editando.available ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setEditando(vazio) }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={salvando || !editando.question.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition-colors">
                {salvando ? 'Salvando...' : editando.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
