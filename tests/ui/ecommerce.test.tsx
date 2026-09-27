import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PLACARD_SLUGS } from '../../src/data/home'
import { PRODUCTS } from '../../src/data/products'
import type { EcommerceEvent } from '../../src/lib/analytics'
import { getProductBySlug, getRelatedProducts } from '../../src/lib/catalog'
import { storageWithCart, storageWithOneTee } from '../support/carts'
import { fillValidForm } from '../support/checkoutForm'
import { renderApp } from '../support/renderApp'

type EventName = EcommerceEvent['event']
// Intersección y no Extract: algunos eventos comparten tipo ('view_item_list' | 'select_item').
type Pushed<T extends EventName> = EcommerceEvent & { event: T }

// Lo que la app dejó en el dataLayer para un evento, en orden.
const pushed = <T extends EventName>(name: T) =>
  (window.dataLayer ?? []).filter((entry): entry is Pushed<T> => entry.event === name)
const ecommerceOf = <T extends EventName>(name: T) => pushed(name).map((entry) => entry.ecommerce)
const itemIds = <T extends EventName>(name: T) =>
  pushed(name).map((entry) => entry.ecommerce.items.map((item) => item.item_id))

const drawer = () => screen.getByRole('dialog', { name: /^Carrito/ })

describe('ecommerce: listas y ficha', () => {
  it('una categoría del catálogo es una lista, con sus productos en orden', () => {
    renderApp('/tienda/camperas')
    expect(ecommerceOf('view_item_list')).toEqual([
      {
        item_list_id: 'tienda-camperas',
        item_list_name: 'Camperas',
        items: [
          expect.objectContaining({ item_id: 'campera-bomber', index: 0 }),
          expect.objectContaining({ item_id: 'campera-acolchada', index: 1 }),
        ],
      },
    ])
  })

  it('toda la tienda es una sola lista, en el orden que se ve', () => {
    renderApp('/tienda?orden=precio-asc')
    const [list] = ecommerceOf('view_item_list')
    expect(list).toMatchObject({ item_list_id: 'tienda', item_list_name: 'Toda la tienda' })
    expect(list.items).toHaveLength(PRODUCTS.length)
    expect(list.items[0]).toMatchObject({ item_name: 'Medias (pack x3)', index: 0 })
  })

  it('cambiar el orden no es ver la lista de nuevo', async () => {
    const { user } = renderApp('/tienda')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar por' }), 'Menor precio')
    expect(pushed('view_item_list')).toHaveLength(1)
  })

  it('otra categoría es otra lista', async () => {
    const { user } = renderApp('/tienda/camperas')
    await user.click(within(screen.getByRole('navigation', { name: 'Categorías de la tienda' })).getByRole('link', { name: 'Buzos' }))
    expect(pushed('view_item_list').map((entry) => entry.ecommerce.item_list_id)).toEqual(['tienda-camperas', 'tienda-buzos'])
  })

  it('elegir una tarjeta es select_item con la lista y la posición, y abre la ficha con view_item', async () => {
    const { user } = renderApp('/tienda/camperas')
    await user.click(screen.getByRole('link', { name: 'Campera acolchada' }))

    expect(ecommerceOf('select_item')).toEqual([
      {
        item_list_id: 'tienda-camperas',
        item_list_name: 'Camperas',
        items: [expect.objectContaining({ item_id: 'campera-acolchada', index: 1 })],
      },
    ])
    expect(ecommerceOf('view_item')).toEqual([
      {
        currency: 'ARS',
        value: 139900,
        items: [expect.objectContaining({ item_id: 'campera-acolchada', item_variant: 'Negro', price: 139900 })],
      },
    ])
  })

  it('la portada muestra "Un placard resuelto" como lista', () => {
    renderApp('/')
    expect(pushed('view_item_list').map((entry) => entry.ecommerce.item_list_id)).toEqual(['placard'])
    expect(itemIds('view_item_list')).toEqual([PLACARD_SLUGS])
  })

  it('la ficha manda el producto con el color del link y la lista "Combinalo con"', () => {
    renderApp('/producto/remera-clasica?color=marino')
    const tee = getProductBySlug('remera-clasica')
    if (!tee) throw new Error('Falta la remera clásica')

    expect(ecommerceOf('view_item')[0].items).toEqual([
      {
        item_id: 'remera-clasica',
        item_name: 'Remera clásica',
        item_brand: 'basicos',
        item_category: 'Remeras',
        price: 24900,
        item_variant: 'Azul marino',
      },
    ])
    expect(pushed('view_item_list').map((entry) => entry.ecommerce.item_list_id)).toEqual(['combinalo-con'])
    expect(itemIds('view_item_list')).toEqual([getRelatedProducts(tee).map((related) => related.slug)])
  })

  it('cambiar el color en la ficha no es otra vista del producto', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(within(screen.getByRole('radiogroup', { name: 'Color' })).getByRole('radio', { name: 'Azul marino' }))
    expect(pushed('view_item')).toHaveLength(1)
  })
})

