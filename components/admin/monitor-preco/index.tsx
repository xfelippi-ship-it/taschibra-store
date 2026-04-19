'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { RefreshCw, Bell, Zap } from 'lucide-react'
import PainelPrecos from './PainelPrecos'
import ConfigurarSKUs from './ConfigurarSKUs'
import CredenciaisAPI from './CredenciaisAPI'
import AlertasPreco from './AlertasPreco'
import RecomendacoesIA from './RecomendacoesIA'
import type { Snapshot, Competitor, Alerta, Credencial } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type { Snapshot, Competitor, Alerta, Credencial } from './types'
export { SOURCES, fmt } from './types'

type Aba = 'painel' | 'skus' | 'credenciais' | 'alertas' | 'ia'

const ABAS: { id: Aba; label: string; icon: string }[] = [
  { id: 'painel',      label: 'Painel',          icon: '📊' },
  { id: 'skus',        label: 'Configurar SKUs',  icon: '⚙️' },
  { id: 'credenciais', label: 'Credenciais de API', icon: '🔑' },
  { id: 'alertas',     label: 'Alertas',          icon: '🔔' },
  { id: 'ia',          label: 'Recomendações IA',   icon: '✨' },
]

export default function MonitoramentoPrecoTab() {
  const [aba, setAba] = useState<Aba>('painel')
  const [snapshots, setSnapshots]     = useState<Snapshot[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [alertas, setAlertas]         = useState<Alerta[]>([])
  const [credenciais, setCredenciais] = useState<Credencial[]>([])
  const [loading, setLoading]         = useState(true)
  const [msg, setMsg]                 = useState<string | null>(null)
  const [forcandoColeta, setForcandoColeta] = useState(false)

  const showMsg = useCallback((t: string) => {
    setMsg(t)
    setTimeout(() => setMsg(null), 3000)
  }, [])

  async function forcarColetaGeral() {
    if (!confirm('Disparar coleta imediata no N8n? Aguarde 1-2 minutos para ver os novos dados.')) return
    setForcandoColeta(true)
    try {
      const res = await fetch('/api/n8n/trigger-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: 'ALL', trigger: 'manual' })
      })
      const data = await res.json()
      if (data.ok) {
        showMsg('Coleta iniciada! Aguarde 1-2 minutos e clique em Atualizar tela.')
      } else {
        showMsg(data.error || 'Erro ao iniciar coleta')
      }
    } catch (e: any) {
      showMsg('Erro: ' + e.message)
    } finally {
      setForcandoColeta(false)
    }
  }

  const carregar = useCallback(async () => {
    setLoading(true)
    const [s, c, a, cr] = await Promise.all([
      supabase.from('market_price_snapshots' as any).select('*').order('captured_at', { ascending: false }).limit(1000),
      supabase.from('market_competitors' as any).select('*').order('sku'),
      supabase.from('market_alerts' as any).select('*').order('sku'),
      supabase.from('market_api_credentials' as any).select('*').order('label'),
    ])
    setSnapshots(s.data || [])
    setCompetitors(c.data || [])
    setAlertas(a.data || [])
    setCredenciais(cr.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="space-y-4">
      {msg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-lg animate-fade-in">
          {msg}
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          {ABAS.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                aba === a.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Sino de alertas com badge */}
          <button onClick={() => setAba('alertas')}
            title="Ver alertas configurados"
            className="relative flex items-center justify-center w-9 h-9 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Bell size={15} />
            {alertas.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {alertas.length}
              </span>
            )}
          </button>
          <button onClick={forcarColetaGeral} disabled={forcandoColeta}
            title="Dispara coleta imediata no N8n (usa creditos). Aguarde 1-2 minutos."
            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 border border-amber-200 bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 disabled:opacity-50">
            <Zap size={13} /> {forcandoColeta ? 'Disparando...' : 'Forçar coleta'}
          </button>
          <button onClick={carregar}
            title="Recarrega dados da tela. Coleta automatica do N8n roda 1x/dia."
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={13} /> Atualizar tela
          </button>
        </div>
      </div>

      {/* Conteúdo das abas */}
      {aba === 'painel'      && <PainelPrecos      snapshots={snapshots} competitors={competitors} credenciais={credenciais} loading={loading} />}
      {aba === 'skus'        && <ConfigurarSKUs    competitors={competitors} credenciais={credenciais} onUpdate={carregar} showMsg={showMsg} />}
      {aba === 'credenciais' && <CredenciaisAPI    credenciais={credenciais} onUpdate={carregar} showMsg={showMsg} />}
      {aba === 'alertas'     && <AlertasPreco      alertas={alertas} credenciais={credenciais} onUpdate={carregar} showMsg={showMsg} />}
      {aba === 'ia'          && <RecomendacoesIA   competitors={competitors} showMsg={showMsg} />}
    </div>
  )
}
