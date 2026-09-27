import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { CartProvider } from '../../src/context/CartProvider'
import { routes } from '../../src/routes'
import { memoryStorage } from './memoryStorage'

// Monta la app completa en una ruta, con el carrito guardado en memoria.
export function renderApp(path: string, storage = memoryStorage()) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(
    <CartProvider storage={storage}>
      <RouterProvider router={router} />
    </CartProvider>,
  )
  return { user, router, storage }
}
