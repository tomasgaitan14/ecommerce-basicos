import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY } from '../../src/lib/cartStorage'
import { memoryStorage } from '../support/memoryStorage'
import { renderApp } from '../support/renderApp'

// Dos remeras clásicas azul marino L y un buzo con capucha gris M: $ 119.700 + $ 6.900 de envío.
const storageWithCart = () =>
  memoryStorage({
    [CART_STORAGE_KEY]: JSON.stringify({
      lines: [
        { productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 2 },
        { productSlug: 'buzo-capucha', colorId: 'gris', size: 'M', quantity: 1 },
      ],
    }),
  })

async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Email'), 'lucas.fernandez@example.com')
  await user.type(screen.getByLabelText('Nombre'), 'Lucas')
  await user.type(screen.getByLabelText('Apellido'), 'Fernández')
  await user.type(screen.getByLabelText('Teléfono'), '11 4567-8910')
  await user.type(screen.getByLabelText('Calle y número'), 'Av. Corrientes 1234')
  await user.type(screen.getByLabelText('Localidad'), 'Buenos Aires')
  await user.selectOptions(screen.getByLabelText('Provincia'), 'Ciudad Autónoma de Buenos Aires')
  await user.type(screen.getByLabelText('Código postal'), 'C1043AAZ')
}

describe('checkout', () => {
  it('con el carrito vacío no muestra el formulario y ofrece volver a la tienda', () => {
    renderApp('/checkout')
    // El carrito lateral (cerrado) también tiene su mensaje de vacío: se busca en la página.
    const main = screen.getByRole('main')
    expect(within(main).getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
    expect(within(main).getByRole('link', { name: 'Ver la tienda' })).toBeInTheDocument()
  })

  it('el resumen muestra las prendas, el envío y el total', () => {
    renderApp('/checkout', storageWithCart())
    const summary = screen.getByRole('region', { name: 'Resumen del pedido' })
    expect(within(summary).getByText('Remera clásica')).toBeInTheDocument()
    expect(within(summary).getByText('Azul marino, talle L, 2 unidades')).toBeInTheDocument()
    // Testing Library normaliza los espacios del DOM: el espacio no separable de Intl pasa a ser común.
    expect(within(summary).getByText('$ 126.600')).toBeInTheDocument()
  })

  it('enviado vacío marca cada campo y lleva el foco al primero', async () => {
    const { user } = renderApp('/checkout', storageWithCart())
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Ingresá tu email.')
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Código postal')).toHaveAccessibleDescription('Ingresá el código postal.')
    expect(screen.getByLabelText('Piso y departamento (opcional)')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('un pedido válido lleva a la confirmación y vacía el carrito', async () => {
    const { user } = renderApp('/checkout', storageWithCart())
    await fillValidForm(user)
    await user.click(screen.getByRole('radio', { name: 'Transferencia bancaria' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Pedido confirmado' })).toBeInTheDocument()
    expect(screen.getByText(/^B-[A-HJKMNP-Z2-9]{6}$/)).toBeInTheDocument()
    expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Carrito \(\d+\)$/ })).toHaveTextContent('Carrito (0)')
  })

  it('la confirmación sin un pedido reciente ofrece volver a la tienda', () => {
    renderApp('/pedido/confirmado')
    expect(screen.getByRole('heading', { level: 1, name: 'No encontramos un pedido reciente' })).toBeInTheDocument()
  })
})
