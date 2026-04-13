import { Suspense } from 'react'
import Header from '@/components/store/Header'
import HeroBanner from '@/components/store/HeroBanner'
import TrustBar from '@/components/store/TrustBar'
import PromoBanner from '@/components/store/PromoBanner'
import Footer from '@/components/store/Footer'
import ProductGrid from '@/components/store/ProductGrid'
import dynamic from 'next/dynamic'
const PopupPromo = dynamic(() => import('@/components/store/PopupPromo'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Header />
      <HeroBanner />
      <TrustBar />
      <Suspense fallback={<div className="h-96" />}>
        <ProductGrid title="Lançamentos" categorySlug="lancamentos" limit={8} />
      </Suspense>
      <PromoBanner />
      <Suspense fallback={<div className="h-96" />}>
        <ProductGrid title="Mais Vendidos" categorySlug="outlet" limit={8} />
      </Suspense>
      <PopupPromo />
      <Footer />
    </main>
  )
}
