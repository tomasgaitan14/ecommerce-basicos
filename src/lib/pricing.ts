export const FREE_SHIPPING_THRESHOLD = 150000
export const SHIPPING_COST = 6900
export const INSTALLMENTS = 3

const LOCALE = 'es-AR'
// También la usa analytics: GA4 necesita la moneda de cada valor.
export const CURRENCY = 'ARS'

const wholePesos = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
const withCents = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? wholePesos.format(amount) : withCents.format(amount)
}

export function getInstallmentAmount(price: number): number {
  return Math.round((price * 100) / INSTALLMENTS) / 100
}

export interface PricedLine {
  unitPrice: number
  quantity: number
}

export interface OrderSummary {
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  missingForFreeShipping: number
  // De 0 a 1: cuánto del mínimo para envío gratis ya se cubrió.
  freeShippingProgress: number
}

export function getOrderSummary(lines: readonly PricedLine[]): OrderSummary {
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  // Sin prendas no hay nada que enviar.
  const shipping = itemCount === 0 || hasFreeShipping ? 0 : SHIPPING_COST
  return {
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    missingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    freeShippingProgress: Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD),
  }
}
