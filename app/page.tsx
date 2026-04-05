import Header from '@/components/store/Header'
import HeroBanner from '@/components/store/HeroBanner'
import TrustBar from '@/components/store/TrustBar'
import ProductGrid from '@/components/store/ProductGrid'
import PromoBanner from '@/components/store/PromoBanner'
import Footer from '@/components/store/Footer'

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
