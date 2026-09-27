import { act, render, screen, within } from '@testing-library/react'
import { StrictMode } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { CartProvider } from '../../src/context/CartProvider'
import { routes } from '../../src/routes'
import { memoryStorage } from '../support/memoryStorage'
import { renderApp } from '../support/renderApp'

const pageViews = () => (window.dataLayer ?? []).filter((entry) => entry.event === 'page_view')
const url = (path: string) => `${window.location.origin}${path}`

describe('visitas (page_view)', () => {
  it('cuenta la primera página con su URL completa y su título', () => {
    renderApp('/tienda/camperas?orden=precio-asc')
    expect(pageViews()).toEqual([
      { event: 'page_view', page_location: url('/tienda/camperas?orden=precio-asc'), page_title: 'Camperas | basicos' },
    ])
  })

  it('cada página nueva es otra visita, con el título de esa página', async () => {
    const { user } = renderApp('/tienda/camperas')
    await user.click(screen.getByRole('link', { name: 'Campera bomber' }))

    expect(pageViews()).toHaveLength(2)
    expect(pageViews()[1]).toEqual({
      event: 'page_view',
      page_location: expect.stringContaining(url('/producto/campera-bomber')),
      page_title: 'Campera bomber | basicos',
    })
  })

  it('volver a una página ya vista es otra visita', async () => {
    const { user, router } = renderApp('/tienda/camperas')
    await user.click(screen.getByRole('link', { name: 'Campera bomber' }))
    // Como el botón "atrás" del navegador. act espera a que React termine de mostrar la página.
    await act(() => router.navigate(-1))

    expect(pageViews().map((view) => view.page_title)).toEqual([
      'Camperas | basicos',
      'Campera bomber | basicos',
      'Camperas | basicos',
    ])
  })

  it('cambiar el color en la ficha no es otra visita', async () => {
    const { user, router } = renderApp('/producto/remera-clasica')
    await user.click(within(screen.getByRole('radiogroup', { name: 'Color' })).getByRole('radio', { name: 'Azul marino' }))

    expect(router.state.location.search).toBe('?color=marino')
    expect(pageViews()).toHaveLength(1)
  })

  it('cambiar el orden del catálogo no es otra visita', async () => {
    const { user, router } = renderApp('/tienda')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar por' }), 'Menor precio')

    expect(router.state.location.search).toBe('?orden=precio-asc')
    expect(pageViews()).toHaveLength(1)
  })

  it('con StrictMode (desarrollo) la página se cuenta una sola vez', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(
      <StrictMode>
        <CartProvider storage={memoryStorage()}>
          <RouterProvider router={router} />
        </CartProvider>
      </StrictMode>,
    )
    expect(pageViews()).toHaveLength(1)
  })
})
