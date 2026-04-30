import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

let ratelimit: Ratelimit | null = null
let ratelimitPagamento: Ratelimit | null = null

function getRatelimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!ratelimit) {
    const redis = new Redis({ url, token })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'taschibra_rl',
    })
    ratelimitPagamento = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '60 s'),
      analytics: true,
      prefix: 'taschibra_pagamento',
    })
  }
  return { ratelimit, ratelimitPagamento }
}

const ROTAS_PAGAMENTO = ['/api/pagamento']
const ROTAS_CRITICAS = ['/api/cupom', '/api/frete', '/api/newsletter', '/api/contato']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'

  const limits = getRatelimit()
  if (!limits) return NextResponse.next()

  if (ROTAS_PAGAMENTO.some(r => pathname.startsWith(r))) {
    const { success, limit, reset, remaining } = await limits.ratelimitPagamento!.limit(ip)
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde alguns instantes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString(), 'X-RateLimit-Reset': reset.toString() } }
      )
    }
  }

  if (ROTAS_CRITICAS.some(r => pathname.startsWith(r))) {
    const { success, limit, reset, remaining } = await limits.ratelimit!.limit(ip)
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas requisicoes. Aguarde alguns instantes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString(), 'X-RateLimit-Reset': reset.toString() } }
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
