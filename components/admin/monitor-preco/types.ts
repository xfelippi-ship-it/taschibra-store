export type Snapshot = {
  id: string; sku: string; source: string; price: number
  title?: string; url?: string; seller?: string
  condition?: string; listing_id?: string; captured_at: string
}
export type Competitor = {
  id: string; sku: string; product_name?: string
  source: string; search_term: string
  map_price?: number; notas?: string
}
export type Alerta = {
  id: string; sku: string; source?: string
  tipo: string; threshold: number
  email_notificar: string; ultimo_disparo?: string
}
export type Credencial = {
  id: string; canal: string; label: string
  app_id?: string; app_secret?: string
  extra_config?: Record<string, string>
  tipo: string; ativo: boolean; created_at: string
}

export const SOURCES = [
  { id: 'mercadolivre', label: 'Mercado Livre', cor: 'bg-yellow-100 text-yellow-800' },
  { id: 'shopee',       label: 'Shopee',        cor: 'bg-orange-100 text-orange-800' },
  { id: 'amazon',       label: 'Amazon',        cor: 'bg-blue-100 text-blue-800'    },
  { id: 'magalu',       label: 'Magalu',        cor: 'bg-blue-100 text-blue-700'    },
  { id: 'site',         label: 'Site/Scraping', cor: 'bg-gray-100 text-gray-700'    },
]

export function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}
