import { describe, expect, it } from 'vitest'
import type { Product } from '../src/data/products'
import {
  ADD_TO_CART_ERRORS,
  COLOR_LOCATIONS,
  ITEM_LISTS,
  buildAddToCartError,
  buildCartEvent,
  buildCartLineChange,
  buildCheckoutError,
  buildPageView,
  buildPurchase,
  buildSelectColor,
  buildSelectItem,
  buildSortCatalog,
  buildViewItem,
  buildViewItemList,
  buildViewSizeGuide,
  catalogList,
  pushToDataLayer,
  toAnalyticsItem,
} from '../src/lib/analytics'
import { EMPTY_CART, cartReducer, describeCart, getLineId, type CartState } from '../src/lib/cart'
import { getCategory, getProductBySlug } from '../src/lib/catalog'
import { createOrder, type CheckoutValues } from '../src/lib/checkout'

const ORIGIN = 'https://tiendabasicosecommerce.vercel.app'

function product(slug: string): Product {
  const found = getProductBySlug(slug)
  if (!found) throw new Error(`El catálogo no tiene ${slug}`)
  return found
}

const tee = product('remera-clasica')
const hoodie = product('buzo-capucha')

// Remera clásica azul marino L.
const teeLine = { productSlug: 'remera-clasica', colorId: 'marino', size: 'L' } as const
const teeLineId = getLineId(teeLine)
const withTees = (quantity: number): CartState => cartReducer(EMPTY_CART, { type: 'add', ...teeLine, quantity })

describe('buildPageView', () => {
  it('arma la URL completa, con los parámetros de la ruta, y el título de la página', () => {
    expect(buildPageView(ORIGIN, '/tienda?orden=precio-asc', 'Toda la tienda | basicos')).toEqual({
      event: 'page_view',
      page_location: `${ORIGIN}/tienda?orden=precio-asc`,
      page_title: 'Toda la tienda | basicos',
    })
  })
})

describe('toAnalyticsItem', () => {
  it('sin detalles manda lo que es del producto: id, nombre, marca, categoría y precio', () => {
    expect(toAnalyticsItem(tee)).toEqual({
      item_id: 'remera-clasica',
      item_name: 'Remera clásica',
      item_brand: 'basicos',
      item_category: 'Remeras',
      price: 24900,
    })
  })

  it('el color va en item_variant con su nombre, y el talle en item_size, aparte', () => {
    expect(toAnalyticsItem(tee, { colorId: 'marino', size: 'L', quantity: 2, index: 0 })).toMatchObject({
      item_variant: 'Azul marino',
      item_size: 'L',
      quantity: 2,
      index: 0,
    })
  })
})

describe('listas de productos', () => {
  it('toda la tienda y cada categoría son listas distintas', () => {
    expect(catalogList(null)).toEqual({ item_list_id: 'tienda', item_list_name: 'Toda la tienda' })
    const camperas = getCategory('camperas')
    if (!camperas) throw new Error('Falta la categoría camperas')
    expect(catalogList(camperas)).toEqual({ item_list_id: 'tienda-camperas', item_list_name: 'Camperas' })
  })

  it('view_item_list manda los productos con su posición, desde 0', () => {
    const event = buildViewItemList(ITEM_LISTS.placard, [tee, hoodie])
    expect(event).toEqual({
      event: 'view_item_list',
      ecommerce: {
        item_list_id: 'placard',
        item_list_name: 'Un placard resuelto',
        items: [toAnalyticsItem(tee, { index: 0 }), toAnalyticsItem(hoodie, { index: 1 })],
      },
    })
  })

  it('select_item manda el producto elegido con la lista y la posición', () => {
    expect(buildSelectItem(ITEM_LISTS.related, hoodie, 3)).toEqual({
      event: 'select_item',
      ecommerce: { item_list_id: 'combinalo-con', item_list_name: 'Combinalo con', items: [toAnalyticsItem(hoodie, { index: 3 })] },
    })
  })
})

describe('buildViewItem', () => {
  it('manda el producto con el color que se ve y su precio como valor', () => {
    expect(buildViewItem(tee, 'marino')).toEqual({
      event: 'view_item',
      ecommerce: { currency: 'ARS', value: 24900, items: [toAnalyticsItem(tee, { colorId: 'marino' })] },
    })
  })
})

describe('buildCartLineChange', () => {
  it('una prenda nueva es add_to_cart con cantidad y valor', () => {
    expect(buildCartLineChange(EMPTY_CART, withTees(1), teeLineId)).toEqual({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'ARS',
        value: 24900,
        items: [toAnalyticsItem(tee, { colorId: 'marino', size: 'L', quantity: 1 })],
      },
    })
  })

  it('bajar la cantidad es remove_from_cart por lo que se sacó', () => {
    const event = buildCartLineChange(withTees(3), withTees(1), teeLineId)
    expect(event?.event).toBe('remove_from_cart')
    expect(event?.ecommerce).toMatchObject({ value: 49800, items: [{ quantity: 2 }] })
  })

  it('quitar la línea es remove_from_cart por toda su cantidad', () => {
    const before = withTees(2)
    const after = cartReducer(before, { type: 'remove', lineId: teeLineId })
    expect(buildCartLineChange(before, after, teeLineId)?.ecommerce).toMatchObject({
      value: 49800,
      items: [{ item_id: 'remera-clasica', quantity: 2 }],
    })
  })

  it('si el stock no deja agregar, no hay evento: se mide lo que cambió de verdad', () => {
    // Remera clásica negra M: quedan 2 en stock.
    const lastTwo = { productSlug: 'remera-clasica', colorId: 'negro', size: 'M' } as const
    const before = cartReducer(EMPTY_CART, { type: 'add', ...lastTwo, quantity: 2 })
    const after = cartReducer(before, { type: 'add', ...lastTwo, quantity: 1 })
    expect(buildCartLineChange(before, after, getLineId(lastTwo))).toBeNull()
  })

  it('una línea que no está en el carrito no genera evento', () => {
    expect(buildCartLineChange(withTees(1), withTees(1), 'remera-clasica:negro:XL')).toBeNull()
  })
})

