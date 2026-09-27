import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../support/renderApp'

const addButton = () => screen.getByRole('button', { name: 'Agregar al carrito' })
const cartButton = () => screen.getByRole('button', { name: /^Carrito \(\d+\)$/ })
// La ficha tiene su selector de color; las tarjetas de "Combinalo con" tienen los suyos.
const colorOption = (name: string) => within(screen.getByRole('radiogroup', { name: 'Color' })).getByRole('radio', { name })

describe('ficha de producto', () => {
  it('sin talle elegido no agrega y pide elegir uno', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(addButton())
    expect(screen.getByRole('alert')).toHaveTextContent('Elegí un talle.')
    expect(cartButton()).toHaveTextContent('Carrito (0)')
  })

  it('con color y talle elegidos agrega la prenda y abre el carrito', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(colorOption('Azul marino'))
    await user.click(screen.getByRole('radio', { name: 'L' }))
    await user.click(addButton())

    const drawer = screen.getByRole('dialog', { name: 'Carrito (1)' })
    expect(within(drawer).getByText('Remera clásica')).toBeInTheDocument()
    expect(within(drawer).getByText('Azul marino, talle L')).toBeInTheDocument()
    expect(cartButton()).toHaveTextContent('Carrito (1)')
  })

  it('los talles agotados del color elegido no se pueden elegir', async () => {
    const { user } = renderApp('/producto/remera-clasica')
    await user.click(colorOption('Blanco'))
    expect(screen.getByRole('radio', { name: 'XXL, sin stock' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'XL' })).toBeEnabled()
  })

  it('avisa cuando quedan pocas unidades del talle elegido', async () => {
    const { user } = renderApp('/producto/remera-clasica?color=negro')
    await user.click(screen.getByRole('radio', { name: 'M' }))
    expect(screen.getByText('Quedan 2 en talle M.')).toBeInTheDocument()
  })

  it('el color del link llega elegido', () => {
    renderApp('/producto/remera-clasica?color=marino')
    expect(colorOption('Azul marino')).toBeChecked()
    expect(screen.getByText('Color: Azul marino')).toBeInTheDocument()
  })

  it('cuando ya está todo el stock del talle en el carrito, lo avisa en vez de agregar', async () => {
    const { user } = renderApp('/producto/remera-clasica?color=negro')
    await user.click(screen.getByRole('radio', { name: 'M' }))
    await user.click(addButton())
    await user.click(screen.getByRole('button', { name: 'Cerrar carrito' }))
    await user.click(addButton())
    await user.click(screen.getByRole('button', { name: 'Cerrar carrito' }))
    await user.click(addButton())

    expect(screen.getByRole('alert')).toHaveTextContent('Ya tenés en el carrito todas las unidades de este talle.')
    expect(cartButton()).toHaveTextContent('Carrito (2)')
  })

  it('un producto que no existe muestra la página de error', () => {
    renderApp('/producto/remera-que-no-existe')
    expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
  })
})
