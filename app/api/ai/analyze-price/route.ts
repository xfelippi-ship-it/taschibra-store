import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { sku } = await req.json()
    if (!sku) return NextResponse.json({ error: 'SKU obrigatorio' }, { status: 400 })

    // Buscar credencial do Anthropic no banco
    const { data: cred } = await supabase
      .from('market_api_credentials')
      .select('app_id')
      .eq('canal', 'anthropic')
      .eq('ativo', true)
      .single()

    const apiKey = cred?.app_id || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        error: 'Anthropic API key nao configurada. Va em Credenciais de API > Claude IA',
        modo_demo: true,
        analysis: 'Análise não disponível — configure a API Key da Anthropic em Credenciais de API.',
        recommendation: 'Pendente de configuração'
      }, { status: 200 })
    }

    // Buscar dados do SKU
    const { data: comp } = await supabase
      .from('market_competitors')
      .select('*')
      .eq('sku', sku)
      .single()

    const { data: snapshots } = await supabase
      .from('market_price_snapshots')
      .select('*')
      .eq('sku', sku)
      .order('captured_at', { ascending: false })
      .limit(50)

    if (!snapshots?.length) {
      return NextResponse.json({
        error: 'Sem dados de preço para este SKU. Aguarde a próxima execução do N8n.'
      }, { status: 400 })
    }

    const precos = snapshots.map(s => s.price).filter(p => p > 0)
    const min = Math.min(...precos)
    const max = Math.max(...precos)
    const avg = precos.reduce((a, b) => a + b, 0) / precos.length
    const mapPrice = comp?.map_price

    const prompt = `Voce e um especialista em pricing de e-commerce e analise de mercado para a Taschibra (industria de iluminacao).
Analise os dados de preco do SKU ${sku} (${comp?.product_name || 'produto'}) e forneca recomendacoes acionaveis.

Dados:
- Preco MAP (minimo autorizado): R$ ${mapPrice?.toFixed(2) || 'nao definido'}
- Menor preco no mercado: R$ ${min.toFixed(2)}
- Maior preco no mercado: R$ ${max.toFixed(2)}
- Preco medio: R$ ${avg.toFixed(2)}
- Total de registros: ${snapshots.length}
- Canais monitorados: ${[...new Set(snapshots.map(s => s.source))].join(', ')}

Responda em PORTUGUES, formato direto e acionavel:
1. Analise da situacao (1-2 frases)
2. Violacao de MAP detectada? (sim/nao + detalhes)
3. Recomendacoes praticas (3 acoes concretas)
4. Risco de marca (baixo/medio/alto)`

    // Chamar Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Erro Claude API: ${response.status} - ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const analysis = data.content?.[0]?.text || 'Sem resposta'

    // Salvar análise no banco
    const { data: salvo } = await supabase.from('market_ai_analyses').insert({
      sku,
      product_name: comp?.product_name || sku,
      prompt: prompt.slice(0, 500),
      analysis,
      ai_model: 'claude-sonnet-4',
      custo_estimado: 0.03 // ~3 centavos por análise
    }).select().single()

    return NextResponse.json({
      ok: true,
      analysis,
      id: salvo?.id,
      sku
    })

  } catch (e: any) {
    console.error('Erro AI analyze:', e)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
