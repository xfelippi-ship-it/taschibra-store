'use client'
import { useState, useEffect } from 'react'
import { Building2, Save } from 'lucide-react'

const CAMPOS = [
  { key: 'empresa_razao_social',  label: 'Razão Social',    placeholder: 'Ex: Taschibra S.A.' },
  { key: 'empresa_nome_fantasia', label: 'Nome Fantasia',   placeholder: 'Ex: Taschibra Store' },
  { key: 'empresa_cnpj',         label: 'CNPJ',            placeholder: 'Ex: 83.174.274/0001-40' },
  { key: 'empresa_endereco',     label: 'Endereço',        placeholder: 'Rua, número' },
  { key: 'empresa_cidade',       label: 'Cidade',          placeholder: 'Ex: Indaial' },
  { key: 'empresa_estado',       label: 'Estado (UF)',     placeholder: 'Ex: SC' },
  { key: 'empresa_cep',          label: 'CEP',             placeholder: 'Ex: 89085-144' },
  { key: 'empresa_telefone',     label: 'Telefone',        placeholder: 'Ex: (47) 3397-9200' },
  { key: 'empresa_whatsapp',     label: 'WhatsApp',        placeholder: 'Ex: (47) 99149-3270' },
  { key: 'empresa_email',        label: 'E-mail',          placeholder: 'Ex: contato@taschibra.com.br' },
]

export default function DadosEmpresaTab() {
  const [valores, setValores] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const keys = CAMPOS.map(c => c.key)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/site_config?select=key,value&key=in.(' + keys.join(',') + ')'
      const res = await fetch(url, { headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', 'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') } })
      const data = await res.json()
    const map: Record<string, string> = {}
    for (const row of (data || [])) map[row.key] = row.value
    setValores(map)
    setLoading(false)
  }

  async function salvar() {
    setSalvando(true)
    const upserts = CAMPOS.map(c => ({ key: c.key, value: valores[c.key] || '' }))
    const res2 = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/site_config', {
        method: 'POST',
        headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', 'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''), 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(upserts)
      })
      const error = res2.ok ? null : 'erro'
    setSalvando(false)
    setMsg(error ? 'Erro ao salvar' : 'Dados salvos com sucesso!')
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Building2 size={22} className="text-green-600" />
          <h1 className="text-2xl font-black text-gray-800">Dados da Empresa</h1>
        </div>
        {msg && <span className={`text-sm font-bold ${msg.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Informações exibidas no rodapé do site, e-mails transacionais e documentos.
      </p>

      {loading ? (
        <div className="flex items-center gap-3 py-12 text-gray-400 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
          Carregando...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {CAMPOS.map(c => (
            <div key={c.key}>
              <label className="text-xs font-black text-gray-600 uppercase tracking-wide mb-1 block">
                {c.label}
              </label>
              <input
                value={valores[c.key] || ''}
                onChange={e => setValores(v => ({ ...v, [c.key]: e.target.value }))}
                placeholder={c.placeholder}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
              />
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              <Save size={15} />
              {salvando ? 'Salvando...' : 'Salvar Dados da Empresa'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
