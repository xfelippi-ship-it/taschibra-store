import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = Redis.fromEnv()

export const ratelimitGeral = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'taschibra_geral',
})

export const ratelimitPagamento = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  analytics: true,
  prefix: 'taschibra_pagamento',
})

export function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'
}

export async function checkRateLimit(
  req: NextRequest,
  tipo: 'geral' | 'pagamento' = 'geral'
): Promise<NextResponse | null> {
  const ip = getIP(req)
  const identifier = tipo + ':' + ip
  const rl = tipo === 'pagamento' ? ratelimitPagamento : ratelimitGeral
  const { success, limit, remaining, reset } = await rl.limit(identifier)

  console.log('RATE LIMIT:', { identifier, success, limit, remaining, reset })

  if (!success) {
    return NextResponse.json(
      {
        error: tipo === 'pagamento'
          ? 'Muitas tentativas de pagamento. Aguarde 1 minuto.'
          : 'Muitas requisicoes. Aguarde alguns instantes.',
        limit,
        remaining,
        reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    )
  }
  return null
}
