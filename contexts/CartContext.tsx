'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Cupom = {
  code: string
  description: string
  discount_type: string
  discount_value: number
  discount_amount: number
  free_shipping?: boolean
  scope?: string
}

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  promo_price: number
  emoji: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
  cupom: Cupom | null
  setCupom: (c: Cupom | null) => void
  cupons: Cupom[]
  addCupom: (c: Cupom) => void
  removeCupom: (code: string) => void
  totalDesconto: number
  freeShipping: boolean
}

const CartContext = createContext<CartContextType>({} as CartContextType)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('taschibra-cart')
    if (saved) setItems(JSON.parse(saved))
    const savedCupons = localStorage.getItem('taschibra-cupons')
    if (savedCupons) setCupons(JSON.parse(savedCupons))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('taschibra-cart', JSON.stringify(items))
  }, [items, mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('taschibra-cupons', JSON.stringify(cupons))
  }, [cupons, mounted])

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeItem(id: string) {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      if (next.length === 0) setCupons([])
      return next
    })
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  function clearCart() { setItems([]); setCupons([]) }

  function addCupom(c: Cupom) {
    setCupons(prev => {
      const sem = prev.filter(x => x.code !== c.code)
      if (sem.length >= 2) return prev
      const novo = [...sem, c]

      const isPerc = (x: Cupom) => x.discount_type === 'percent' || x.discount_type === 'percentage'

      return novo.sort((a, b) => {
        const aPerc = isPerc(a)
        const bPerc = isPerc(b)

        // Fixo + Percentual: fixo primeiro
        if (!aPerc && bPerc) return -1
        if (aPerc && !bPerc) return 1

        // Dois fixos: menor valor primeiro
        if (!aPerc && !bPerc) return a.discount_value - b.discount_value

        // Dois percentuais: menor percentual primeiro
        return a.discount_value - b.discount_value
      })
    })
  }

  function removeCupom(code: string) { setCupons(prev => prev.filter(x => x.code !== code)) }

  const total = items.reduce((sum, i) => sum + (i.promo_price || i.price) * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  // Recalcula descontos em cascata respeitando a ordem
  const totalDesconto = (() => {
    let saldo = total
    let soma = 0
    for (const cp of cupons) {
      const isPerc = cp.discount_type === 'percent' || cp.discount_type === 'percentage'
      const desc = isPerc ? saldo * (cp.discount_value / 100) : cp.discount_value
      const descReal = Math.min(desc, saldo)
      soma += descReal
      saldo -= descReal
    }
    return soma
  })()
  const freeShipping = cupons.some(c => c.free_shipping)

  // Compatibilidade com codigo legado que usa cupom singular
  const cupom = cupons.length > 0 ? cupons[0] : null
  const setCupom = (c: Cupom | null) => { if (c) addCupom(c); else setCupons([]) }

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      total, count,
      cupom, setCupom,
      cupons, addCupom, removeCupom,
      totalDesconto, freeShipping
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
