import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { CatalogPage } from './pages/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ErrorPage } from './pages/ErrorPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { ProductPage } from './pages/ProductPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tienda', element: <CatalogPage /> },
      { path: 'tienda/:categoria', element: <CatalogPage /> },
      { path: 'producto/:slug', element: <ProductPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'pedido/confirmado', element: <OrderConfirmationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
