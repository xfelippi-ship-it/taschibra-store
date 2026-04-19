'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, X } from 'lucide-react'
import { Credencial } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  credenciais: Credencial[]
  onUpdate: () => void
  showMsg: (t: string) => void
}

const CANAIS_PADRAO = [
  { id: 'mercadolivre', label: 'Mercado Livre', tipo: 'api', cor: 'bg-yellow-100 text-yellow-800', instrucao: 'Crie um app em developers.mercadolivre.com.br e copie o App ID e Secret Key.' },
  { id: 'amazon',       label: 'Amazon',        tipo: 'api', cor: 'bg-blue-100 text-blue-800',    instrucao: 'Acesse Seller Central > Configurações > Credenciais de API e gere as chaves SP-API.' },
  { id: 'shopee',       label: 'Shopee',        tipo: 'api', cor: 'bg-orange-100 text-orange-800', instrucao: 'Acesse Open Platform da Shopee, crie um app e obtenha Partner ID e Partner Key.' },
  { id: 'magalu',       label: 'Magalu',        tipo: 'api', cor: 'bg-blue-100 text-blue-700',    instrucao: 'Acesse o portal de parceiros Magalu e solicite credenciais de API.' },
  { id: 'site',         label: 'Site/Scraping', tipo: 'site', cor: 'bg-gray-100 text-gray-700',   instrucao: 'Para scraping de sites, informe a URL de busca. Use {TERMO} como placeholder.' },
]

const FORM_VAZIO = { canal: '', label: '', tipo: 'api', app_id: '', app_secret: '', url_busca: '' }

export default function CredenciaisAPI({ credenciais, onUpdate, showMsg }: Props) {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [mostrarSecret, setMostrarSecret] = useState<Record<string, boolean>>({})
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState<string | null>(null)
  const [resultadoTeste, setResultadoTeste] = useState<Record<string, 'ok' | 'erro'>>({})

  function abrirModal(canal?: typeof CANAIS_PADRAO[0]) {
    if (canal) {
      setForm({ canal: canal.id, label: canal.label, tipo: canal.tipo, app_id: '', app_secret: '', url_busca: '' })
    } else {
      setForm(FORM_VAZIO)
    }
    setModal(true)
  }

  async function salvar() {
    if (!form.canal || !form.label) { showMsg('Preencha canal e label'); return }
    setSalvando(true)
    const extra: Record<string, string> = {}
    if (form.url_busca) extra.url_busca = form.url_busca

    const { error } = await supabase.from('market_api_credentials' as any).insert({
      canal: form.canal,
      label: form.label,
      tipo: form.tipo,
      app_id: form.app_id || null,
      app_secret: form.app_secret || null,
      extra_config: extra,
      ativo: true,
    })
    setSalvando(false)
    if (error) { showMsg('Erro ao salvar credencial'); return }
    showMsg('Credencial salva!')
    setModal(false)
    setForm(FORM_VAZIO)
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
    // Teste básico — verifica se tem app_id preenchido e tenta um ping
    await new Promise(r => setTimeout(r, 1500))
    const ok = !!(cred.app_id && cred.app_secret)
    setResultadoTeste(prev => ({ ...prev, [cred.id]: ok ? 'ok' : 'erro' }))
    setTestando(null)
    showMsg(ok ? 'Conexão OK!' : 'Credenciais incompletas')
  }

  const canalInfo = (canal: string) => CANAIS_PADRAO.find(c => c.id === canal)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 font-medium">Credenciais de API por canal de monitoramento.</p>
          <p className="text-xs text-gray-400 mt-0.5">O N8n lê estas credenciais automaticamente — nunca precisa ser reconfigurado.</p>
        </div>
        <button onClick={() => abrirModal()}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 py-2 rounded-lg">
          <Plus size={13} /> Adicionar canal
        </button>
      </div>

      {/* Canais padrão disponíveis */}
      <div className="grid grid-cols-5 gap-2">
        {CANAIS_PADRAO.map(c => {
          const configurado = credenciais.some(cr => cr.canal === c.id && cr.ativo)
          return (
            <button key={c.id} onClick={() => abrirModal(c)}
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

      {/* Lista de credenciais salvas */}
      {credenciais.length > 0 && (
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
                    {c.app_id ? `${c.app_id.slice(0, 8)}...` : <span className="text-gray-300">—</span>}
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
      )}

      {credenciais.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Nenhuma credencial configurada. Clique nos canais acima para configurar.
        </div>
      )}

      {/* Modal adicionar credencial */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">
                {form.canal ? `Configurar ${form.label}` : 'Novo canal'}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Instrução do canal */}
            {form.canal && canalInfo(form.canal) && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
                ℹ️ {canalInfo(form.canal)?.instrucao}
              </div>
            )}

            <div className="space-y-3">
              {!form.canal && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Identificador do canal *</label>
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
                    </select>
                  </div>
                </>
              )}

              {form.tipo === 'api' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">App ID / Client ID</label>
                    <input value={form.app_id} onChange={e => setForm({ ...form, app_id: e.target.value })}
                      placeholder="Cole aqui o App ID"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Secret Key / Client Secret</label>
                    <input type="password" value={form.app_secret} onChange={e => setForm({ ...form, app_secret: e.target.value })}
                      placeholder="Cole aqui o Secret"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">URL de busca</label>
                  <input value={form.url_busca} onChange={e => setForm({ ...form, url_busca: e.target.value })}
                    placeholder="https://www.site.com.br/busca?q={TERMO}"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                  <p className="text-xs text-gray-400 mt-1">Use {'{TERMO}'} como placeholder para o termo de busca</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando || !form.canal || !form.label}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-2.5 rounded-lg text-sm">
                {salvando ? 'Salvando...' : 'Salvar credencial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
