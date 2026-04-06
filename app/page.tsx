import dynamic from 'next/dynamic'
import Header from '@/components/store/Header'
import HeroBanner from '@/components/store/HeroBanner'
import TrustBar from '@/components/store/TrustBar'
import PromoBanner from '@/components/store/PromoBanner'
import Footer from '@/components/store/Footer'

const ProductGrid = dynamic(() => import('@/components/store/ProductGrid'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Header />
      <HeroBanner />
      <TrustBar />
      <ProductGrid title="Lançamentos" />
      <PromoBanner />
      <ProductGrid title="Mais Vendidos" />
      <Footer />
    </main>
  )
}