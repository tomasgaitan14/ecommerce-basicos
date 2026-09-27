import type { ColorId } from './data/colors'

// Todas las URLs de la tienda salen de acá.
export const PATHS = {
  home: '/',
  shop: '/tienda',
  category: (slug: string) => `/tienda/${slug}`,
  product: (slug: string, colorId?: ColorId) => (colorId ? `/producto/${slug}?color=${colorId}` : `/producto/${slug}`),
  checkout: '/checkout',
  orderConfirmed: '/pedido/confirmado',
}

// Parámetro de la ficha con el color elegido.
export const COLOR_PARAM = 'color'
// Parámetro del catálogo con el orden elegido.
export const SORT_PARAM = 'orden'
