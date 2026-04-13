import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/minha-conta/'],
      },
    ],
    sitemap: 'https://taschibra-store.vercel.app/sitemap.xml',
  }
}
