'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, ChevronDown, Package, Heart, UserCircle, LayoutDashboard, LogOut } from 'lucide-react'

type Cliente = {
  id: string
  email: string
  nome: string
}

export default function UserMenu() {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Re-le localStorage em cada navegacao OU quando recebe evento cliente-changed
  // (login/cadastro/logout em outra pagina dispara o evento sem mudar pathname)
  useEffect(() => {
    setMounted(true)
    function recarregar() {
      const salvo = localStorage.getItem('cliente_logado')
      if (salvo) {
        try {
          setCliente(JSON.parse(salvo))
        } catch {
          setCliente(null)
        }
      } else {
        setCliente(null)
      }
    }
    recarregar()

    // Custom event: disparado pela mesma aba apos login/cadastro/logout
    window.addEventListener('cliente-changed', recarregar)
    // Storage event: disparado pelo browser quando outra aba muda localStorage
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === 'cliente_logado') recarregar()
    })

    return () => {
      window.removeEventListener('cliente-changed', recarregar)
      window.removeEventListener('storage', recarregar as EventListener)
    }
  }, [pathname])

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  function delayClose() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }
  function cancelClose() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  function handleLogout() {
    localStorage.removeItem('cliente_logado')
    window.dispatchEvent(new Event('cliente-changed'))
    setCliente(null)
    setOpen(false)
    router.push('/')
  }

  // SSR-safe: nao renderiza variacao logada antes de hidratar
  if (!mounted) {
    return (
      <Link href="/minha-conta" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">
        <User size={20} className="text-green-600" />
        <div className="text-left hidden md:block">
          <div className="text-xs text-gray-500 font-normal">Olá, faça seu</div>
          <div className="text-sm font-bold leading-tight">Login</div>
        </div>
      </Link>
    )
  }

  // ─── Estado deslogado ────────────────────────────────────────────
  if (!cliente) {
    return (
      <Link href="/minha-conta" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">
        <User size={20} className="text-green-600" />
        <div className="text-left hidden md:block">
          <div className="text-xs text-gray-500 font-normal">Olá, faça seu</div>
          <div className="text-sm font-bold leading-tight">Login</div>
        </div>
      </Link>
    )
  }

  // ─── Estado logado ───────────────────────────────────────────────
  const primeiroNome = cliente.nome.split(' ')[0] || 'Cliente'

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={delayClose}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors"
      >
        <User size={20} className="text-green-600" />
        <div className="text-left hidden md:block">
          <div className="text-xs text-gray-500 font-normal">Olá, {primeiroNome}</div>
          <div className="text-sm font-bold leading-tight flex items-center gap-1">
            Minha conta
            <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <ChevronDown size={12} className={`md:hidden text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          onMouseEnter={cancelClose}
          onMouseLeave={delayClose}
        >
          {/* Cabecalho */}
          <div className="px-4 py-3 bg-green-50 border-b border-green-100">
            <p className="text-sm font-black text-gray-800 truncate">{cliente.nome}</p>
            <p className="text-xs text-gray-500 truncate">{cliente.email}</p>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/minha-conta"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <LayoutDashboard size={15} className="text-gray-400" />
              Painel da Conta
            </Link>
            <Link
              href="/minha-conta/pedidos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <Package size={15} className="text-gray-400" />
              Meus Pedidos
            </Link>
            <Link
              href="/minha-conta/favoritos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <Heart size={15} className="text-gray-400" />
              Meus Favoritos
            </Link>
            <Link
              href="/minha-conta/dados"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <UserCircle size={15} className="text-gray-400" />
              Meus Dados
            </Link>
          </div>

          {/* Sair */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
