import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../support/renderApp'

describe('portada', () => {
  it('la franja muestra la remera clásica en sus ocho colores', () => {
    renderApp('/')
    const band = screen.getByRole('list', { name: 'Remera clásica en todos sus colores' })
    expect(within(band).getAllByRole('link')).toHaveLength(8)
  })

  it('cada color de la franja lleva a la ficha con ese color elegido', async () => {
    const { user } = renderApp('/')
    await user.click(screen.getByRole('link', { name: 'Remera clásica en Bordó' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Remera clásica' })).toBeInTheDocument()
    expect(screen.getByText('Color: Bordó')).toBeInTheDocument()
  })

  it('el placard muestra sus seis prendas', () => {
    renderApp('/')
    const placard = screen.getByRole('region', { name: 'Un placard resuelto' })
    expect(within(placard).getAllByRole('article')).toHaveLength(6)
    expect(within(placard).getByRole('link', { name: 'Campera bomber' })).toBeInTheDocument()
  })

  it('las categorías llevan al catálogo filtrado', async () => {
    const { user } = renderApp('/')
    const categories = screen.getByRole('region', { name: 'Categorías' })
    await user.click(within(categories).getByRole('link', { name: /^Bermudas/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Bermudas' })).toBeInTheDocument()
  })
})
