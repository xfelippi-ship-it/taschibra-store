'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Sparkles, RefreshCw, AlertCircle, Brain, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { Competitor } from './types'
import { IAS_LIST } from './constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  competitors: Competitor[]
  showMsg: (t: string) => void
}

type Analise = {
  id: string
  sku: string
  product_name: string
  analysis: string
  ai_model: string
  custo_estimado: number
  created_at: string
}

export default function RecomendacoesIA({ competitors, showMsg }: Props) {
  const [skuSelecionado, setSkuSelecionado] = useState('')
  const [iaSelecionada, setIaSelecionada] = useState('anthropic')
  const [iasDisponiveis, setIasDisponiveis] = useState<string[]>([])
  const [erroSemDados, setErroSemDados] = useState(false)
  const [forcandoColeta, setForcandoColeta] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [analises, setAnalises] = useState<Analise[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [apiConfigurada, setApiConfigurada] = useState<boolean | null>(null)

  async function carregar() {
    const { data } = await supabase.from('market_ai_analyses' as any)
      .select('*').order('created_at', { ascending: false }).limit(50)
    setAnalises((data || []) as Analise[])

    // Verificar quais IAs estao configuradas
    const { data: creds } = await supabase.from('market_api_credentials' as any)
      .select('canal').eq('tipo', 'ia').eq('ativo', true)
    const ids = (creds || []).map((c: any) => c.canal)
    setIasDisponiveis(ids)
    setApiConfigurada(ids.length > 0)
    if (ids.length > 0 && !ids.includes(iaSelecionada)) setIaSelecionada(ids[0])
  }

  useEffect(() => { carregar() }, [])

  async function forcarColeta() {
    if (!skuSelecionado) return
    setForcandoColeta(true)
    try {
      const res = await fetch('/api/n8n/trigger-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: skuSelecionado })
      })
      const data = await res.json()
      if (data.ok) {
        showMsg('Coleta iniciada! Aguarde 1-2 minutos.')
        setErroSemDados(false)
      } else {
        showMsg(data.error || 'Erro ao iniciar coleta')
      }
    } catch (e: any) {
      showMsg('Erro: ' + e.message)
    } finally {
      setForcandoColeta(false)
    }
  }

  async function gerarAnalise() {
    if (!skuSelecionado) { showMsg('Selecione um SKU'); return }
    setGerando(true)
    try {
      const res = await fetch('/api/ai/analyze-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: skuSelecionado, ia: iaSelecionada })
      })
      const data = await res.json()

      if (data.error && !data.modo_demo) {
        showMsg(data.error)
        if (data.error.includes('Sem dados de preço')) setErroSemDados(true)
      } else {
        setErroSemDados(false)
        showMsg(data.modo_demo ? 'Configure API Key da Anthropic' : 'Análise gerada com sucesso!')
        setExpandido(data.id)
        carregar()
      }
    } catch (e: any) {
      showMsg('Erro ao gerar análise: ' + e.message)
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
          <Sparkles size={16} className="text-green-500" />
          Análise inteligente de precificação com Claude AI
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          A IA analisa os dados de mercado, MAP e violações para sugerir ações comerciais.
        </p>
      </div>

      {/* Aviso se API não configurada */}
      {apiConfigurada === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">Nenhuma IA configurada</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Vá em <strong>Credenciais de API</strong> → seção <strong>IAs de Análise</strong> e configure pelo menos uma (Claude, GPT ou Gemini).
            </p>
          </div>
        </div>
      )}

      {/* Painel de geração */}
      <div className="bg-green-600 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-white/20 rounded-lg p-2">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-base font-black">Gerar Nova Análise</h3>
            <p className="text-xs text-green-100 mt-0.5">A IA analisa os dados de mercado e sugere o preço ideal</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs font-bold mb-1 block">Produto</label>
            <select value={skuSelecionado} onChange={e => setSkuSelecionado(e.target.value)}
              className="w-full text-sm border-0 rounded-lg px-3 py-2.5 text-gray-800 outline-none">
            <option value="">Escolha um SKU...</option>
            {competitors.map(c => (
              <option key={c.id} value={c.sku}>
                {c.sku} — {c.product_name || c.sku}
                {c.map_price && ` (MAP: R$ ${c.map_price.toFixed(2)})`}
              </option>
            ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block">IA</label>
            <select value={iaSelecionada} onChange={e => setIaSelecionada(e.target.value)}
              disabled={iasDisponiveis.length === 0}
              className="w-full text-sm border-0 rounded-lg px-3 py-2.5 text-gray-800 outline-none disabled:opacity-50">
              {iasDisponiveis.length === 0 ? (
                <option value="">Nenhuma</option>
              ) : (
                IAS_LIST.filter(i => iasDisponiveis.includes(i.id)).map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))
              )}
            </select>
          </div>
        </div>
        <button onClick={gerarAnalise} disabled={!skuSelecionado || gerando}
          className="bg-white text-green-700 font-black px-5 py-2.5 rounded-lg text-sm hover:bg-green-50 disabled:opacity-50 flex items-center gap-2">
          {gerando ? <><RefreshCw size={14} className="animate-spin" /> Analisando...</> : <><Sparkles size={14} /> Gerar Análise</>}
        </button>
      </div>

      {/* Aviso "sem dados" com botão de forçar coleta */}
      {erroSemDados && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">Sem dados de preço para este SKU</p>
            <p className="text-xs text-amber-700 mt-0.5">
              O N8n coleta dados 1x/dia automaticamente. Você pode forçar uma coleta agora.
            </p>
          </div>
          <button onClick={forcarColeta} disabled={forcandoColeta}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50">
            {forcandoColeta ? <><RefreshCw size={11} className="animate-spin" /> Coletando...</> : <><Zap size={11} /> Forçar coleta</>}
          </button>
        </div>
      )}

      {/* Lista de análises */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Análises Anteriores ({analises.length})</p>
          <button onClick={carregar} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RefreshCw size={11} /> Atualizar
          </button>
        </div>

        {analises.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl text-center py-12">
            <Brain size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">Nenhuma análise gerada ainda</p>
            <p className="text-xs text-gray-400 mt-1">Selecione um produto e clique em "Gerar Análise"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {analises.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setExpandido(expandido === a.id ? null : a.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left">
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        <span className="font-mono">{a.sku}</span> — {a.product_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleString('pt-BR')} · Custo: R$ {(a.custo_estimado * 5).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {expandido === a.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>
                {expandido === a.id && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{a.analysis}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
