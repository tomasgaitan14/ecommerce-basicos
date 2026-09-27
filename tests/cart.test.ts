import { describe, expect, it } from 'vitest'
import {
  EMPTY_CART,
  MAX_QUANTITY_PER_LINE,
  cartReducer,
  describeCart,
  getAvailableToAdd,
  getLineId,
  type CartState,
} from '../src/lib/cart'
import { SHIPPING_COST } from '../src/lib/pricing'

// remera-clasica: negro/M tiene 2 unidades, blanco/XXL está agotado y el resto tiene 12.
const add = (state: CartState, colorId: 'negro' | 'blanco' | 'marino', size: string, quantity: number) =>
  cartReducer(state, { type: 'add', productSlug: 'remera-clasica', colorId, size, quantity })

describe('cartReducer: agregar', () => {
  it('agrega una línea nueva con la cantidad pedida', () => {
    expect(add(EMPTY_CART, 'marino', 'L', 1).lines).toEqual([
      { productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 1 },
    ])
  })

  it('la misma variante suma cantidad en vez de duplicar la línea', () => {
    const state = add(add(EMPTY_CART, 'marino', 'L', 1), 'marino', 'L', 2)
    expect(state.lines).toHaveLength(1)
    expect(state.lines[0].quantity).toBe(3)
  })

  it('otro talle u otro color del mismo producto va en otra línea', () => {
    const state = add(add(add(EMPTY_CART, 'marino', 'L', 1), 'marino', 'XL', 1), 'negro', 'L', 1)
    expect(state.lines.map((line) => `${line.colorId}/${line.size}`)).toEqual(['marino/L', 'marino/XL', 'negro/L'])
  })

  it('nunca supera el stock de la variante', () => {
    expect(add(EMPTY_CART, 'negro', 'M', 5).lines[0].quantity).toBe(2)
    expect(add(add(EMPTY_CART, 'negro', 'M', 2), 'negro', 'M', 1).lines[0].quantity).toBe(2)
  })

  it(`nunca supera ${MAX_QUANTITY_PER_LINE} unidades por línea aunque haya más stock`, () => {
    expect(add(EMPTY_CART, 'marino', 'L', 15).lines[0].quantity).toBe(MAX_QUANTITY_PER_LINE)
  })

  it('ignora cantidades en cero, negativas o con decimales', () => {
    for (const quantity of [0, -1, 1.5, Number.NaN]) {
      expect(add(EMPTY_CART, 'marino', 'L', quantity), String(quantity)).toEqual(EMPTY_CART)
    }
  })

  it('ignora variantes agotadas o inexistentes', () => {
    expect(add(EMPTY_CART, 'blanco', 'XXL', 1)).toEqual(EMPTY_CART)
    expect(add(EMPTY_CART, 'marino', '42', 1)).toEqual(EMPTY_CART)
    expect(
      cartReducer(EMPTY_CART, { type: 'add', productSlug: 'no-existe', colorId: 'negro', size: 'M', quantity: 1 }),
    ).toEqual(EMPTY_CART)
  })
})

describe('cartReducer: cambiar cantidad, quitar y vaciar', () => {
  const twoLines = add(add(EMPTY_CART, 'marino', 'L', 2), 'negro', 'M', 1)
  const marinoL = getLineId(twoLines.lines[0])
  const negroM = getLineId(twoLines.lines[1])

  it('cambia la cantidad de una línea sin tocar las demás', () => {
    const state = cartReducer(twoLines, { type: 'setQuantity', lineId: marinoL, quantity: 5 })
    expect(state.lines.map((line) => line.quantity)).toEqual([5, 1])
  })

  it('la cantidad nueva tampoco supera el stock ni el máximo por línea', () => {
    expect(cartReducer(twoLines, { type: 'setQuantity', lineId: negroM, quantity: 3 }).lines[1].quantity).toBe(2)
    expect(cartReducer(twoLines, { type: 'setQuantity', lineId: marinoL, quantity: 50 }).lines[0].quantity).toBe(
      MAX_QUANTITY_PER_LINE,
    )
  })

  it('ignora cantidades menores a 1 o con decimales: para sacar una línea está "quitar"', () => {
    for (const quantity of [0, -3, 2.5]) {
      expect(cartReducer(twoLines, { type: 'setQuantity', lineId: marinoL, quantity }), String(quantity)).toEqual(
        twoLines,
      )
    }
  })

  it('ignora líneas que no están en el carrito', () => {
    expect(cartReducer(twoLines, { type: 'setQuantity', lineId: 'no-existe', quantity: 2 })).toEqual(twoLines)
    expect(cartReducer(twoLines, { type: 'remove', lineId: 'no-existe' })).toEqual(twoLines)
  })

  it('quita solo la línea indicada', () => {
    const state = cartReducer(twoLines, { type: 'remove', lineId: marinoL })
    expect(state.lines.map(getLineId)).toEqual([negroM])
  })

  it('vaciar deja el carrito sin líneas', () => {
    expect(cartReducer(twoLines, { type: 'clear' })).toEqual(EMPTY_CART)
  })
})

describe('getAvailableToAdd', () => {
  const variant = (colorId: 'negro' | 'blanco' | 'marino', size: string) => ({
    productSlug: 'remera-clasica',
    colorId,
    size,
  })

  it('para una variante que no está en el carrito es su tope', () => {
    expect(getAvailableToAdd(EMPTY_CART, variant('negro', 'M'))).toBe(2)
    expect(getAvailableToAdd(EMPTY_CART, variant('marino', 'L'))).toBe(MAX_QUANTITY_PER_LINE)
  })

  it('descuenta lo que ya está en el carrito', () => {
    expect(getAvailableToAdd(add(EMPTY_CART, 'marino', 'L', 4), variant('marino', 'L'))).toBe(6)
    expect(getAvailableToAdd(add(EMPTY_CART, 'negro', 'M', 2), variant('negro', 'M'))).toBe(0)
  })

  it('es 0 para una variante agotada', () => {
    expect(getAvailableToAdd(EMPTY_CART, variant('blanco', 'XXL'))).toBe(0)
  })
})

describe('describeCart', () => {
  it('arma cada línea con los datos que muestra el carrito', () => {
    const { items } = describeCart(add(EMPTY_CART, 'marino', 'L', 2))
    expect(items).toEqual([
      expect.objectContaining({
        lineId: 'remera-clasica:marino:L',
        name: 'Remera clásica',
        colorName: 'Azul marino',
        size: 'L',
        quantity: 2,
        unitPrice: 24900,
        lineTotal: 49800,
        maxQuantity: MAX_QUANTITY_PER_LINE,
      }),
    ])
  })

  it('el resumen suma las líneas y aplica el envío', () => {
    const { summary } = describeCart(add(add(EMPTY_CART, 'marino', 'L', 2), 'negro', 'M', 1))
    expect(summary.itemCount).toBe(3)
    expect(summary.subtotal).toBe(24900 * 3)
    expect(summary.total).toBe(24900 * 3 + SHIPPING_COST)
  })

  it('el carrito vacío no tiene líneas ni total', () => {
    const { items, summary } = describeCart(EMPTY_CART)
    expect(items).toEqual([])
    expect(summary.total).toBe(0)
  })
})
