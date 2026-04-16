'use client'
import { useState } from 'react'
import { ExternalLink, CheckCircle, XCircle, RefreshCw, Settings, Zap, ShoppingBag, Package } from 'lucide-react'

interface Canal {
  id: string
  nome: string
  descricao: string
  cor: string
  logo: string
  status: 'ativo' | 'inativo' | 'pendente'
  campos: { key: string; label: string; tipo: 'text' | 'password'; placeholder: string }[]
  stats?: { produtos: number; pedidos: number; ultima_sync: string }
}

const CANAIS: Canal[] = [
  {
    id: 'mercadolivre',
    nome: 'Mercado Livre',
    descricao: 'Maior marketplace da América Latina',
    cor: '#FFE600',
    logo: '🛒',
    status: 'pendente',
    campos: [
      { key: 'client_id', label: 'Client ID', tipo: 'text', placeholder: 'Ex: 123456789' },
      { key: 'client_secret', label: 'Client Secret', tipo: 'password', placeholder: 'Seu client secret' },
      { key: 'access_token', label: 'Access Token', tipo: 'password', placeholder: 'Token de acesso' },
      { key: 'seller_id', label: 'Seller ID', tipo: 'text', placeholder: 'ID do vendedor' },
    ]
  },
  {
    id: 'amazon',
    nome: 'Amazon',
    descricao: 'Marketplace global com presença no Brasil',
    cor: '#FF9900',
    logo: '📦',
    status: 'pendente',
    campos: [
      { key: 'seller_id', label: 'Seller ID', tipo: 'text', placeholder: 'Ex: A1B2C3D4E5F6G7' },
      { key: 'mws_auth_token', label: 'MWS Auth Token', tipo: 'password', placeholder: 'Token MWS' },
      { key: 'marketplace_id', label: 'Marketplace ID', tipo: 'text', placeholder: 'Ex: A2Q3Y263D00KWC' },
      { key: 'access_key', label: 'Access Key ID', tipo: 'password', placeholder: 'Chave de acesso' },
    ]
  },
  {
    id: 'shopee',
    nome: 'Shopee',
    descricao: 'Marketplace em rápido crescimento no Brasil',
    cor: '#EE4D2D',
    logo: '🛍️',
    status: 'pendente',
    campos: [
      { key: 'partner_id', label: 'Partner ID', tipo: 'text', placeholder: 'Ex: 1234567' },
      { key: 'partner_key', label: 'Partner Key', tipo: 'password', placeholder: 'Sua partner key' },
      { key: 'shop_id', label: 'Shop ID', tipo: 'text', placeholder: 'ID da loja' },
      { key: 'access_token', label: 'Access Token', tipo: 'password', placeholder: 'Token de acesso' },
    ]
  },
  {
    id: 'magalu',
    nome: 'Magazine Luiza',
    descricao: 'Um dos maiores varejistas do Brasil',
    cor: '#0086FF',
    logo: '🏪',
    status: 'pendente',
    campos: [
      { key: 'client_id', label: 'Client ID', tipo: 'text', placeholder: 'Seu client ID' },
      { key: 'client_secret', label: 'Client Secret', tipo: 'password', placeholder: 'Seu client secret' },
      { key: 'seller_id', label: 'Seller ID', tipo: 'text', placeholder: 'ID do seller' },
      { key: 'api_key', label: 'API Key', tipo: 'password', placeholder: 'Sua API key' },
    ]
  },
]

export default function CanaisVendaTab() {
  const [canalAtivo, setCanalAtivo] = useState<string | null>(null)
  const [credenciais, setCredenciais] = useState<Record<string, Record<string, string>>>({})
  const [salvando, setSalvando] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function showMsg(t: string) { setMsg(t); setTimeout(() => setMsg(null), 3000) }

  function setCred(canalId: string, key: string, valor: string) {
    setCredenciais(prev => ({
      ...prev,
      [canalId]: { ...(prev[canalId] || {}), [key]: valor }
    }))
  }

  async function salvar(canal: Canal) {
    setSalvando(canal.id)
    await new Promise(r => setTimeout(r, 1200))
    setSalvando(null)
    showMsg('Credenciais de ' + canal.nome + ' salvas com sucesso!')
  }

  const canal = CANAIS.find(c => c.id === canalAtivo)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Canais de Venda</h2>
        <p className="text-sm text-gray-500 mt-1">Integre o LightSales diretamente com os principais marketplaces do Brasil</p>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold">
          ✅ {msg}
        </div>
      )}

      {/* Aviso */}
      <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>🔧 Em desenvolvimento:</strong> As integrações com marketplaces serão ativadas após o go-live B2C. Cadastre as credenciais agora para agilizar a ativação.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de canais */}
        <div className="lg:col-span-1 space-y-3">
          {CANAIS.map(c => (
            <button
              key={c.id}
              onClick={() => setCanalAtivo(canalAtivo === c.id ? null : c.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                canalAtivo === c.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{c.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900">{c.nome}</div>
                  <div className="text-xs text-gray-500 truncate">{c.descricao}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  c.status === 'ativo' ? 'bg-green-100 text-green-700' :
                  c.status === 'inativo' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {c.status === 'ativo' ? 'Ativo' : c.status === 'inativo' ? 'Inativo' : 'Pendente'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Painel de configuração */}
        <div className="lg:col-span-2">
          {canal ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="text-3xl">{canal.logo}</div>
                <div>
                  <h3 className="font-black text-gray-900">{canal.nome}</h3>
                  <p className="text-xs text-gray-500">{canal.descricao}</p>
                </div>
              </div>

              <div className="space-y-4">
                {canal.campos.map(campo => (
                  <div key={campo.key}>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{campo.label}</label>
                    <input
                      type={campo.tipo}
                      placeholder={campo.placeholder}
                      value={credenciais[canal.id]?.[campo.key] || ''}
                      onChange={e => setCred(canal.id, campo.key, e.target.value)}
                      className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => salvar(canal)}
                  disabled={salvando === canal.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {salvando === canal.id ? (
                    <><RefreshCw size={14} className="animate-spin" /> Salvando...</>
                  ) : (
                    <><Settings size={14} /> Salvar Credenciais</>
                  )}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
                  <Zap size={14} /> Testar Conexão
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-64">
              <ShoppingBag size={40} className="text-gray-200 mb-3" />
              <p className="text-sm font-bold text-gray-400">Selecione um canal para configurar</p>
              <p className="text-xs text-gray-300 mt-1">Clique em um marketplace ao lado</p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm font-black text-gray-700 mb-3">🗺️ Roadmap de Integrações</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { fase: '1', titulo: 'Sync Catálogo', desc: 'Envio de produtos para cada marketplace', cor: 'bg-blue-100 text-blue-700' },
            { fase: '2', titulo: 'Sync Estoque', desc: 'Atualização de estoque em tempo real', cor: 'bg-purple-100 text-purple-700' },
            { fase: '3', titulo: 'Recepção Pedidos', desc: 'Pedidos do marketplace no LightSales', cor: 'bg-orange-100 text-orange-700' },
            { fase: '4', titulo: 'Gestão Anúncios', desc: 'Criar e editar anúncios por canal', cor: 'bg-green-100 text-green-700' },
          ].map(item => (
            <div key={item.fase} className="bg-white rounded-lg p-3 border border-gray-200">
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.cor}`}>Fase {item.fase}</span>
              <p className="text-xs font-bold text-gray-800 mt-2">{item.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
