'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Cupom = {
  code: string
  description: string
  discount_type: string
  discount_value: number
  discount_amount: number
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
}

const CartContext = createContext<CartContextType>({} as CartContextType)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cupom, setCupom] = useState<Cupom | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('taschibra-cart')
    if (saved) setItems(JSON.parse(saved))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('taschibra-cart', JSON.stringify(items))
  }, [items, mounted])

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  function clearCart() { setItems([]); setCupom(null) }

  const total = items.reduce((sum, i) => sum + (i.promo_price || i.price) * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, cupom, setCupom }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
