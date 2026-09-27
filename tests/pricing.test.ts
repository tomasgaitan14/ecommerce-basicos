import { describe, expect, it } from 'vitest'
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  formatPrice,
  getInstallmentAmount,
  getOrderSummary,
} from '../src/lib/pricing'

// Intl separa el signo del número con un espacio no separable.
const NBSP = ' '

describe('formatPrice', () => {
  it('formatea pesos sin decimales cuando el monto es entero', () => {
    expect(formatPrice(24900)).toBe(`$${NBSP}24.900`)
    expect(formatPrice(150000)).toBe(`$${NBSP}150.000`)
  })

  it('muestra siempre dos decimales cuando el monto tiene centavos', () => {
    expect(formatPrice(10966.67)).toBe(`$${NBSP}10.966,67`)
    expect(formatPrice(10966.5)).toBe(`$${NBSP}10.966,50`)
  })
})

describe('getInstallmentAmount', () => {
  it('divide el precio en tres cuotas sin interés', () => {
    expect(getInstallmentAmount(69900)).toBe(23300)
  })

  it('redondea la cuota al centavo cuando la división no es exacta', () => {
    expect(getInstallmentAmount(32900)).toBe(10966.67)
  })
})

describe('getOrderSummary', () => {
  it('con el carrito vacío no cobra envío y falta todo el mínimo', () => {
    expect(getOrderSummary([])).toEqual({
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      total: 0,
      missingForFreeShipping: FREE_SHIPPING_THRESHOLD,
      freeShippingProgress: 0,
    })
  })

  it('por debajo del mínimo suma el envío y dice cuánto falta', () => {
    const summary = getOrderSummary([
      { unitPrice: 24900, quantity: 2 },
      { unitPrice: 59900, quantity: 1 },
    ])
    expect(summary.itemCount).toBe(3)
    expect(summary.subtotal).toBe(109700)
    expect(summary.shipping).toBe(SHIPPING_COST)
    expect(summary.total).toBe(109700 + SHIPPING_COST)
    expect(summary.missingForFreeShipping).toBe(FREE_SHIPPING_THRESHOLD - 109700)
  })

  it('con el subtotal exacto del mínimo el envío es gratis', () => {
    const summary = getOrderSummary([{ unitPrice: 50000, quantity: 3 }])
    expect(summary.subtotal).toBe(FREE_SHIPPING_THRESHOLD)
    expect(summary.shipping).toBe(0)
    expect(summary.total).toBe(FREE_SHIPPING_THRESHOLD)
    expect(summary.missingForFreeShipping).toBe(0)
  })

  it('un peso por debajo del mínimo todavía paga envío', () => {
    const summary = getOrderSummary([{ unitPrice: FREE_SHIPPING_THRESHOLD - 1, quantity: 1 }])
    expect(summary.shipping).toBe(SHIPPING_COST)
    expect(summary.missingForFreeShipping).toBe(1)
  })

  it('el avance hacia el envío gratis va de 0 a 1 y no se pasa de 1', () => {
    expect(getOrderSummary([{ unitPrice: 37500, quantity: 2 }]).freeShippingProgress).toBe(0.5)
    expect(getOrderSummary([{ unitPrice: 139900, quantity: 2 }]).freeShippingProgress).toBe(1)
  })
})
