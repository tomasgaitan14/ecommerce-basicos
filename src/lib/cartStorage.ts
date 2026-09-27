import { COLORS, type ColorId } from '../data/colors'
import { EMPTY_CART, cartReducer, type CartLine, type CartState } from './cart'

// Si cambia la forma de lo guardado, se sube la versión y los carritos viejos se ignoran.
export const CART_STORAGE_KEY = 'basicos:carrito:v1'

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem'>

// El navegador puede bloquear el almacenamiento (modo privado, cookies deshabilitadas, cuota
// llena): en esos casos lanza un DOMException y el carrito sigue funcionando solo en memoria.
function readStored(storage: ReadableStorage): string | null {
  try {
    return storage.getItem(CART_STORAGE_KEY)
  } catch (error) {
    if (error instanceof DOMException) return null
    throw error
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch (error) {
    if (error instanceof SyntaxError) return undefined
    throw error
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isColorId(value: unknown): value is ColorId {
  return typeof value === 'string' && Object.hasOwn(COLORS, value)
}

function isStoredLine(value: unknown): value is CartLine {
  return (
    isRecord(value) &&
    typeof value.productSlug === 'string' &&
    isColorId(value.colorId) &&
    typeof value.size === 'string' &&
    typeof value.quantity === 'number'
  )
}

// Cada línea guardada vuelve a pasar por "agregar": así se descartan productos que ya no existen,
// se recortan cantidades al stock actual y se juntan líneas repetidas.
export function loadCart(storage: ReadableStorage): CartState {
  const raw = readStored(storage)
  if (raw === null) return EMPTY_CART
  const data = parseJson(raw)
  if (!isRecord(data) || !Array.isArray(data.lines)) return EMPTY_CART
  return data.lines
    .filter(isStoredLine)
    .reduce<CartState>(
      (cart, { productSlug, colorId, size, quantity }) =>
        cartReducer(cart, { type: 'add', productSlug, colorId, size, quantity }),
      EMPTY_CART,
    )
}

export function saveCart(storage: WritableStorage, state: CartState): void {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify({ lines: state.lines }))
  } catch (error) {
    if (!(error instanceof DOMException)) throw error
  }
}
