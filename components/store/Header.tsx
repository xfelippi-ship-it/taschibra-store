'use client'
import { ShoppingCart, User, Search, Phone, Menu, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const TopBar = dynamic(() => import('@/components/store/TopBar'), { ssr: false })
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type CatData = {
  id: string; name: string; slug: string
  icon_svg: string | null; panel_image_url: string | null
  panel_bg_color: string | null; panel_title: string | null
  panel_tagline: string | null
}

type SubCat = { id: string; label: string; slug: string; sort_order: number }

// ─── Menu horizontal — dinâmico via Supabase ─────────────────────────────────

type MenuItem = { label: string; slug: string }





// ─── Ícones fixos por slug (v2) ───────────────────────────────────────────────────
const ICONES_MENU: Record<string, string> = {
  ambientes:        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
  lampadas:         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="4"/><path d="M12 6a6 6 0 016 6c0 2.22-1.2 4.16-3 5.2V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1.8C7.2 16.16 6 14.22 6 12a6 6 0 016-6z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>',
  smart:            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  decorativo:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
  'trilhos-perfis': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  pilhas:           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="14" rx="1"/><line x1="10" y1="7" x2="10" y2="3"/><line x1="14" y1="7" x2="14" y2="3"/></svg>',
  energia:          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>',
  fechaduras:       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  profissional:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
  outlet:           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  lancamentos:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
  'sensores-presenca': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
}
function getIcone(slug: string): string {
  return ICONES_MENU[slug] || '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>'
}

// ─── Painel "Todas Categorias" estilo Intelbras ───────────────────────────────

function TodasCategoriasPanel({ onClose }: { onClose: () => void }) {
  const [cats, setCats]         = useState<CatData[]>([])
  const [subcats, setSubcats]   = useState<Record<string, SubCat[]>>({})
  const [ativa, setAtiva]       = useState<CatData | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: catsData }, { data: subsData }] = await Promise.all([
        supabase.from('categories').select('id,name,slug,icon_svg,panel_image_url,panel_bg_color,panel_title,panel_tagline,show_in_menu').order('sort_order'),
        supabase.from('category_subcategories').select('id,category_slug,label,slug,sort_order').order('sort_order'),
      ])
      const c = (catsData || []).filter((x: CatData & {show_in_menu?: boolean}) => x.show_in_menu !== false || x.slug === 'pecas-de-reposicao')
      setCats(c)
      if (c.length) setAtiva(c[0])
      const grouped: Record<string, SubCat[]> = {}
      for (const s of (subsData || [])) {
        if (!grouped[s.category_slug]) grouped[s.category_slug] = []
        grouped[s.category_slug].push(s)
      }
      setSubcats(grouped)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="absolute top-full left-0 right-0 bg-white border-t border-b border-gray-200 shadow-xl z-50 h-72 flex items-center justify-center">
      <span className="text-sm text-gray-400">Carregando categorias...</span>
    </div>
  )

  const bgStyle = ativa?.panel_image_url
    ? { backgroundImage: `url(${ativa.panel_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: ativa?.panel_bg_color || '#1e7a3c' }

  const subs = ativa ? (subcats[ativa.slug] || []) : []

  return (
    <div className="absolute top-full left-0 right-0 bg-white border-t border-b border-gray-200 shadow-xl z-50">
      <div className="max-w-7xl mx-auto flex" style={{ minHeight: 300 }}>

        {/* Col 1 — Lista de categorias */}
        <div className="w-56 flex-shrink-0 border-r border-gray-100 py-2 bg-white">
          {cats.map(cat => (
            <Link key={cat.id} href={`/produtos?categoria=${encodeURIComponent(cat.slug)}`}
              onClick={onClose}
              onMouseEnter={() => setAtiva(cat)}
              className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors group cursor-pointer ${
                ativa?.id === cat.id ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: cat.panel_bg_color || '#1e7a3c' }}>
                <div style={{width:16,height:16}} dangerouslySetInnerHTML={{ __html: getIcone(cat.slug) }} />
              </div>
              <span className="text-sm font-semibold flex-1 leading-tight">{cat.name}</span>
              {subs.length > 0 || (subcats[cat.slug]?.length > 0) ? (
                <ChevronRight size={13} className={`flex-shrink-0 ${ativa?.id === cat.id ? 'text-green-500' : 'text-gray-300'}`} />
              ) : null}
            </Link>
          ))}
        </div>

        {/* Col 2 — Subcategorias */}
        <div className="w-52 flex-shrink-0 border-r border-gray-100 py-4 px-3 bg-white">
          {subs.length > 0 ? (
            <>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-2 mb-2">{ativa?.name}</p>
              {subs.map(sub => (
                <Link key={sub.id}
                  href={`/produtos?categoria=${encodeURIComponent(sub.slug)}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  {sub.label}
                </Link>
              ))}
              <Link href={`/produtos?categoria=${encodeURIComponent(ativa?.slug || '')}`}
                onClick={onClose}
                className="flex items-center gap-2 px-2 py-2 mt-1 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 transition-colors">
                Ver todos →
              </Link>
            </>
          ) : ativa ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <p className="text-sm text-gray-400 italic">Ver todos os produtos de</p>
              <Link href={`/produtos?categoria=${encodeURIComponent(ativa.slug)}`}
                onClick={onClose}
                className="mt-3 text-sm font-bold text-green-600 hover:underline">{ativa.name} →</Link>
            </div>
          ) : null}
        </div>

        {/* Col 3 — Painel visual */}
        {ativa && (
          <div className="flex-1 relative overflow-hidden" style={bgStyle}>
            <div className="absolute inset-0" style={{ background: ativa?.panel_image_url ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)' }} />
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              {ativa.panel_title && (
                <h3 className="text-white text-2xl font-black mb-2 leading-tight">{ativa.panel_title}</h3>
              )}
              {ativa.panel_tagline && (
                <p className="text-white text-sm leading-relaxed opacity-90 max-w-sm">{ativa.panel_tagline}</p>
              )}
              {!ativa.panel_title && !ativa.panel_tagline && (
                <p className="text-white text-lg font-black opacity-70">{ativa.name}</p>
              )}
              <Link href={`/produtos?categoria=${encodeURIComponent(ativa.slug)}`}
                onClick={onClose}
                className="mt-5 w-fit bg-white text-green-700 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-50 transition-colors">
                Ver produtos →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Menu Mobile com accordion expansível ──────────────────────────────────
function MobileMenu({
  menuItems, subcatsMenu, onClose, search, setSearch, handleSearch
}: {
  menuItems: MenuItem[]
  subcatsMenu: Record<string, SubCat[]>
  onClose: () => void
  search: string
  setSearch: (v: string) => void
  handleSearch: (e?: React.FormEvent) => void
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  return (
    <div className="md:hidden border-t border-gray-100 bg-white max-h-[85vh] overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full h-10 border-2 border-gray-200 rounded-full px-4 pr-10 text-sm outline-none focus:border-green-500 bg-gray-50"
          />
          <button onClick={() => handleSearch()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 w-7 h-7 rounded-full flex items-center justify-center">
            <Search size={13} color="white" />
          </button>
        </div>
      </div>
      <div className="py-1">
        {menuItems.map(({ label, slug }) => {
          const subs = subcatsMenu[slug] || []
          const isOpen = openSlug === slug
          const hasSubs = subs.length > 0
          return (
            <div key={slug} className="border-b border-gray-50 last:border-0">
              <div className="flex items-center">
                <Link
                  href={`/produtos?categoria=${encodeURIComponent(slug)}`}
                  onClick={onClose}
                  className="flex-1 px-5 py-3.5 text-sm font-bold text-gray-800 hover:text-green-600 active:text-green-600 transition-colors"
                >
                  {label}
                </Link>
                {hasSubs && (
                  <button
                    onClick={() => setOpenSlug(prev => prev === slug ? null : slug)}
                    className="px-4 py-3.5 text-gray-400 hover:text-green-600 transition-colors"
                    aria-label={isOpen ? 'Fechar subcategorias' : 'Ver subcategorias'}
                  >
                    <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-green-600' : 'text-gray-500'}`} />
                  </button>
                )}
              </div>
              {hasSubs && isOpen && (
                <div className="bg-gray-50 border-t border-gray-100 pb-1">
                  {subs.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/produtos?categoria=${encodeURIComponent(sub.slug)}`}
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-7 py-2.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 active:bg-green-50 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                  <Link
                    href={`/produtos?categoria=${encodeURIComponent(slug)}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-7 py-2.5 text-xs font-bold text-green-600 hover:bg-green-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    Ver todos em {label} →
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2 text-xs text-green-700 font-semibold">
        <Phone size={13} /> (47) 99149-3270
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const [search, setSearch]         = useState('')
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeMega, setActiveMega] = useState<string | null>(null)
  const [todasOpen, setTodasOpen]   = useState(false)
  const [subcatsMenu, setSubcatsMenu] = useState<Record<string, SubCat[]>>({})
  const [menuItems, setMenuItems]     = useState<MenuItem[]>([])
  const { count } = useCart()
  const router    = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  function delay(fn: () => void, ms = 120) {
    timerRef.current = setTimeout(fn, ms)
  }
  function cancelDelay() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  function openMega(slug: string)  { cancelDelay(); setActiveMega(slug); setTodasOpen(false) }
  function closeMega()             { delay(() => setActiveMega(null)) }
  function openTodas()             { cancelDelay(); setTodasOpen(true); setActiveMega(null) }
  function closeTodas()            { delay(() => setTodasOpen(false)) }
  function closeAll()              { setActiveMega(null); setTodasOpen(false) }

  useEffect(() => {
    // Carrega categorias principais da barra de menu
    supabase
      .from('categories')
      .select('id,name,slug')
      .eq('show_in_menu', true)
      .is('parent_id', null)
      .order('sort_order')
      .then(({ data }) => {
        setMenuItems((data || []).map((c: { id: string; name: string; slug: string }) => ({
          label: c.name,
          slug: c.slug,
        })))
      })
    // Carrega subcategorias para dropdowns — usa category_subcategories
    supabase
      .from('category_subcategories')
      .select('id,category_slug,label,slug,sort_order')
      .order('sort_order')
      .then(({ data }) => {
        const grouped: Record<string, SubCat[]> = {}
        for (const s of (data || [])) {
          if (!grouped[s.category_slug]) grouped[s.category_slug] = []
          grouped[s.category_slug].push({ id: s.id, label: s.label, slug: s.slug, sort_order: s.sort_order })
        }
        setSubcatsMenu(grouped)
      })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) closeAll()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const q = search.trim()
    if (!q) return
    router.push(`/produtos?busca=${encodeURIComponent(q)}`)
    setSearch(''); setMenuOpen(false)
  }

  return (
    <>
      <TopBar />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" ref={headerRef}>

        {/* Linha principal */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} className="md:hidden flex-shrink-0 text-gray-700 hover:text-green-600 transition-colors">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="flex-shrink-0" onClick={closeAll}>
            <Image src="/images/logo.webp" alt="Taschibra Store" width={160} height={40} className="h-9 md:h-12 w-auto" priority />
          </Link>
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <input type="text" placeholder="O que você está procurando?" value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full h-11 border-2 border-gray-200 rounded-full px-5 pr-12 text-sm outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all" />
            <button onClick={handleSearch} aria-label="Buscar" className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              <Search size={14} color="white" />
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <button aria-label="Buscar produtos" className="md:hidden text-gray-700 hover:text-green-600 transition-colors"><Search size={22} /></button>
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
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Navbar desktop */}
        <nav className="hidden md:block border-t border-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 flex items-stretch">

            {/* Todas Categorias */}
            <div onMouseEnter={openTodas} onMouseLeave={closeTodas}>
              <button className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all flex-shrink-0 mr-1 ${
                todasOpen ? 'text-green-600 border-green-500' : 'text-gray-600 border-transparent hover:text-green-600 hover:border-green-500'
              }`}>
                <Menu size={13} /> Todas Categorias
              </button>
            </div>

            <div className="w-px bg-gray-200 my-2 mx-1 flex-shrink-0" />

            {menuItems.map(item => {
              const subs = subcatsMenu[item.slug] || []
              const isActiveSub = activeMega === item.slug
              if (!subs.length) return (
                <Link key={item.slug} href={`/produtos?categoria=${encodeURIComponent(item.slug)}`}
                  onClick={closeAll}
                  className="px-3 py-2.5 text-sm font-bold text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-500 transition-all whitespace-nowrap flex-shrink-0 flex items-center">
                  {item.label}
                </Link>
              )
              return (
                <div key={item.slug} onMouseEnter={() => openMega(item.slug)} onMouseLeave={closeMega} className="relative flex items-stretch">
                  <Link href={`/produtos?categoria=${encodeURIComponent(item.slug)}`}
                    onClick={closeAll}
                    className={`px-3 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                      isActiveSub ? 'text-green-600 border-green-500' : 'text-gray-700 border-transparent hover:text-green-600 hover:border-green-500'
                    }`}>
                    {item.label}
                    <ChevronDown size={11} className={`transition-transform ${isActiveSub ? 'rotate-180' : ''}`} />
                  </Link>
                  {isActiveSub && (
                    <div onMouseEnter={cancelDelay} onMouseLeave={closeMega}
                      className="absolute top-full left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-48 py-2">
                      {subs.map((sub: SubCat) => (
                        <Link key={sub.id} href={`/produtos?categoria=${encodeURIComponent(sub.slug)}`}
                          onClick={closeAll}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          {sub.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link href={`/produtos?categoria=${encodeURIComponent(item.slug)}`}
                          onClick={closeAll}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50 transition-colors">
                          Ver todos →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Painel Todas Categorias */}
          {todasOpen && (
            <div onMouseEnter={cancelDelay} onMouseLeave={closeTodas}>
              <TodasCategoriasPanel onClose={closeAll} />
            </div>
          )}



       </nav>

        {/* Menu mobile */}
        {menuOpen && (
          <MobileMenu
            menuItems={menuItems}
            subcatsMenu={subcatsMenu}
            onClose={() => setMenuOpen(false)}
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearch}
          />
        )}

      </header>
    </>
  )
}
