// Fonte única de verdade para canais de monitoramento
// IMPORTANTE: este arquivo NÃO importa nada de componentes React

export const CANAIS = {
  mercadolivre: { id: 'mercadolivre', label: 'Mercado Livre', tipo: 'api',  cor: 'bg-yellow-100 text-yellow-800' },
  shopee:       { id: 'shopee',       label: 'Shopee',        tipo: 'api',  cor: 'bg-orange-100 text-orange-800' },
  amazon:       { id: 'amazon',       label: 'Amazon',        tipo: 'api',  cor: 'bg-blue-100 text-blue-800'    },
  magalu:       { id: 'magalu',       label: 'Magalu',        tipo: 'api',  cor: 'bg-blue-100 text-blue-700'    },
  apify:        { id: 'apify',        label: 'Apify (Scraping)', tipo: 'service', cor: 'bg-purple-100 text-purple-800' },
  anthropic:    { id: 'anthropic',    label: 'Claude IA',     tipo: 'service', cor: 'bg-emerald-100 text-emerald-800' },
  site:         { id: 'site',         label: 'Site Customizado', tipo: 'site', cor: 'bg-gray-100 text-gray-700' },
} as const

export const CANAIS_LIST = Object.values(CANAIS)

export type CanalId = keyof typeof CANAIS

// Instruções de configuração por canal (exibidas no backoffice)
export const INSTRUCOES = {
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
      'Acesse apify.com e assine o plano Starter ($49/mês)',
      'Vá em Settings → Integrations → API tokens',
      'Crie um novo token e copie',
      'Cole abaixo e salve',
    ],
    avisos: [
      '✅ Vantagem: a Apify mantém os scrapers atualizados — você não faz manutenção',
      '✅ Permite monitorar Havan, Leroy Merlin, Magazine Luiza site, e qualquer outro site',
      '⚠️ Sem assinatura ativa, scraping de sites customizados não funciona — APIs marketplaces continuam normais',
      '💡 Pode ativar/desativar a qualquer momento sem afetar o resto do sistema',
    ],
    link: 'https://apify.com/pricing',
  },
  anthropic: {
    titulo: 'Como configurar Anthropic Claude (IA)',
    custo: 'Pago por uso — consulte console.anthropic.com',
    passos: [
      'Acesse console.anthropic.com e crie uma conta',
      'Vá em Settings → API Keys → Create Key',
      'Copie a chave (começa com sk-ant-...)',
      'Cole abaixo e salve',
    ],
    avisos: [
      '✅ Habilita o módulo "Recomendações IA" — Claude analisa preços e sugere ações',
      '✅ Cobrança por uso — só paga quando gerar análise',
      '⚠️ Sem chave, módulo de Recomendações IA fica desabilitado mas o resto funciona normal',
    ],
    link: 'https://console.anthropic.com',
  },
  site: {
    titulo: 'Como configurar Site Customizado',
    custo: 'Recomendado: usar via Apify',
    passos: [
      'Configure a URL de busca do site (ex: https://www.havan.com.br/busca?q={TERMO})',
      'Use {TERMO} como placeholder para o nome do produto',
      'Recomendado: assinar Apify para scraping confiável',
    ],
    avisos: [
      '⚠️ Scraping próprio sem Apify quebra com frequência (sites mudam HTML)',
      '✅ Com Apify configurado, scraping é gerenciado pela equipe deles',
    ],
    link: '',
  },
} as const

// Modo demo — quando não tem API configurada, retorna dados mockados
export const MODO_DEMO = {
  enabled: true, // Pode ser desligado quando todas APIs estiverem configuradas
  label: '🧪 Modo Demonstração — dados simulados',
}

export function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}