describe('buildCartEvent', () => {
  it('manda todo el carrito con el subtotal como valor', () => {
    const cart = cartReducer(withTees(2), { type: 'add', productSlug: 'buzo-capucha', colorId: 'gris', size: 'M', quantity: 1 })
    const { items, summary } = describeCart(cart)
    expect(buildCartEvent('begin_checkout', items, summary)).toEqual({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'ARS',
        value: 119700,
        items: [
          toAnalyticsItem(tee, { colorId: 'marino', size: 'L', quantity: 2 }),
          toAnalyticsItem(hoodie, { colorId: 'gris', size: 'M', quantity: 1 }),
        ],
      },
    })
  })
})

describe('buildPurchase', () => {
  const customer: CheckoutValues = {
    email: 'lucas.fernandez@example.com',
    firstName: 'Lucas',
    lastName: 'Fernández',
    phone: '11 4567-8910',
    address: 'Av. Corrientes 1234',
    apartment: '',
    city: 'Buenos Aires',
    province: 'Ciudad Autónoma de Buenos Aires',
    postalCode: 'C1043AAZ',
    paymentMethod: 'mercadopago',
  }

  it('usa el número de pedido como transaction_id y manda el envío aparte del valor', () => {
    const order = createOrder(withTees(2), customer, { now: () => new Date('2026-09-27T12:00:00Z'), random: () => 0 })
    expect(buildPurchase(order)).toEqual({
      event: 'purchase',
      ecommerce: {
        transaction_id: order.number,
        currency: 'ARS',
        value: 49800,
        shipping: 6900,
        items: [toAnalyticsItem(tee, { colorId: 'marino', size: 'L', quantity: 2 })],
      },
    })
  })

  it('no manda datos personales del comprador', () => {
    const order = createOrder(withTees(1), customer, { now: () => new Date(), random: Math.random })
    const payload = JSON.stringify(buildPurchase(order))
    for (const value of [customer.email, customer.firstName, customer.lastName, customer.phone, customer.address]) {
      expect(payload).not.toContain(value)
    }
  })
})

describe('interacciones', () => {
  it('select_color en la ficha manda el producto, el nombre del color y dónde se eligió', () => {
    expect(buildSelectColor(tee, 'marino', { location: COLOR_LOCATIONS.productPage })).toEqual({
      event: 'select_color',
      interaction: { product_id: 'remera-clasica', color: 'Azul marino', location: 'ficha' },
    })
  })

  it('select_color en una tarjeta suma la lista donde está la tarjeta', () => {
    expect(buildSelectColor(tee, 'negro', { location: COLOR_LOCATIONS.productCard, list: ITEM_LISTS.placard })).toEqual({
      event: 'select_color',
      interaction: { product_id: 'remera-clasica', color: 'Negro', location: 'tarjeta', list_id: 'placard' },
    })
  })

  it('view_size_guide manda el producto', () => {
    expect(buildViewSizeGuide(hoodie)).toEqual({ event: 'view_size_guide', interaction: { product_id: 'buzo-capucha' } })
  })

  it('add_to_cart_error manda el motivo: sin talle o sin stock', () => {
    expect(buildAddToCartError(tee, ADD_TO_CART_ERRORS.sizeRequired).interaction).toEqual({
      product_id: 'remera-clasica',
      reason: 'sin_talle',
    })
    expect(buildAddToCartError(tee, ADD_TO_CART_ERRORS.noStock).interaction).toEqual({
      product_id: 'remera-clasica',
      reason: 'sin_stock',
    })
  })

  it('sort_catalog manda la lista y el orden elegido', () => {
    expect(buildSortCatalog(catalogList(null), 'precio-asc')).toEqual({
      event: 'sort_catalog',
      interaction: { list_id: 'tienda', sort_order: 'precio-asc' },
    })
  })

  it('checkout_error manda solo los nombres de los campos, en el orden en que llegan', () => {
    expect(buildCheckoutError(['email', 'postalCode'])).toEqual({
      event: 'checkout_error',
      interaction: { error_fields: 'email,postalCode' },
    })
  })
})

describe('pushToDataLayer', () => {
  const pageView = buildPageView(ORIGIN, '/', 'basicos | Ropa lisa para hombre')

  it('crea el dataLayer cuando GTM no está cargado (local, previews, tests)', () => {
    pushToDataLayer(pageView)
    expect(window.dataLayer).toEqual([pageView])
  })

  it('agrega al final, sin pisar lo que ya dejó GTM', () => {
    window.dataLayer = [{ event: 'gtm.js' }]
    pushToDataLayer(pageView)
    expect(window.dataLayer).toEqual([{ event: 'gtm.js' }, pageView])
  })

  it('antes de cada evento de ecommerce vacía el anterior, para que GTM no mezcle productos', () => {
    const viewItem = buildViewItem(tee, 'negro')
    pushToDataLayer(viewItem)
    expect(window.dataLayer).toEqual([{ ecommerce: null }, viewItem])
  })

  it('antes de cada interacción vacía la anterior: GTM guarda los parámetros entre eventos', () => {
    const sizeGuide = buildViewSizeGuide(tee)
    pushToDataLayer(sizeGuide)
    expect(window.dataLayer).toEqual([{ interaction: null }, sizeGuide])
  })
})
