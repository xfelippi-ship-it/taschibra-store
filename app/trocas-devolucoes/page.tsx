import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata() {
  const { data } = await supabase.from('seo_pages').select('titulo,descricao').eq('rota', '/trocas-devolucoes').single()
  return {
    title: data?.titulo || 'Trocas e Devoluções — Taschibra Store',
    description: data?.descricao || '',
  }
}

export default async function TrocasPage() {
  const { data } = await supabase.from('cms_pages').select('titulo,conteudo').eq('slug', 'trocas-devolucoes').eq('publicado', true).single()
  if (!data) notFound()
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-8">{data.titulo}</h1>
      <div className="prose prose-lg max-w-none text-gray-700
        [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3
        [&>p]:mb-4 [&>p]:leading-relaxed
        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
        [&>li]:mb-1 [&>strong]:font-black [&>strong]:text-gray-900"
        dangerouslySetInnerHTML={{ __html: data.conteudo }} />
    </main>
  )
}
