'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, X, ExternalLink, Info } from 'lucide-react'
import { Credencial } from './types'
import { CANAIS, CANAIS_LIST, INSTRUCOES, type CanalId } from './constants'

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

export default function CredenciaisAPI({ credenciais, onUpdate, showMsg }: Props) {
  const [open, setOpen] = useState(false)
  const [canalEditando, setCanalEditando] = useState<string | null>(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [mostrarSecret, setMostrarSecret] = useState<Record<string, boolean>>({})
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState<string | null>(null)
  const [resultadoTeste, setResultadoTeste] = useState<Record<string, 'ok' | 'erro'>>({})

  function abrirModal(canalId?: CanalId | 'custom') {
    if (canalId && canalId !== 'custom' && CANAIS[canalId]) {
      const canal = CANAIS[canalId]
      // Se já existe, pré-carrega
      const existente = credenciais.find(c => c.canal === canalId)
      setForm({
        canal: canalId,
        label: canal.label,
        tipo: canal.tipo,
        app_id: existente?.app_id || '',
        app_secret: existente?.app_secret || '',
        url_busca: existente?.extra_config?.url_busca || ''
      })
      setCanalEditando(existente?.id || null)
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
      showMsg('Preencha identificador e nome do canal')
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
      showMsg('Erro ao salvar credencial')
      console.error(error)
      return
    }
    showMsg(canalEditando ? 'Credencial atualizada!' : 'Credencial salva!')
    setOpen(false)
    setForm(FORM_VAZIO)
    setCanalEditando(null)
    onUpdate()
  }

  async function excluir(id: string) {
    if (!confirm('Remover esta credencial?')) return
    await supabase.from('market_api_credentials' as any).delete().eq('id', id)
    showMsg('Credencial removida')
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

  const canalInfo = (canalId: string) => CANAIS[canalId as CanalId]
  const instrucao = (canalId: string) => INSTRUCOES[canalId as CanalId]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 font-medium">Credenciais de API por canal de monitoramento.</p>
          <p className="text-xs text-gray-400 mt-0.5">O N8n lê estas credenciais automaticamente — nunca precisa ser reconfigurado.</p>
        </div>

        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            <button onClick={() => abrirModal('custom')}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
              <Plus size={13} /> Adicionar canal
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl outline-none p-6">

              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-black text-gray-800">
                  {form.canal && CANAIS[form.canal as CanalId] ? `Configurar ${form.label}` : (canalEditando ? 'Editar canal' : 'Novo canal')}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
                </Dialog.Close>
              </div>

              {/* Painel de instruções — só para canais conhecidos */}
              {form.canal && instrucao(form.canal) && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Info size={12} /> {instrucao(form.canal).titulo}
                    </p>
                    <span className="text-blue-700 font-bold">{instrucao(form.canal).custo}</span>
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
                {/* Campos para canal customizado */}
                {!form.canal || !CANAIS[form.canal as CanalId] ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Identificador *</label>
                      <input value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                        placeholder="ex: havan, leroy, americanas"
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
                        <option value="api">API oficial</option>
                        <option value="site">Scraping de site</option>
                        <option value="service">Serviço (Apify, Anthropic)</option>
                      </select>
                    </div>
                  </>
                ) : null}

                {/* Campos de credencial */}
                {form.tipo !== 'site' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">App ID / Client ID / API Key</label>
                      <input value={form.app_id} onChange={e => setForm({ ...form, app_id: e.target.value })}
                        placeholder="Cole aqui"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Secret Key / Client Secret</label>
                      <input type="password" value={form.app_secret} onChange={e => setForm({ ...form, app_secret: e.target.value })}
                        placeholder="Cole aqui"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono text-xs" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">URL de busca</label>
                    <input value={form.url_busca} onChange={e => setForm({ ...form, url_busca: e.target.value })}
                      placeholder="https://www.site.com.br/busca?q={TERMO}"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono text-xs" />
                    <p className="text-xs text-gray-400 mt-1">Use {'{TERMO}'} como placeholder para o termo de busca</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <Dialog.Close asChild>
                  <button className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm">Cancelar</button>
                </Dialog.Close>
                <button onClick={salvar} disabled={salvando || !form.canal || !form.label}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-2.5 rounded-lg text-sm">
                  {salvando ? 'Salvando...' : (canalEditando ? 'Atualizar' : 'Salvar credencial')}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Cards de canais padrão */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Canais disponíveis</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CANAIS_LIST.filter(c => c.id !== 'site').map(c => {
            const configurado = credenciais.some(cr => cr.canal === c.id && cr.ativo)
            return (
              <button key={c.id} onClick={() => abrirModal(c.id as CanalId)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  configurado ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.cor}`}>{c.label}</span>
                  {configurado && <CheckCircle size={14} className="text-green-500" />}
                </div>
                <p className="text-xs text-gray-400 mt-1">{configurado ? 'Configurado ✓' : 'Clique para configurar'}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de credenciais salvas */}
      {credenciais.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Credenciais cadastradas</p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Canal</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">App ID</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Secret</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-black text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {credenciais.map(c => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${canalInfo(c.canal)?.cor || 'bg-gray-100 text-gray-600'}`}>
                        {c.label}
                      </span>
                    </td>
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
                        <button onClick={() => abrirModal(c.canal as CanalId)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {credenciais.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Nenhuma credencial configurada. Clique nos canais acima ou em "Adicionar canal" para começar.
        </div>
      )}
    </div>
  )
}
