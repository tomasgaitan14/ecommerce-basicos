import { COLORS, type ColorId } from '../data/colors'
import type { GarmentType } from '../data/garments'
import { getProductBySlug, getVariantStock } from './catalog'
import { getOrderSummary, type OrderSummary } from './pricing'

export const MAX_QUANTITY_PER_LINE = 10

export interface CartLine {
  productSlug: string
  colorId: ColorId
  size: string
  quantity: number
}

export interface CartState {
  lines: CartLine[]
}

type VariantKey = Pick<CartLine, 'productSlug' | 'colorId' | 'size'>

export type CartAction =
  | ({ type: 'add'; quantity: number } & VariantKey)
  | { type: 'setQuantity'; lineId: string; quantity: number }
  | { type: 'remove'; lineId: string }
  | { type: 'clear' }

export const EMPTY_CART: CartState = { lines: [] }

// Una línea por variante: producto + color + talle.
export function getLineId(variant: VariantKey): string {
  return `${variant.productSlug}:${variant.colorId}:${variant.size}`
}

// Tope de una línea: lo que haya en stock, sin pasar del máximo por línea.
function maxQuantityFor(variant: VariantKey): number {
  return Math.min(getVariantStock(variant.productSlug, variant.colorId, variant.size), MAX_QUANTITY_PER_LINE)
}

function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1
}

function withQuantity(state: CartState, lineId: string, quantity: number): CartState {
  return {
    lines: state.lines.map((line) => (getLineId(line) === lineId ? { ...line, quantity } : line)),
  }
}

function addToCart(state: CartState, variant: VariantKey, quantity: number): CartState {
  const max = maxQuantityFor(variant)
  if (!isValidQuantity(quantity) || max === 0) return state

  const lineId = getLineId(variant)
  const existing = state.lines.find((line) => getLineId(line) === lineId)
  if (!existing) {
    const { productSlug, colorId, size } = variant
    return { lines: [...state.lines, { productSlug, colorId, size, quantity: Math.min(quantity, max) }] }
  }
  const nextQuantity = Math.min(existing.quantity + quantity, max)
  return nextQuantity === existing.quantity ? state : withQuantity(state, lineId, nextQuantity)
}

function setQuantity(state: CartState, lineId: string, quantity: number): CartState {
  const line = state.lines.find((candidate) => getLineId(candidate) === lineId)
  if (!line || !isValidQuantity(quantity)) return state
  return withQuantity(state, lineId, Math.min(quantity, maxQuantityFor(line)))
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add':
      return addToCart(state, action, action.quantity)
    case 'setQuantity':
      return setQuantity(state, action.lineId, action.quantity)
    case 'remove':
      return { lines: state.lines.filter((line) => getLineId(line) !== action.lineId) }
    case 'clear':
      return EMPTY_CART
  }
}

export function getAvailableToAdd(state: CartState, variant: VariantKey): number {
  const lineId = getLineId(variant)
  const inCart = state.lines.find((line) => getLineId(line) === lineId)?.quantity ?? 0
  return Math.max(0, maxQuantityFor(variant) - inCart)
}

// Lo que muestran el carrito y el checkout de cada línea.
export interface CartItem {
  lineId: string
  productSlug: string
  name: string
  garment: GarmentType
  colorId: ColorId
  colorName: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
  maxQuantity: number
}

export function describeCart(state: CartState): { items: CartItem[]; summary: OrderSummary } {
  const items = state.lines.flatMap((line): CartItem[] => {
    const product = getProductBySlug(line.productSlug)
    if (!product) return []
    return [
      {
        lineId: getLineId(line),
        productSlug: product.slug,
        name: product.name,
        garment: product.garment,
        colorId: line.colorId,
        colorName: COLORS[line.colorId].name,
        size: line.size,
        quantity: line.quantity,
        unitPrice: product.price,
        lineTotal: product.price * line.quantity,
        maxQuantity: maxQuantityFor(line),
      },
    ]
  })
  return { items, summary: getOrderSummary(items) }
}
