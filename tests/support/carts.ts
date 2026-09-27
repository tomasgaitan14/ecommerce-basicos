import { CART_STORAGE_KEY } from '../../src/lib/cartStorage'
import { memoryStorage } from './memoryStorage'

// Carritos guardados de antemano, como los dejaría una visita anterior.

// Una remera clásica azul marino L: $ 24.900.
export const storageWithOneTee = () =>
  memoryStorage({
    [CART_STORAGE_KEY]: JSON.stringify({
      lines: [{ productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 1 }],
    }),
  })

// Dos remeras clásicas azul marino L y un buzo con capucha gris M: $ 119.700 + $ 6.900 de envío.
export const storageWithCart = () =>
  memoryStorage({
    [CART_STORAGE_KEY]: JSON.stringify({
      lines: [
        { productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 2 },
        { productSlug: 'buzo-capucha', colorId: 'gris', size: 'M', quantity: 1 },
      ],
    }),
  })
