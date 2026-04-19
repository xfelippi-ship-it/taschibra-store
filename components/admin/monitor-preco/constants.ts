// Fonte única de verdade para todos os serviços
// IMPORTANTE: este arquivo NÃO importa nada de componentes React
// Arquitetura: 3 categorias separadas
//   1. CANAIS (onde os preços são coletados: marketplaces + sites)
//   2. COLETORES (serviços que buscam dados: Apify)
//   3. IAs (serviços que analisam: Anthropic, OpenAI, Gemini)

// ============ CANAIS (marketplaces oficiais) ============
export const CANAIS = {
  mercadolivre: { id: 'mercadolivre', label: 'Mercado Livre', cor: 'bg-yellow-100 text-yellow-800' },
  shopee:       { id: 'shopee',       label: 'Shopee',        cor: 'bg-orange-100 text-orange-800' },
  amazon:       { id: 'amazon',       label: 'Amazon',        cor: 'bg-blue-100 text-blue-800'    },
  magalu:       { id: 'magalu',       label: 'Magalu',        cor: 'bg-blue-100 text-blue-700'    },
} as const

export const CANAIS_LIST = Object.values(CANAIS)
export type CanalId = keyof typeof CANAIS

// ============ COLETORES (serviços externos que coletam preços) ============
export const COLETORES = {
  apify: { id: 'apify', label: 'Apify (Scraping de Sites)', cor: 'bg-purple-100 text-purple-800' },
} as const

export const COLETORES_LIST = Object.values(COLETORES)

// ============ IAs (serviços de análise inteligente) ============
export const IAS = {
  anthropic: { id: 'anthropic', label: 'Claude (Anthropic)', cor: 'bg-emerald-100 text-emerald-800' },
  openai:    { id: 'openai',    label: 'GPT (OpenAI)',        cor: 'bg-teal-100 text-teal-800'      },
  gemini:    { id: 'gemini',    label: 'Gemini (Google)',     cor: 'bg-indigo-100 text-indigo-800'   },
} as const

export const IAS_LIST = Object.values(IAS)
export type IAId = keyof typeof IAS

// ============ INSTRUÇÕES DE CONFIGURAÇÃO ============
export const INSTRUCOES: Record<string, {
  titulo: string
  custo: string
  passos: string[]
  avisos: string[]
  link: string
}> = {
  mercadolivre: {
    titulo: 'Como configurar Mercado Livre',
    custo: 'Gratuito (API oficial)',
    passos: [
      'Acesse developers.mercadolivre.com.br e faça login com a conta da Taschibra',
      'Crie um novo app em "Suas aplicações" → "Criar aplicação"',
      'Copie o App ID e Secret Key',
      'Cole nos campos abaixo e salve',
    ],
    avisos: [
      '⚠️ Quando o ML mudar a API, recebemos email com 6+ meses de antecedência',
      '✅ Manutenção mínima — geralmente 1 ajuste por ano',
    ],
    link: 'https://developers.mercadolivre.com.br',
  },
  amazon: {
    titulo: 'Como configurar Amazon',
    custo: 'Gratuito (API oficial)',
    passos: [
      'Acesse Seller Central da Taschibra → Configurações → Credenciais SP-API',
      'Solicite acesso à API SP-API se ainda não tiver',
      'Gere as chaves de acesso (Access Key + Secret Key)',
      'Cole nos campos abaixo e salve',
    ],
    avisos: [
      '⚠️ Aprovação SP-API pode levar 1-3 dias úteis na primeira vez',
    ],
    link: 'https://developer-docs.amazon.com/sp-api',
  },
  shopee: {
    titulo: 'Como configurar Shopee',
    custo: 'Gratuito (API oficial)',
    passos: [
      'Acesse Open Platform da Shopee (open.shopee.com.br)',
      'Crie um app → copie Partner ID e Partner Key',
      'Vincule à conta da Taschibra autorizando o app',
      'Cole as credenciais abaixo',
    ],
    avisos: [],
    link: 'https://open.shopee.com.br',
  },
  magalu: {
    titulo: 'Como configurar Magalu',
    custo: 'Gratuito (API oficial)',
    passos: [
      'Acesse o Portal de Parceiros Magalu',
      'Solicite credenciais de API ao gerente de conta da Taschibra',
      'Receba App ID e Secret por email',
      'Cole abaixo',
    ],
    avisos: [],
    link: 'https://parceiros.magazineluiza.com.br',
  },
  apify: {
    titulo: 'Como configurar Apify (Scraping de sites)',
    custo: 'Pago — consulte apify.com/pricing',
    passos: [
      'Assine um plano em apify.com (recomendado: Starter)',
      'Vá em Settings → Integrations → API tokens',
      'Crie um novo token e copie',
      'Cole abaixo e salve',
    ],
    avisos: [
      '✅ Vantagem: a Apify mantém os scrapers atualizados — você não faz manutenção',
      '✅ Permite monitorar Havan, Leroy, Magazine Luiza site, e qualquer outro',
      '⚠️ Sem assinatura ativa, scraping de sites customizados não funciona',
      '💡 APIs de marketplaces (ML/Amazon/etc.) continuam funcionando normalmente',
    ],
    link: 'https://apify.com/pricing',
  },
  anthropic: {
    titulo: 'Como configurar Anthropic Claude',
    custo: 'Pago por uso — consulte console.anthropic.com',
    passos: [
      'Acesse console.anthropic.com e crie uma conta',
      'Vá em Settings → API Keys → Create Key',
      'Copie a chave (começa com sk-ant-...)',
      'Cole abaixo e salve',
    ],
    avisos: [
      '✅ Habilita análise inteligente de preços e sugestões de ação',
      '✅ Cobrança por uso — só paga quando gerar análise',
      '💡 Você pode configurar múltiplas IAs e escolher qual usar em cada análise',
    ],
    link: 'https://console.anthropic.com',
  },
  openai: {
    titulo: 'Como configurar OpenAI GPT',
    custo: 'Pago por uso — consulte platform.openai.com',
    passos: [
      'Acesse platform.openai.com e crie uma conta',
      'Vá em API Keys → Create new secret key',
      'Copie a chave (começa com sk-...)',
      'Cole abaixo e salve',
    ],
    avisos: [
      '✅ Alternativa ao Claude — pode ser usada em paralelo',
      '✅ Cobrança por uso',
    ],
    link: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    titulo: 'Como configurar Google Gemini',
    custo: 'Tier gratuito disponível — consulte ai.google.dev',
    passos: [
      'Acesse ai.google.dev',
      'Clique em "Get API key" e crie uma chave',
      'Copie e cole abaixo',
    ],
    avisos: [
      '✅ Tem tier gratuito com limite de requisições',
      '✅ Alternativa ao Claude e GPT',
    ],
    link: 'https://ai.google.dev',
  },
}

// ============ Helper ============
export function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

// Helper para pegar label de qualquer serviço (canal, coletor ou IA)
export function labelServico(id: string): string {
  if (CANAIS[id as CanalId]) return CANAIS[id as CanalId].label
  if (COLETORES[id as keyof typeof COLETORES]) return COLETORES[id as keyof typeof COLETORES].label
  if (IAS[id as IAId]) return IAS[id as IAId].label
  return id
}
