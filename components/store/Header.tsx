'use client'
import { ShoppingCart, User, Search, Phone } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [search, setSearch] = useState('')
  const { count } = useCart()

  return (
    <>
      <div className="bg-green-600 text-white text-xs py-2 px-6 flex items-center justify-center gap-6 flex-wrap">
        <span>Atendimento</span><span className="text-green-300">|</span>
        <span>Compra Segura</span><span className="text-green-300">|</span>
        <span>Perguntas Frequentes</span><span className="text-green-300">|</span>
        <span>Política de Entrega</span><span className="text-green-300">|</span>
        <span className="flex items-center gap-1"><Phone size={12} /> (47) 99149-3270</span>
      </div>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white font-black text-sm px-3 py-2 rounded leading-tight tracking-wide uppercase">
                TASCHIBRA
              </div>
              <div className="text-green-600 font-black text-xs tracking-[3px] uppercase">
                STORE
              </div>
            </div>
          </Link>
          <div className="flex-1 max-w-xl relative">
            <input type="text" placeholder="O que você está procurando?"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-11 border-2 border-gray-200 rounded-full px-5 pr-12 text-sm outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              <Search size={14} color="white" />
            </button>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">
              <User size={20} className="text-green-600" />
              <div className="text-left hidden md:block">
                <div className="text-xs text-gray-500 font-normal">Olá, faça seu</div>
                <div className="text-sm font-bold leading-tight">Login</div>
              </div>
            </Link>
            <Link href="/carrinho" className="relative bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-colors">
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Carrinho</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <nav className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 flex items-center overflow-x-auto">
            {['Lançamentos','Exclusivos','SMART','Lâmpadas','Teto','Refletor','Mat. Elétrico','Decorativo','Parede','Perfil','Outlet'].map(item => (
              <Link key={item} href={`/produtos`}
                className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-500 transition-all whitespace-nowrap">
                {item}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  )
}