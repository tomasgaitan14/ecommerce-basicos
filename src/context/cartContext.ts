import { createContext, useContext } from 'react'
import type { ColorId } from '../data/colors'
import type { CartItem, CartState } from '../lib/cart'
import type { OrderSummary } from '../lib/pricing'

export interface CartVariant {
  productSlug: string
  colorId: ColorId
  size: string
}

export interface CartContextValue {
  cart: CartState
  items: CartItem[]
  summary: OrderSummary
  isOpen: boolean
  // La última prenda agregada, para anunciarla dentro del carrito.
  lastAdded: CartItem | null
  addItem: (variant: CartVariant) => void
  setQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  clear: () => void
  availableToAdd: (variant: CartVariant) => number
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart necesita un CartProvider más arriba en el árbol.')
  return value
}
