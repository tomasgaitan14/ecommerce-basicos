import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { InteractionEvent } from '../../src/lib/analytics'
import { storageWithCart } from '../support/carts'
import { fillValidForm } from '../support/checkoutForm'
import { renderApp } from '../support/renderApp'

type EventName = InteractionEvent['event']

// Los parámetros de cada interacción que la app dejó en el dataLayer, en orden.
const interactions = (name: EventName) =>
  (window.dataLayer ?? [])
    .filter((entry): entry is InteractionEvent => entry.event === name)
    .map((entry) => entry.interaction)

const addButton = () => screen.getByRole('button', { name: 'Agregar al carrito' })
const closeCart = () => screen.getByRole('button', { name: 'Cerrar carrito' })

describe('interacciones: color', () => {
  it('cambiar el color en la ficha es select_color con el producto y el color', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(within(screen.getByRole('radiogroup', { name: 'Color' })).getByRole('radio', { name: 'Azul marino' }))
    expect(interactions('select_color')).toEqual([{ product_id: 'remera-clasica', color: 'Azul marino', location: 'ficha' }])
  })

  it('cambiar el color en una tarjeta es select_color con la lista de la tarjeta', async () => {
    const { user } = renderApp('/tienda/camperas')
    const swatches = screen.getByRole('radiogroup', { name: 'Color de Campera acolchada' })
    await user.click(within(swatches).getByRole('radio', { name: 'Azul marino' }))
    expect(interactions('select_color')).toEqual([
      { product_id: 'campera-acolchada', color: 'Azul marino', location: 'tarjeta', list_id: 'tienda-camperas' },
    ])
  })
})

describe('interacciones: ficha', () => {
  it('abrir la guía de talles es view_size_guide', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(screen.getByRole('button', { name: 'Guía de talles' }))
    expect(interactions('view_size_guide')).toEqual([{ product_id: 'remera-clasica' }])
  })

  it('agregar sin talle es add_to_cart_error sin_talle', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(addButton())
    expect(interactions('add_to_cart_error')).toEqual([{ product_id: 'remera-clasica', reason: 'sin_talle' }])
  })

  it('agregar cuando ya está todo el stock del talle en el carrito es add_to_cart_error sin_stock', async () => {
    // Remera clásica negra M: quedan 2.
    const { user } = renderApp('/producto/remera-clasica?color=negro')
    await user.click(screen.getByRole('radio', { name: 'M' }))
    await user.click(addButton())
    await user.click(closeCart())
    await user.click(addButton())
    await user.click(closeCart())
    await user.click(addButton())
    expect(interactions('add_to_cart_error')).toEqual([{ product_id: 'remera-clasica', reason: 'sin_stock' }])
  })
})

describe('interacciones: catálogo y checkout', () => {
  it('cambiar el orden es sort_catalog con la lista y el orden elegido', async () => {
    const { user } = renderApp('/tienda/remeras')
    const sort = screen.getByRole('combobox', { name: 'Ordenar por' })
    await user.selectOptions(sort, 'Menor precio')
    await user.selectOptions(sort, 'Destacados')
    expect(interactions('sort_catalog')).toEqual([
      { list_id: 'tienda-remeras', sort_order: 'precio-asc' },
      { list_id: 'tienda-remeras', sort_order: 'destacados' },
    ])
  })

  it('enviar el checkout con errores es checkout_error con los campos, sin lo que se escribió', async () => {
    const { user } = renderApp('/checkout', storageWithCart())
    await user.type(screen.getByLabelText('Email'), 'lucas@')
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(interactions('checkout_error')).toEqual([
      { error_fields: 'email,firstName,lastName,phone,address,city,province,postalCode' },
    ])
    expect(JSON.stringify(window.dataLayer)).not.toContain('lucas@')
  })

  it('un pedido válido no es checkout_error', async () => {
    const { user } = renderApp('/checkout', storageWithCart())
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(interactions('checkout_error')).toHaveLength(0)
  })
})
