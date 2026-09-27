import { describe, expect, it } from 'vitest'
import { EMPTY_CART, cartReducer, type CartState } from '../src/lib/cart'
import { CART_STORAGE_KEY, loadCart, saveCart } from '../src/lib/cartStorage'
import { memoryStorage } from './support/memoryStorage'

function blockedStorage(error: Error) {
  return {
    getItem: (): string | null => {
      throw error
    },
    setItem: () => {
      throw error
    },
  }
}

const stored = (lines: unknown) => memoryStorage({ [CART_STORAGE_KEY]: JSON.stringify({ lines }) })

const cartWith = (...lines: [string, 'negro' | 'marino', string, number][]): CartState =>
  lines.reduce(
    (cart, [productSlug, colorId, size, quantity]) =>
      cartReducer(cart, { type: 'add', productSlug, colorId, size, quantity }),
    EMPTY_CART,
  )

describe('loadCart y saveCart', () => {
  it('lo que se guarda se recupera igual', () => {
    const storage = memoryStorage()
    const cart = cartWith(['remera-clasica', 'marino', 'L', 2], ['pantalon-chino', 'negro', '42', 1])
    saveCart(storage, cart)
    expect(loadCart(storage)).toEqual(cart)
  })

  it('sin nada guardado arranca con el carrito vacío', () => {
    expect(loadCart(memoryStorage())).toEqual(EMPTY_CART)
  })

  it('con un JSON roto arranca vacío en vez de romper', () => {
    expect(loadCart(memoryStorage({ [CART_STORAGE_KEY]: '{"lines": [' }))).toEqual(EMPTY_CART)
  })

  it('con datos que no tienen forma de carrito arranca vacío', () => {
    for (const value of ['null', '42', '"texto"', '[]', '{"lines": "x"}']) {
      expect(loadCart(memoryStorage({ [CART_STORAGE_KEY]: value })), value).toEqual(EMPTY_CART)
    }
  })

  it('descarta las líneas mal formadas y conserva las válidas', () => {
    const storage = stored([
      { productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 2 },
      { productSlug: 'remera-clasica', colorId: 'fucsia', size: 'L', quantity: 1 },
      { productSlug: 'remera-clasica', colorId: 'negro', size: 'L', quantity: '3' },
      { productSlug: 42, colorId: 'negro', size: 'L', quantity: 1 },
      null,
    ])
    expect(loadCart(storage)).toEqual(cartWith(['remera-clasica', 'marino', 'L', 2]))
  })

  it('descarta productos o variantes que ya no existen', () => {
    const storage = stored([
      { productSlug: 'remera-discontinuada', colorId: 'negro', size: 'M', quantity: 1 },
      { productSlug: 'remera-clasica', colorId: 'marino', size: '42', quantity: 1 },
    ])
    expect(loadCart(storage)).toEqual(EMPTY_CART)
  })

  it('recorta cantidades al stock actual y junta líneas repetidas', () => {
    const storage = stored([
      { productSlug: 'remera-clasica', colorId: 'negro', size: 'M', quantity: 9 },
      { productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 3 },
      { productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 2 },
    ])
    expect(loadCart(storage).lines.map((line) => [line.colorId, line.size, line.quantity])).toEqual([
      ['negro', 'M', 2],
      ['marino', 'L', 5],
    ])
  })

  it('si el navegador bloquea el almacenamiento, arranca vacío y guardar no rompe', () => {
    const storage = blockedStorage(new DOMException('Acceso denegado', 'SecurityError'))
    expect(loadCart(storage)).toEqual(EMPTY_CART)
    expect(() => saveCart(storage, cartWith(['remera-clasica', 'marino', 'L', 1]))).not.toThrow()
  })

  it('no oculta errores que no son del almacenamiento', () => {
    const storage = blockedStorage(new TypeError('bug en otro lado'))
    expect(() => loadCart(storage)).toThrow(TypeError)
    expect(() => saveCart(storage, EMPTY_CART)).toThrow(TypeError)
  })
})
