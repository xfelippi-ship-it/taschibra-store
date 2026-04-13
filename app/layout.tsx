import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import CookieBanner from '@/components/store/CookieBanner'
import { CartProvider } from "@/contexts/CartContext"
import { createClient } from '@supabase/supabase-js'

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
})

// SEO padrão — sobrescrito por generateMetadata em cada página
export const metadata: Metadata = {
  title: "Taschibra Store — Iluminação e Automação",
  description: "Loja oficial Taschibra. Mais de 3.000 produtos de iluminação, automação e utilidades.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} antialiased bg-white text-gray-900`}>
        <CartProvider>
          {children}
        </CartProvider>
        <CookieBanner />
      </body>
    </html>
  )
}