describe('ecommerce: carrito', () => {
  it('agregar manda add_to_cart con color, talle y cantidad; el carrito que se abre solo no es view_cart', async () => {
    const { user } = renderApp('/producto/remera-clasica?color=marino')
    await user.click(screen.getByRole('radio', { name: 'L' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    expect(ecommerceOf('add_to_cart')).toEqual([
      {
        currency: 'ARS',
        value: 24900,
        items: [expect.objectContaining({ item_id: 'remera-clasica', item_variant: 'Azul marino', item_size: 'L', quantity: 1 })],
      },
    ])
    expect(drawer()).toBeVisible()
    expect(pushed('view_cart')).toHaveLength(0)
  })

  it('sin talle no se agrega nada, y no se mide', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(pushed('add_to_cart')).toHaveLength(0)
  })

  it('en el carrito, sumar, restar y quitar miden cuánto cambió', async () => {
    const { user } = renderApp('/', storageWithOneTee())
    await user.click(screen.getByRole('button', { name: 'Carrito (1)' }))
    await user.click(within(drawer()).getByRole('button', { name: 'Sumar una unidad de Remera clásica' }))
    await user.click(within(drawer()).getByRole('button', { name: 'Sumar una unidad de Remera clásica' }))
    await user.click(within(drawer()).getByRole('button', { name: 'Restar una unidad de Remera clásica' }))
    await user.click(within(drawer()).getByRole('button', { name: 'Quitar Remera clásica, Azul marino, talle L' }))

    const quantitiesAndValues = (name: 'add_to_cart' | 'remove_from_cart') =>
      pushed(name).map(({ ecommerce }) => [ecommerce.items[0].quantity, ecommerce.value])
    expect(quantitiesAndValues('add_to_cart')).toEqual([
      [1, 24900],
      [1, 24900],
    ])
    expect(quantitiesAndValues('remove_from_cart')).toEqual([
      [1, 24900],
      [2, 49800],
    ])
  })

  it('abrir el carrito desde el encabezado es view_cart con todo el carrito', async () => {
    const { user } = renderApp('/', storageWithCart())
    await user.click(screen.getByRole('button', { name: 'Carrito (3)' }))
    expect(ecommerceOf('view_cart')).toEqual([
      {
        currency: 'ARS',
        value: 119700,
        items: [
          expect.objectContaining({ item_id: 'remera-clasica', item_variant: 'Azul marino', item_size: 'L', quantity: 2 }),
          expect.objectContaining({ item_id: 'buzo-capucha', item_variant: 'Gris melange', item_size: 'M', quantity: 1 }),
        ],
      },
    ])
  })

  it('abrir el carrito vacío no es view_cart', async () => {
    const { user } = renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Carrito (0)' }))
    expect(pushed('view_cart')).toHaveLength(0)
  })
})

describe('ecommerce: checkout y compra', () => {
  it('entrar al checkout con productos es begin_checkout', () => {
    renderApp('/checkout', storageWithCart())
    expect(ecommerceOf('begin_checkout')).toEqual([
      {
        currency: 'ARS',
        value: 119700,
        items: [
          expect.objectContaining({ item_id: 'remera-clasica', quantity: 2 }),
          expect.objectContaining({ item_id: 'buzo-capucha', quantity: 1 }),
        ],
      },
    ])
  })

  it('con el carrito vacío no hay begin_checkout', () => {
    renderApp('/checkout')
    expect(pushed('begin_checkout')).toHaveLength(0)
  })

  it('confirmar el pedido es purchase con su número, y vaciar el carrito después no es sacar productos', async () => {
    const { user } = renderApp('/checkout', storageWithCart())
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    const orderNumber = screen.getByText(/^B-[A-HJKMNP-Z2-9]{6}$/).textContent
    expect(ecommerceOf('purchase')).toEqual([
      {
        transaction_id: orderNumber,
        currency: 'ARS',
        value: 119700,
        shipping: 6900,
        items: [
          expect.objectContaining({ item_id: 'remera-clasica', quantity: 2 }),
          expect.objectContaining({ item_id: 'buzo-capucha', quantity: 1 }),
        ],
      },
    ])
    expect(pushed('remove_from_cart')).toHaveLength(0)
  })

  it('un pedido con errores no es purchase', async () => {
    const { user } = renderApp('/checkout', storageWithCart())
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(pushed('purchase')).toHaveLength(0)
  })
})
