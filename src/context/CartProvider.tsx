import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { ANALYTICS_EVENTS, buildCartEvent, buildCartLineChange, pushToDataLayer } from '../lib/analytics'
import { EMPTY_CART, cartReducer, describeCart, getAvailableToAdd, getLineId, type CartAction } from '../lib/cart'
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

  // Todo cambio de una línea pasa por acá: se aplica y se mide lo que cambió de verdad (el reducer
  // puede topear por stock).
  const changeLine = useCallback(
    (action: CartAction, lineId: string) => {
      dispatch(action)
      const event = buildCartLineChange(cart, cartReducer(cart, action), lineId)
      if (event) pushToDataLayer(event)
    },
    [cart],
  )
  const addItem = useCallback(
    (variant: CartVariant) => {
      const lineId = getLineId(variant)
      changeLine({ type: 'add', ...variant, quantity: 1 }, lineId)
      setLastAddedLineId(lineId)
      setIsOpen(true)
    },
    [changeLine],
  )
  const setQuantity = useCallback(
    (lineId: string, quantity: number) => changeLine({ type: 'setQuantity', lineId, quantity }, lineId),
    [changeLine],
  )
  const removeItem = useCallback((lineId: string) => changeLine({ type: 'remove', lineId }, lineId), [changeLine])
  // Vaciar el carrito después de comprar no es sacar productos: no se mide.
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  // Solo cuando lo abre la persona: el carrito que se abre solo al agregar ya es add_to_cart.
  const openCart = useCallback(() => {
    setIsOpen(true)
    const { items, summary } = describeCart(cart)
    if (items.length > 0) pushToDataLayer(buildCartEvent(ANALYTICS_EVENTS.viewCart, items, summary))
  }, [cart])
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
