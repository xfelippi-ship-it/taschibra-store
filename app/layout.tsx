import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/CartContext"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
})

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
      </body>
    </html>
  )
}