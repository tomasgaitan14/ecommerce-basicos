import { CATEGORIES, COMPLEMENTARY_CATEGORIES, type Category, type CategorySlug } from '../data/categories'
import type { ColorId } from '../data/colors'
import { PRODUCTS, type Product } from '../data/products'

const RELATED_PRODUCTS_LIMIT = 4

// Hasta este stock (inclusive) la ficha avisa que quedan pocas unidades.
const LOW_STOCK_THRESHOLD = 3

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug)
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug)
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  return PRODUCTS.filter((product) => product.category === slug)
}

// El valor viaja en la URL (?orden=), así que los ids quedan en español.
export const SORT_ORDERS = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
] as const

export type SortOrder = (typeof SORT_ORDERS)[number]['value']

export const DEFAULT_SORT_ORDER: SortOrder = 'destacados'

export function parseSortOrder(value: string | null): SortOrder {
  return SORT_ORDERS.find((order) => order.value === value)?.value ?? DEFAULT_SORT_ORDER
}

// Devuelve una lista nueva. El orden de Array.prototype.sort es estable, así que a igual
// precio se mantiene el orden del catálogo.
export function sortProducts(products: readonly Product[], order: SortOrder): Product[] {
  const sorted = [...products]
  if (order === 'precio-asc') sorted.sort((a, b) => a.price - b.price)
  if (order === 'precio-desc') sorted.sort((a, b) => b.price - a.price)
  return sorted
}

// La primera prenda de cada categoría complementaria, en orden de prioridad.
export function getRelatedProducts(product: Product, limit = RELATED_PRODUCTS_LIMIT): Product[] {
  return COMPLEMENTARY_CATEGORIES[product.category]
    .map((category) => getProductsByCategory(category)[0])
    .filter((related): related is Product => related !== undefined)
    .slice(0, limit)
}

export function getVariantStock(productSlug: string, colorId: ColorId, size: string): number {
  const variant = getProductBySlug(productSlug)?.variants.find(
    (candidate) => candidate.colorId === colorId && candidate.size === size,
  )
  return variant?.stock ?? 0
}

export function isLowStock(stock: number): boolean {
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD
}
