import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../src/data/products'
import { renderApp } from '../support/renderApp'

const productNames = () =>
  within(screen.getByRole('list', { name: 'Productos' }))
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)

describe('catálogo', () => {
  it('sin categoría muestra toda la tienda', () => {
    renderApp('/tienda')
    expect(screen.getByRole('heading', { level: 1, name: 'Toda la tienda' })).toBeInTheDocument()
    expect(screen.getByText(`${PRODUCTS.length} productos`)).toBeInTheDocument()
    expect(productNames()).toHaveLength(PRODUCTS.length)
  })

  it('con una categoría muestra solo sus prendas', () => {
    renderApp('/tienda/camperas')
    expect(screen.getByRole('heading', { level: 1, name: 'Camperas' })).toBeInTheDocument()
    expect(screen.getByText('2 productos')).toBeInTheDocument()
    expect(productNames()).toEqual(['Campera bomber', 'Campera acolchada'])
  })

  it('ordena por precio y guarda el orden en la URL', async () => {
    const { user, router } = renderApp('/tienda')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar por' }), 'Menor precio')
    expect(productNames()[0]).toBe('Medias (pack x3)')
    expect(router.state.location.search).toBe('?orden=precio-asc')
  })

  it('respeta el orden que viene en el link', () => {
    renderApp('/tienda/remeras?orden=precio-desc')
    expect(productNames()).toEqual(['Remera pesada', 'Remera manga larga', 'Remera clásica', 'Musculosa'])
    expect(screen.getByRole('combobox', { name: 'Ordenar por' })).toHaveValue('precio-desc')
  })

  it('una categoría que no existe muestra la página de error', () => {
    renderApp('/tienda/zapatillas')
    expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
  })
})
