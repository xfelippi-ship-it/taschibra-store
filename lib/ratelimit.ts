import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _redis: Redis | null = null
let _ratelimit: Ratelimit | null = null
let _ratelimitPagamento: Ratelimit | null = null

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return _redis
}

export function getRatelimit() {
  const redis = getRedis()
  if (!redis) return null
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10 s'), analytics: true, prefix: 'taschibra_rl' })
  }
  return _ratelimit
}

export function getRatelimitPagamento() {
  const redis = getRedis()
  if (!redis) return null
  if (!_ratelimitPagamento) {
    _ratelimitPagamento = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '60 s'), analytics: true, prefix: 'taschibra_pagamento' })
  }
  return _ratelimitPagamento
}

export function getIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'
}

export async function checkRateLimit(req: Request, tipo: 'geral' | 'pagamento' = 'geral'): Promise<Response | null> {
  const rl = tipo === 'pagamento' ? getRatelimitPagamento() : getRatelimit()
  if (!rl) return null
  const ip = getIP(req)
  const { success } = await rl.limit(ip)
  if (!success) {
    return new Response(
      JSON.stringify({ error: tipo === 'pagamento' ? 'Muitas tentativas de pagamento. Aguarde 1 minuto.' : 'Muitas requisicoes. Aguarde alguns instantes.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return null
}
