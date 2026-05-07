import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateSEO } from '@/lib/seo'
import ProdutoClient from './ProdutoClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

const SITE_URL = 'https://taschibra-store.vercel.app'

/**
 * Busca os dados do produto necessários para validação + metadata.
 * Centralizado em uma função para evitar fetch duplicado.
 */
async function fetchProdutoMeta(slug: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, description, main_image, seo_auto, seo_title, seo_description, voltage, power_w, color_temp_k, ip_rating, category_slug, family')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

/**
 * Gera os metadados HTML server-side para SEO e compartilhamento.
 * Respeita o toggle seo_auto: se ON usa template, se OFF usa campos manuais.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const produto = await fetchProdutoMeta(slug)

  if (!produto) {
    return { title: 'Produto não encontrado | Taschibra' }
  }

  // Se SEO automático: usa generateSEO. Se manual: usa campos do banco.
  const isAuto = produto.seo_auto ?? true
  const auto = generateSEO(produto)
  const title = isAuto ? auto.title : (produto.seo_title || auto.title)
  const description = isAuto ? auto.description : (produto.seo_description || auto.description)
  const url = `${SITE_URL}/produto/${slug}`
  const image = produto.main_image || `${SITE_URL}/images/logo.png`

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Taschibra Store',
      images: [{ url: image, width: 1200, height: 1200, alt: produto.name }],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params
  const produto = await fetchProdutoMeta(slug)

  if (!produto) {
    notFound()
  }

  return <ProdutoClient slug={slug} />
}
