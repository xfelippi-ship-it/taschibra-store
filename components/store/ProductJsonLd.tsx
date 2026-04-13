'use client'

type Props = {
  name: string
  description?: string
  price: number
  promoPrice?: number
  image?: string
  sku?: string
  ean?: string
  brand?: string
  slug: string
  inStock?: boolean
}

export default function ProductJsonLd({
  name, description, price, promoPrice, image, sku, ean, brand, slug, inStock = true
}: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description || name,
    image: image || 'https://taschibra-store.vercel.app/images/logo.png',
    sku: sku || slug,
    gtin13: ean || undefined,
    brand: { '@type': 'Brand', name: brand || 'Taschibra' },
    url: 'https://taschibra-store.vercel.app/produto/' + slug,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: (promoPrice && promoPrice > 0 ? promoPrice : price).toFixed(2),
      ...(promoPrice && promoPrice > 0 && promoPrice < price ? { priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) } : {}),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Taschibra Store' },
      url: 'https://taschibra-store.vercel.app/produto/' + slug,
    },
    manufacturer: { '@type': 'Organization', name: 'Taschibra' },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
