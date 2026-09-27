import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { EMPTY_CART, cartReducer, describeCart, getAvailableToAdd, getLineId } from '../lib/cart'
import { loadCart, saveCart } from '../lib/cartStorage'
import { CartContext, type CartContextValue, type CartVariant } from './cartContext'

type CartStorage = Pick<Storage, 'getItem' | 'setItem'>

// Leer window.localStorage ya puede lanzar un DOMException si el navegador bloquea el
// almacenamiento. En ese caso el carrito funciona igual, solo que no sobrevive a un refresh.
function browserStorage(): CartStorage | null {
  try {
    return window.localStorage
  } catch (error) {
    if (error instanceof DOMException) return null
    throw error
  }
}

interface CartProviderProps {
  children: ReactNode
  // Los tests inyectan un almacenamiento en memoria.
  storage?: CartStorage
}

export function CartProvider({ children, storage }: CartProviderProps) {
  const [store] = useState(() => storage ?? browserStorage())
  const [cart, dispatch] = useReducer(cartReducer, store, (initial) => (initial ? loadCart(initial) : EMPTY_CART))
  const [isOpen, setIsOpen] = useState(false)
  const [lastAddedLineId, setLastAddedLineId] = useState<string | null>(null)

  useEffect(() => {
    if (store) saveCart(store, cart)
  }, [store, cart])

  const addItem = useCallback((variant: CartVariant) => {
    dispatch({ type: 'add', ...variant, quantity: 1 })
    setLastAddedLineId(getLineId(variant))
    setIsOpen(true)
  }, [])
  const setQuantity = useCallback(
    (lineId: string, quantity: number) => dispatch({ type: 'setQuantity', lineId, quantity }),
    [],
  )
  const removeItem = useCallback((lineId: string) => dispatch({ type: 'remove', lineId }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const { items, summary } = describeCart(cart)
    return {
      cart,
      items,
      summary,
      isOpen,
      lastAdded: items.find((item) => item.lineId === lastAddedLineId) ?? null,
      addItem,
      setQuantity,
      removeItem,
      clear,
      availableToAdd: (variant) => getAvailableToAdd(cart, variant),
      openCart,
      closeCart,
    }
  }, [cart, isOpen, lastAddedLineId, addItem, setQuantity, removeItem, clear, openCart, closeCart])

  return <CartContext value={value}>{children}</CartContext>
}
