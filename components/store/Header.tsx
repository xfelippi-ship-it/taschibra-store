'use client'
import { ShoppingCart, User, Search, Phone, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

const categorias = [
  {label:'Lançamentos', slug:'lancamentos'},
  {label:'Exclusivos', slug:'exclusivos'},
  {label:'SMART', slug:'smart'},
  {label:'Lâmpadas', slug:'lampadas'},
  {label:'Teto', slug:'teto'},
  {label:'Refletor', slug:'refletor'},
  {label:'Mat. Elétrico', slug:'material-eletrico'},
  {label:'Decorativo', slug:'decorativo'},
  {label:'Parede', slug:'parede'},
  {label:'Perfil', slug:'perfil'},
  {label:'Outlet', slug:'outlet'},
]

export default function Header() {
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { count } = useCart()

  return (
    <>
      {/* Top bar — esconde no mobile */}
      <div className="hidden md:flex bg-green-600 text-white text-xs py-2 px-6 items-center justify-center gap-6">
        <span>Atendimento</span><span className="text-green-300">|</span>
        <span>Compra Segura</span><span className="text-green-300">|</span>
        <span>Perguntas Frequentes</span><span className="text-green-300">|</span>
        <span>Política de Entrega</span><span className="text-green-300">|</span>
        <span className="flex items-center gap-1"><Phone size={12} /> (47) 99149-3270</span>
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">

          {/* Hambúrguer — só mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex-shrink-0 text-gray-700 hover:text-green-600 transition-colors">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/images/logo.png" alt="Taschibra Store" width={160} height={40}
              className="h-9 md:h-12 w-auto" priority />
          </Link>

          {/* Busca — esconde no mobile, mostra só ícone */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <input type="text" placeholder="O que você está procurando?"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-11 border-2 border-gray-200 rounded-full px-5 pr-12 text-sm outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              <Search size={14} color="white" />
            </button>
          </div>

          {/* Ações direita */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Lupa mobile */}
            <button className="md:hidden text-gray-700 hover:text-green-600 transition-colors">
              <Search size={22} />
            </button>

            <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">
              <User size={20} className="text-green-600" />
              <div className="text-left hidden md:block">
                <div className="text-xs text-gray-500 font-normal">Olá, faça seu</div>
                <div className="text-sm font-bold leading-tight">Login</div>
              </div>
            </Link>

            <Link href="/carrinho" className="relative bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-3 md:px-4 py-2 md:py-2.5 rounded-full flex items-center gap-2 transition-colors">
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

        {/* Nav desktop — scroll horizontal */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 flex items-center overflow-x-auto scrollbar-hide">
            {categorias.map(({label, slug}) => (
              <Link key={slug} href={`/produtos?categoria=${encodeURIComponent(slug)}`}
                className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-500 transition-all whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Menu mobile — gaveta */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            {/* Busca mobile */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <input type="text" placeholder="O que você está procurando?"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full h-10 border-2 border-gray-200 rounded-full px-4 pr-10 text-sm outline-none focus:border-green-500 bg-gray-50" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 w-7 h-7 rounded-full flex items-center justify-center">
                  <Search size={13} color="white" />
                </button>
              </div>
            </div>
            {/* Categorias mobile */}
            <div className="py-2">
              {categorias.map(({label, slug}) => (
                <Link key={slug} href={`/produtos?categoria=${encodeURIComponent(slug)}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-sm font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors border-b border-gray-50">
                  {label}
                </Link>
              ))}
            </div>
            {/* Info mobile */}
            <div className="px-6 py-3 bg-green-50 flex items-center gap-2 text-xs text-green-700 font-semibold">
              <Phone size={13} /> (47) 99149-3270
            </div>
          </div>
        )}
      </header>
    </>
  )
}
