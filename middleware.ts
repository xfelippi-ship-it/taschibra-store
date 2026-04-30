import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 10 requests por 10 segundos por IP nas rotas criticas
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'taschibra_rl',
})

// 3 tentativas de pagamento por minuto por IP
const ratelimitPagamento = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  analytics: true,
  prefix: 'taschibra_pagamento',
})

const ROTAS_CRITICAS = [
  '/api/cupom',
  '/api/frete',
  '/api/newsletter',
  '/api/contato',
]

const ROTAS_PAGAMENTO = [
  '/api/pagamento',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'

  // Rate limit rotas de pagamento (mais restrito)
  if (ROTAS_PAGAMENTO.some(r => pathname.startsWith(r))) {
    const { success, limit, reset, remaining } = await ratelimitPagamento.limit(ip)
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde alguns instantes.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }
  }

  // Rate limit rotas criticas gerais
  if (ROTAS_CRITICAS.some(r => pathname.startsWith(r))) {
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas requisicoes. Aguarde alguns instantes.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/cupom/:path*',
    '/api/pagamento/:path*',
    '/api/frete/:path*',
    '/api/newsletter/:path*',
    '/api/contato/:path*',
  ],
}
