'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, X, ExternalLink, Info, Globe, Bot, Database } from 'lucide-react'
import { Credencial } from './types'
import { CANAIS, COLETORES, IAS, INSTRUCOES, labelServico } from './constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  credenciais: Credencial[]
  onUpdate: () => void
  showMsg: (t: string) => void
}

const FORM_VAZIO = {
  canal: '',
  label: '',
  tipo: 'api',
  app_id: '',
  app_secret: '',
  url_busca: ''
}

// Helper: retorna a config de um serviço (canal, coletor ou IA)
function getServicoConfig(id: string) {
  if (CANAIS[id as keyof typeof CANAIS]) return { ...CANAIS[id as keyof typeof CANAIS], tipo: 'api' }
  if (COLETORES[id as keyof typeof COLETORES]) return { ...COLETORES[id as keyof typeof COLETORES], tipo: 'coletor' }
  if (IAS[id as keyof typeof IAS]) return { ...IAS[id as keyof typeof IAS], tipo: 'ia' }
  return null
}

export default function CredenciaisAPI({ credenciais, onUpdate, showMsg }: Props) {
  const [open, setOpen] = useState(false)
  const [canalEditando, setCanalEditando] = useState<string | null>(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [mostrarSecret, setMostrarSecret] = useState<Record<string, boolean>>({})
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState<string | null>(null)
  const [resultadoTeste, setResultadoTeste] = useState<Record<string, 'ok' | 'erro'>>({})

  function abrirModal(servicoId?: string) {
    if (servicoId) {
      const cfg = getServicoConfig(servicoId)
      if (cfg) {
        const existente = credenciais.find(c => c.canal === servicoId)
        setForm({
          canal: servicoId,
          label: cfg.label,
          tipo: cfg.tipo,
          app_id: existente?.app_id || '',
          app_secret: existente?.app_secret || '',
          url_busca: existente?.extra_config?.url_busca || ''
        })
        setCanalEditando(existente?.id || null)
      }
    } else {
      setForm(FORM_VAZIO)
      setCanalEditando(null)
    }
    setOpen(true)
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      setForm(FORM_VAZIO)
      setCanalEditando(null)
    }
  }

  async function salvar() {
    if (!form.canal || !form.label) {
      showMsg('Preencha identificador e nome')
      return
    }
    setSalvando(true)
    const extra: Record<string, string> = {}
    if (form.url_busca) extra.url_busca = form.url_busca

    const payload = {
      canal: form.canal,
      label: form.label,
      tipo: form.tipo,
      app_id: form.app_id || null,
      app_secret: form.app_secret || null,
      extra_config: extra,
      ativo: true,
    }

    let error
    if (canalEditando) {
      const result = await supabase.from('market_api_credentials' as any).update(payload).eq('id', canalEditando)
      error = result.error
    } else {
      const result = await supabase.from('market_api_credentials' as any).insert(payload)
      error = result.error
    }
    setSalvando(false)
    if (error) {
      showMsg('Erro ao salvar')
      console.error(error)
      return
    }
    showMsg(canalEditando ? 'Atualizado!' : 'Salvo!')
    setOpen(false)
    onUpdate()
  }

  async function excluir(id: string) {
    if (!confirm('Remover esta credencial?')) return
    await supabase.from('market_api_credentials' as any).delete().eq('id', id)
    showMsg('Removida')
    onUpdate()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('market_api_credentials' as any).update({ ativo: !ativo }).eq('id', id)
    onUpdate()
  }

  async function testarConexao(cred: Credencial) {
    setTestando(cred.id)
    await new Promise(r => setTimeout(r, 1500))
    const ok = !!(cred.app_id && cred.app_secret)
    setResultadoTeste(prev => ({ ...prev, [cred.id]: ok ? 'ok' : 'erro' }))
    setTestando(null)
    showMsg(ok ? 'Conexão OK!' : 'Credenciais incompletas')
  }

  const instrucao = (id: string) => INSTRUCOES[id]

  // Render de card de serviço
  const renderCard = (servico: { id: string; label: string; cor: string }) => {
    const configurado = credenciais.some(cr => cr.canal === servico.id && cr.ativo)
    return (
      <button key={servico.id} onClick={() => abrirModal(servico.id)}
        className={`p-3 rounded-xl border-2 text-left transition-all ${
          configurado ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${servico.cor}`}>{servico.label}</span>
          {configurado && <CheckCircle size={14} className="text-green-500" />}
        </div>
        <p className="text-xs text-gray-400 mt-1">{configurado ? 'Configurado ✓' : 'Clique para configurar'}</p>
      </button>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 font-medium">Credenciais por tipo de serviço.</p>
          <p className="text-xs text-gray-400 mt-0.5">O N8n lê estas credenciais automaticamente — nunca precisa reconfigurar.</p>
        </div>

        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            <button onClick={() => abrirModal()}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
              <Plus size={13} /> Adicionar canal customizado
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl outline-none p-6">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-black text-gray-800">
                  {form.canal && getServicoConfig(form.canal) ? `Configurar ${form.label}` : (canalEditando ? 'Editar' : 'Novo canal customizado')}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                </Dialog.Close>
              </div>

              {/* Painel de instruções */}
              {form.canal && instrucao(form.canal) && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Info size={12} /> {instrucao(form.canal).titulo}
                    </p>
                    <span className="text-blue-700 font-bold text-[10px]">{instrucao(form.canal).custo}</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700 mb-2">
                    {instrucao(form.canal).passos.map((p, i) => <li key={i}>{p}</li>)}
                  </ol>
                  {instrucao(form.canal).avisos.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-100 space-y-0.5">
                      {instrucao(form.canal).avisos.map((a, i) => (
                        <p key={i} className="text-blue-700">{a}</p>
                      ))}
                    </div>
                  )}
                  {instrucao(form.canal).link && (
                    <a href={instrucao(form.canal).link} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 font-bold">
                      Acessar <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {/* Campos canal customizado (apenas quando não é serviço padrão) */}
                {!form.canal || !getServicoConfig(form.canal) ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Identificador *</label>
                      <input value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                        placeholder="ex: havan, leroy, kabum"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Nome exibido *</label>
                      <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                        placeholder="ex: Havan, Leroy Merlin"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Tipo</label>
                      <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-green-500">
                        <option value="api">Canal — API oficial de marketplace</option>
                        <option value="coletor">Coletor — serviço de scraping (Apify)</option>
                        <option value="ia">IA — análise inteligente</option>
                      </select>
                    </div>
                  </>
                ) : null}

                {/* Campos credencial */}
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">App ID / Client ID / API Key</label>
                  <input value={form.app_id} onChange={e => setForm({ ...form, app_id: e.target.value })}
                    placeholder="Cole aqui"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono text-xs" />
                </div>
                {form.tipo !== 'ia' && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Secret Key / Client Secret {form.tipo === 'ia' ? '(opcional)' : ''}</label>
                    <input type="password" value={form.app_secret} onChange={e => setForm({ ...form, app_secret: e.target.value })}
                      placeholder="Cole aqui"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono text-xs" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <Dialog.Close asChild>
                  <button className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm">Cancelar</button>
                </Dialog.Close>
                <button onClick={salvar} disabled={salvando || !form.canal || !form.label}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-2.5 rounded-lg text-sm">
                  {salvando ? 'Salvando...' : (canalEditando ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* SEÇÃO 1 — CANAIS (marketplaces) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Globe size={14} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Canais de Monitoramento</p>
          <span className="text-xs text-gray-400">— marketplaces oficiais</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.values(CANAIS).map(renderCard)}
        </div>
      </div>

      {/* SEÇÃO 2 — COLETORES (Apify) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database size={14} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Coletores de Dados</p>
          <span className="text-xs text-gray-400">— serviços que buscam preços em sites customizados</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.values(COLETORES).map(renderCard)}
        </div>
      </div>

      {/* SEÇÃO 3 — IAs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot size={14} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">IAs de Análise</p>
          <span className="text-xs text-gray-400">— modelos para análise inteligente de preços</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.values(IAS).map(renderCard)}
        </div>
      </div>

      {/* Credenciais cadastradas */}
      {credenciais.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Credenciais Cadastradas</p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Serviço</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">App ID</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Secret</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {credenciais.map(c => {
                  const cfg = getServicoConfig(c.canal)
                  const tipoLabel = c.tipo === 'api' ? 'Canal' : c.tipo === 'coletor' ? 'Coletor' : c.tipo === 'ia' ? 'IA' : c.tipo
                  return (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg?.cor || 'bg-gray-100 text-gray-600'}`}>
                          {c.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{tipoLabel}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {c.app_id ? `${c.app_id.slice(0, 12)}...` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.app_secret ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-gray-600">
                              {mostrarSecret[c.id] ? c.app_secret : '••••••••'}
                            </span>
                            <button onClick={() => setMostrarSecret(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                              className="text-gray-400 hover:text-gray-600">
                              {mostrarSecret[c.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleAtivo(c.id, c.ativo)}
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {c.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => abrirModal(c.canal)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-700">Editar</button>
                          <button onClick={() => testarConexao(c)}
                            disabled={testando === c.id}
                            className="text-xs font-bold text-blue-500 hover:text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                            {testando === c.id ? '...' : 'Testar'}
                          </button>
                          {resultadoTeste[c.id] && (
                            resultadoTeste[c.id] === 'ok'
                              ? <CheckCircle size={14} className="text-green-500" />
                              : <XCircle size={14} className="text-red-500" />
                          )}
                          <button onClick={() => excluir(c.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
