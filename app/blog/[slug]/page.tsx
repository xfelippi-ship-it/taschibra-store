import { createClient } from '@supabase/supabase-js'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) return notFound()

  return (
    <>
      <Header />
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/blog" className="text-green-600 hover:underline">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold truncate">{post.title}</span>
        </div>
      </div>
      <article className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{post.category}</span>
          {post.published_at && (
            <span className="text-xs text-gray-400">{new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          )}
          <span className="text-xs text-gray-400">Por {post.author}</span>
        </div>
        <h1 className="text-3xl font-black text-gray-800 leading-tight mb-6">{post.title}</h1>
        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-8 border border-gray-200">
            <img src={post.cover_image} alt={post.title} className="w-full h-auto" />
          </div>
        )}
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
          {post.content?.split('\n').map((paragraph: string, i: number) => {
            if (paragraph.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-gray-800 mt-8 mb-3">{paragraph.replace('## ', '')}</h2>
            if (paragraph.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-2">{paragraph.replace('### ', '')}</h3>
            if (paragraph.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{paragraph.replace('- ', '')}</li>
            if (paragraph.trim() === '') return <br key={i} />
            return <p key={i} className="mb-4">{paragraph}</p>
          })}
        </div>
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link href="/blog" className="text-green-600 font-bold hover:underline">← Voltar para o blog</Link>
        </div>
      </article>
      <Footer />
    </>
  )
}
