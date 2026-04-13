import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BASE = 'https://taschibra-store.vercel.app'

export default async function sitemap() {
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('active', true)
    .order('updated_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')

  const staticPages = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: BASE + '/produtos', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: BASE + '/carrinho', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: BASE + '/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: BASE + '/privacidade', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: BASE + '/termos', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: BASE + '/quem-somos', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: BASE + '/trocas-devolucoes', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: BASE + '/seguranca', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const productPages = (products || []).map(p => ({
    url: BASE + '/produto/' + p.slug,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryPages = (categories || []).map(c => ({
    url: BASE + '/produtos?categoria=' + c.slug,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
