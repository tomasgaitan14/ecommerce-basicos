import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { storageWithOneTee } from '../support/carts'
import { renderApp } from '../support/renderApp'

async function openCart() {
  const app = renderApp('/', storageWithOneTee())
  await app.user.click(screen.getByRole('button', { name: 'Carrito (1)' }))
  return { ...app, drawer: screen.getByRole('dialog', { name: /^Carrito/ }) }
}

describe('carrito lateral', () => {
  it('sumar una unidad actualiza la cantidad y el subtotal', async () => {
    const { user, drawer } = await openCart()
    await user.click(within(drawer).getByRole('button', { name: 'Sumar una unidad de Remera clásica' }))

    expect(within(drawer).getByRole('group', { name: 'Cantidad de Remera clásica' })).toHaveTextContent('2')
    // Testing Library normaliza los espacios del DOM: el espacio no separable de Intl pasa a ser común.
    expect(within(drawer).getAllByText('$ 49.800').length).toBeGreaterThan(0)
  })

  it('quitar la última prenda deja el carrito vacío y el foco en "Cerrar"', async () => {
    const { user, drawer } = await openCart()
    await user.click(within(drawer).getByRole('button', { name: 'Quitar Remera clásica, Azul marino, talle L' }))

    expect(within(drawer).getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(within(drawer).getByRole('button', { name: 'Cerrar carrito' })).toHaveFocus()
  })
})

describe('menú mobile', () => {
  it('el botón abre y cierra el menú, y elegir una categoría lo cierra', async () => {
    const { user } = renderApp('/')
    const toggle = screen.getByRole('button', { name: 'Menú' })
    const menu = document.getElementById(toggle.getAttribute('aria-controls') ?? '')

    expect(menu).not.toBeNull()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(menu).not.toBeVisible()

    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true')
    expect(menu).toBeVisible()

    await user.click(within(menu as HTMLElement).getByRole('link', { name: 'Bermudas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Bermudas' })).toBeInTheDocument()
    expect(menu).not.toBeVisible()
  })
})
