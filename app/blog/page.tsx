import { createClient } from '@supabase/supabase-js'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, author, category, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <>
      <Header />
      <div className="bg-gray-50 border-b border-gray-200 py-2.5 px-6">
        <div className="max-w-7xl mx-auto text-xs text-gray-500">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-semibold">Blog</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Blog Taschibra</h1>
        <p className="text-gray-500 mb-8">Guias, dicas e novidades sobre iluminação LED.</p>
        {!posts || posts.length === 0 ? (
          <p className="text-gray-400 text-center py-16">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} href={'/blog/' + post.slug}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-green-400 transition-all group">
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {post.cover_image
                    ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">📝</div>}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{post.category}</span>
                    {post.published_at && (
                      <span className="text-xs text-gray-400">{new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-gray-800 leading-tight mb-2 group-hover:text-green-700 transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>}
                  <p className="text-xs text-gray-400 mt-3">Por {post.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
