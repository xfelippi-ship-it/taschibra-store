import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Webhook do N8n Cloud — configurar via env var N8N_WEBHOOK_URL
// Formato: https://{conta}.app.n8n.cloud/webhook/{id}
export async function POST(req: NextRequest) {
  try {
    const { sku } = await req.json()
    if (!sku) return NextResponse.json({ error: 'SKU obrigatorio' }, { status: 400 })

    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json({
        ok: false,
        error: 'N8n webhook nao configurado. Configure N8N_WEBHOOK_URL no Vercel e crie um Webhook Trigger no workflow do N8n.',
        help: 'Veja /docs/n8n-setup.md para instrucoes'
      }, { status: 200 })
    }

    // Dispara o webhook do N8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, trigger: 'manual', timestamp: new Date().toISOString() })
    })

    if (!response.ok) {
      return NextResponse.json({
        ok: false,
        error: `N8n retornou erro ${response.status}`
      }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Coleta iniciada no N8n',
      sku
    })

  } catch (e: any) {
    console.error('Erro trigger N8n:', e)
    return NextResponse.json({ ok: false, error: e.message || 'Erro interno' }, { status: 500 })
  }
}
