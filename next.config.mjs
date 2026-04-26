/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Impede clickjacking — a página não pode ser embutida em iframes
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Impede que o browser adivinhe o tipo de conteúdo
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Controla informações de referência enviadas ao navegar
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Força HTTPS por 1 ano
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Restringe permissões do browser
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Proteção básica contra XSS (legado, mas ainda conta)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

const nextConfig = {
  async redirects() {
    return [
      { source: '/documentos/politica', destination: '/privacidade', permanent: true },
      { source: '/documentos/termos', destination: '/termos', permanent: true },
      { source: '/documentos/troca', destination: '/trocas-devolucoes', permanent: true },
      { source: '/documentos/seguranca', destination: '/seguranca', permanent: true },
      { source: '/empresa', destination: '/quem-somos', permanent: true },
      { source: '/perguntas-frequentes', destination: '/faq', permanent: true },
      { source: '/lancamentos', destination: '/produtos?categoria=lancamentos', permanent: true },
      { source: '/produtos/:categoria', destination: '/produtos?categoria=:categoria', permanent: true },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Aplica em todas as rotas
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
