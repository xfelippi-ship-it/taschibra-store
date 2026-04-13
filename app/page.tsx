import { Suspense } from 'react'
import Header from '@/components/store/Header'
import HeroBanner from '@/components/store/HeroBanner'
import TrustBar from '@/components/store/TrustBar'
import Footer from '@/components/store/Footer'
import ProductGrid from '@/components/store/ProductGrid'

export default function Home() {
  return (
    <main>
      <Header />
      <HeroBanner />
      <TrustBar />
      <Suspense fallback={<div className="h-96" />}>
        <ProductGrid title="Lançamentos" categorySlug="lancamentos" limit={8} />
      </Suspense>
      <Footer />
    </main>
  )
}
