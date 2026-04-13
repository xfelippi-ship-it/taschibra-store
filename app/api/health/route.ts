import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function checkSupabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { count, error } = await supabase.from('products').select('id', { count: 'exact', head: true })
    if (error) return { status: 'erro', msg: error.message }
    return { status: 'online', msg: count + ' produtos' }
  } catch (e: any) { return { status: 'erro', msg: e.message } }
}

async function checkPagarMe() {
  try {
    const key = process.env.PAGARME_API_KEY
    if (!key) return { status: 'nao_configurado', msg: 'PAGARME_API_KEY ausente' }
    const res = await fetch('https://api.pagar.me/core/v5/orders?size=1', {
      headers: { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64') },
    })
    return res.ok
      ? { status: 'online', msg: 'API respondendo' }
      : { status: 'erro', msg: 'HTTP ' + res.status }
  } catch (e: any) { return { status: 'erro', msg: e.message } }
}

async function checkMelhorEnvio() {
  try {
    const token = process.env.MELHORENVIO_TOKEN
    if (!token) return { status: 'nao_configurado', msg: 'MELHORENVIO_TOKEN ausente' }
    const res = await fetch('https://melhorenvio.com.br/api/v2/me', {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
    })
    return res.ok
      ? { status: 'online', msg: 'API respondendo' }
      : { status: 'erro', msg: 'HTTP ' + res.status }
  } catch (e: any) { return { status: 'erro', msg: e.message } }
}

async function checkResend() {
  try {
    const key = process.env.RESEND_API_KEY
    if (!key) return { status: 'nao_configurado', msg: 'RESEND_API_KEY ausente' }
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: 'Bearer ' + key },
    })
    return res.ok
      ? { status: 'online', msg: 'API respondendo' }
      : { status: 'erro', msg: 'HTTP ' + res.status }
  } catch (e: any) { return { status: 'erro', msg: e.message } }
}

async function checkClearSales() {
  const token = process.env.CLEARSALE_TOKEN
  if (!token) return { status: 'nao_configurado', msg: 'CLEARSALE_TOKEN ausente' }
  return { status: 'configurado', msg: 'Token presente' }
}

async function checkSapiens() {
  const url = process.env.SENIOR_API_URL
  if (!url) return { status: 'nao_configurado', msg: 'SENIOR_API_URL ausente' }
  return { status: 'configurado', msg: 'URL presente' }
}

export async function GET() {
  const inicio = Date.now()

  const [supabaseR, pagarmeR, melhorenvioR, resendR, clearsalesR, sapiensR] = await Promise.all([
    checkSupabase(),
    checkPagarMe(),
    checkMelhorEnvio(),
    checkResend(),
    checkClearSales(),
    checkSapiens(),
  ])

  const servicos = {
    supabase: supabaseR, pagarme: pagarmeR, melhorenvio: melhorenvioR,
    resend: resendR, clearsales: clearsalesR, sapiens: sapiensR
  }
  const totalOnline = Object.values(servicos).filter(s => s.status === 'online' || s.status === 'configurado').length
  const totalErro = Object.values(servicos).filter(s => s.status === 'erro').length

  return NextResponse.json({
    status: totalErro > 0 ? 'degradado' : 'saudavel',
    timestamp: new Date().toISOString(),
    duracao_ms: Date.now() - inicio,
    resumo: { online: totalOnline, erro: totalErro },
    servicos,
  })
}
