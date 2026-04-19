'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, ArrowRight } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Regra = { id: string; source_slug: string; target_slug: string; label: string; sort_order: number }
type Categoria = { slug: string; name: string }

export default function CompreJuntoTab() {
  const [regras, setRegras] = useState<Regra[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [label, setLabel] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function carregar() {
    setLoading(true)
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from('complement_rules').select('*').order('source_slug').order('sort_order'),
      supabase.from('categories').select('slug,name').order('name')
    ])
    setRegras(r || [])
    setCategorias(c || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar() {
    if (!source || !target) { showToast('Selecione as duas categorias'); return }
    if (source === target) { showToast('Categorias devem ser diferentes'); return }
    setSalvando(true)
    const maxOrder = regras.filter(r => r.source_slug === source).length
    const { error } = await supabase.from('complement_rules').insert({
      source_slug: source, target_slug: target,
      label: label || 'Complementa com', sort_order: maxOrder + 1
    })
    setSalvando(false)
    if (error) { showToast('Erro ao salvar'); return }
    showToast('Regra adicionada!')
    setSource(''); setTarget(''); setLabel('')
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover esta regra?')) return
    await supabase.from('complement_rules').delete().eq('id', id)
    showToast('Regra removida')
    carregar()
  }

  // Agrupar por source_slug
  const grupos: Record<string, Regra[]> = {}
  regras.forEach(r => { if (!grupos[r.source_slug]) grupos[r.source_slug] = []; grupos[r.source_slug].push(r) })

  const nomeCat = (slug: string) => categorias.find(c => c.slug === slug)?.name || slug

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Compre Junto</h2>
      <p className="text-sm text-gray-500 mb-6">Configure quais categorias aparecem como sugestão na página do produto</p>

      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">{toast}</div>
      )}

      {/* Instruções */}
      <details className="mb-5 bg-blue-50 border border-blue-100 rounded-xl">
        <summary className="cursor-pointer px-4 py-3 font-semibold text-blue-700 text-sm select-none">
          ℹ️ Como funciona
        </summary>
        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 space-y-1">
          <p>Na página de um produto, o sistema mostra produtos de categorias <strong>complementares</strong>.</p>
          <p>Exemplo: quem vê um <strong>Trilho Magnético</strong> também pode se interessar por <strong>Lâmpadas Smart</strong>.</p>
          <p className="text-xs text-gray-400 mt-2">Cada categoria pode ter até 2 complementos. O primeiro produto ativo de cada categoria complementar é exibido.</p>
        </div>
      </details>

      {/* Formulário de nova regra */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Nova regra</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoria origem</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500">
              <option value="">Selecione...</option>
              {categorias.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoria complemento</label>
            <select value={target} onChange={e => setTarget(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500">
              <option value="">Selecione...</option>
              {categorias.filter(c => c.slug !== source).map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Label (opcional)</label>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder="Ex: Leve também"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
          </div>
        </div>
        <button onClick={adicionar} disabled={salvando || !source || !target}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50">
          <Plus size={14} /> {salvando ? 'Salvando...' : 'Adicionar regra'}
        </button>
      </div>

      {/* Lista de regras */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
      ) : Object.keys(grupos).length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">Nenhuma regra configurada ainda.</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grupos).map(([src, items]) => (
            <div key={src} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{nomeCat(src)}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{nomeCat(r.source_slug)}</span>
                      <ArrowRight size={14} className="text-gray-300" />
                      <span className="font-medium text-gray-800">{nomeCat(r.target_slug)}</span>
                      {r.label && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.label}</span>}
                    </div>
                    <button onClick={() => remover(r.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
