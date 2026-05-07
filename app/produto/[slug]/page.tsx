import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import ProdutoClient from './ProdutoClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params

  // Validação server-side: produto existe?
  const supabase = await createSupabaseServerClient()
  const { data: produto } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (!produto) {
    notFound()
  }

  return <ProdutoClient slug={slug} />
}
