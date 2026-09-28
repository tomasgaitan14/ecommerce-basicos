import type { Category } from '../data/categories'
import { COLORS, type ColorId } from '../data/colors'
import type { Product } from '../data/products'
import { getLineId, type CartLine, type CartState } from './cart'
import { getCategory, getProductBySlug, type SortOrder } from './catalog'
import type { CheckoutField, Order } from './checkout'
import { CURRENCY, type OrderSummary } from './pricing'

// La app solo deja los eventos en el dataLayer de Google Tag Manager; qué se manda a Google
// Analytics, y cómo, se configura en el contenedor. Sin GTM (local, previews, tests) el dataLayer
// es un array que nadie lee. Los eventos de ecommerce siguen el formato recomendado de GA4; las
// interacciones son eventos propios con sus parámetros dentro de `interaction`.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
  viewItemList: 'view_item_list',
  selectItem: 'select_item',
  viewItem: 'view_item',
  addToCart: 'add_to_cart',
  removeFromCart: 'remove_from_cart',
  viewCart: 'view_cart',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  selectColor: 'select_color',
  viewSizeGuide: 'view_size_guide',
  addToCartError: 'add_to_cart_error',
  sortCatalog: 'sort_catalog',
  checkoutError: 'checkout_error',
} as const

type EventName<K extends keyof typeof ANALYTICS_EVENTS> = (typeof ANALYTICS_EVENTS)[K]

const ITEM_BRAND = 'basicos'

// Types y no interfaces: tienen que entrar en el dataLayer, que es un array de objetos sueltos.
export type PageViewEvent = {
  event: EventName<'pageView'>
  page_location: string
  page_title: string
}

export type ItemList = { item_list_id: string; item_list_name: string }

export type AnalyticsItem = {
  item_id: string
  item_name: string
  item_brand: string
  item_category: string
  price: number
  // Nombre del color.
  item_variant?: string
  // Parámetro propio (dimensión de ítem "Talle" en GA4): así color y talle se analizan por separado.
  item_size?: string
  quantity?: number
  // Posición en la lista, desde 0.
  index?: number
}

type ValuedEcommerce = { currency: typeof CURRENCY; value: number; items: AnalyticsItem[] }

export type EcommerceEvent =
  | { event: EventName<'viewItemList' | 'selectItem'>; ecommerce: ItemList & { items: AnalyticsItem[] } }
  | {
      event: EventName<'viewItem' | 'addToCart' | 'removeFromCart' | 'viewCart' | 'beginCheckout'>
      ecommerce: ValuedEcommerce
    }
  | { event: EventName<'purchase'>; ecommerce: ValuedEcommerce & { transaction_id: string; shipping: number } }

// Los valores de los parámetros van en español, como los ids de las listas: son lo que se lee en
// los informes de GA4. Los nombres de eventos y parámetros, en inglés, como los de GA4.
export const COLOR_LOCATIONS = { productPage: 'ficha', productCard: 'tarjeta' } as const
export const ADD_TO_CART_ERRORS = { sizeRequired: 'sin_talle', noStock: 'sin_stock' } as const
type AddToCartError = (typeof ADD_TO_CART_ERRORS)[keyof typeof ADD_TO_CART_ERRORS]

// En una tarjeta, el color se elige dentro de una lista; en la ficha, no.
type ColorPlacement =
  | { location: typeof COLOR_LOCATIONS.productPage }
  | { location: typeof COLOR_LOCATIONS.productCard; list: ItemList }

export type InteractionEvent =
  | {
      event: EventName<'selectColor'>
      interaction: { product_id: string; color: string; location: ColorPlacement['location']; list_id?: string }
    }
  | { event: EventName<'viewSizeGuide'>; interaction: { product_id: string } }
  | { event: EventName<'addToCartError'>; interaction: { product_id: string; reason: AddToCartError } }
  | { event: EventName<'sortCatalog'>; interaction: { list_id: string; sort_order: SortOrder } }
  | { event: EventName<'checkoutError'>; interaction: { error_fields: string } }

export type AnalyticsEvent = PageViewEvent | EcommerceEvent | InteractionEvent

// Nombres fijos a propósito, aunque coincidan con los títulos de la página: si cambia el texto de la
// interfaz, los informes de GA4 no se cortan.
export const ITEM_LISTS = {
  shop: { item_list_id: 'tienda', item_list_name: 'Toda la tienda' },
  placard: { item_list_id: 'placard', item_list_name: 'Un placard resuelto' },
  related: { item_list_id: 'combinalo-con', item_list_name: 'Combinalo con' },
} as const satisfies Record<string, ItemList>

// El catálogo es una lista por página: toda la tienda o una categoría.
export function catalogList(category: Category | null): ItemList {
  if (!category) return ITEM_LISTS.shop
  return { item_list_id: `${ITEM_LISTS.shop.item_list_id}-${category.slug}`, item_list_name: category.name }
}

type ItemDetails = { colorId?: ColorId; size?: string; quantity?: number; index?: number }

export function toAnalyticsItem(product: Product, { colorId, size, quantity, index }: ItemDetails = {}): AnalyticsItem {
  const item: AnalyticsItem = {
    item_id: product.slug,
    item_name: product.name,
    item_brand: ITEM_BRAND,
    // La medición no puede romper la tienda: si faltara la categoría (error de datos), va el slug.
    item_category: getCategory(product.category)?.name ?? product.category,
    price: product.price,
  }
  if (colorId) item.item_variant = COLORS[colorId].name
  if (size) item.item_size = size
  if (quantity !== undefined) item.quantity = quantity
  if (index !== undefined) item.index = index
  return item
}

// Líneas del carrito o de un pedido. Una prenda que ya no está en el catálogo no se mide.
function toAnalyticsItems(lines: readonly CartLine[]): AnalyticsItem[] {
  return lines.flatMap((line) => {
    const product = getProductBySlug(line.productSlug)
    if (!product) return []
    return [toAnalyticsItem(product, { colorId: line.colorId, size: line.size, quantity: line.quantity })]
  })
}

// `path` es la ruta con sus parámetros, como la muestra la barra de direcciones: /tienda?orden=precio-asc.
export function buildPageView(origin: string, path: string, title: string): PageViewEvent {
  return { event: ANALYTICS_EVENTS.pageView, page_location: new URL(path, origin).href, page_title: title }
}

export function buildViewItemList(list: ItemList, products: readonly Product[]): EcommerceEvent {
  const items = products.map((product, index) => toAnalyticsItem(product, { index }))
  return { event: ANALYTICS_EVENTS.viewItemList, ecommerce: { ...list, items } }
}

export function buildSelectItem(list: ItemList, product: Product, index: number): EcommerceEvent {
  return { event: ANALYTICS_EVENTS.selectItem, ecommerce: { ...list, items: [toAnalyticsItem(product, { index })] } }
}

export function buildViewItem(product: Product, colorId: ColorId): EcommerceEvent {
  return {
    event: ANALYTICS_EVENTS.viewItem,
    ecommerce: { currency: CURRENCY, value: product.price, items: [toAnalyticsItem(product, { colorId })] },
  }
}

// Lo que cambió de verdad una línea entre dos estados del carrito: el reducer topea por stock e
// ignora las acciones inválidas. Si subió es add_to_cart; si bajó, remove_from_cart; si no, nada.
export function buildCartLineChange(before: CartState, after: CartState, lineId: string): EcommerceEvent | null {
  const findLine = (state: CartState) => state.lines.find((line) => getLineId(line) === lineId)
  const line = findLine(after) ?? findLine(before)
  const product = line ? getProductBySlug(line.productSlug) : undefined
  if (!line || !product) return null

  const delta = (findLine(after)?.quantity ?? 0) - (findLine(before)?.quantity ?? 0)
  if (delta === 0) return null
  const quantity = Math.abs(delta)
  return {
    event: delta > 0 ? ANALYTICS_EVENTS.addToCart : ANALYTICS_EVENTS.removeFromCart,
    ecommerce: {
      currency: CURRENCY,
      value: product.price * quantity,
      items: [toAnalyticsItem(product, { colorId: line.colorId, size: line.size, quantity })],
    },
  }
}

// El carrito completo, al abrirlo (view_cart) y al entrar al checkout (begin_checkout).
export function buildCartEvent(
  event: EventName<'viewCart' | 'beginCheckout'>,
  lines: readonly CartLine[],
  summary: OrderSummary,
): EcommerceEvent {
  return { event, ecommerce: { currency: CURRENCY, value: summary.subtotal, items: toAnalyticsItems(lines) } }
}

// El valor es el subtotal: GA4 pide el envío aparte. Del comprador no va nada: solo el pedido.
export function buildPurchase(order: Order): EcommerceEvent {
  return {
    event: ANALYTICS_EVENTS.purchase,
    ecommerce: {
      transaction_id: order.number,
      currency: CURRENCY,
      value: order.summary.subtotal,
      shipping: order.summary.shipping,
      items: toAnalyticsItems(order.items),
    },
  }
}

export function buildSelectColor(product: Product, colorId: ColorId, placement: ColorPlacement): InteractionEvent {
  const interaction = { product_id: product.slug, color: COLORS[colorId].name, location: placement.location }
  return {
    event: ANALYTICS_EVENTS.selectColor,
    interaction: 'list' in placement ? { ...interaction, list_id: placement.list.item_list_id } : interaction,
  }
}

export function buildViewSizeGuide(product: Product): InteractionEvent {
  return { event: ANALYTICS_EVENTS.viewSizeGuide, interaction: { product_id: product.slug } }
}

export function buildAddToCartError(product: Product, reason: AddToCartError): InteractionEvent {
  return { event: ANALYTICS_EVENTS.addToCartError, interaction: { product_id: product.slug, reason } }
}

export function buildSortCatalog(list: ItemList, order: SortOrder): InteractionEvent {
  return { event: ANALYTICS_EVENTS.sortCatalog, interaction: { list_id: list.item_list_id, sort_order: order } }
}

// Solo los nombres de los campos, en el orden en que llegan (el del formulario): lo que la persona
// escribió nunca sale de la página.
export function buildCheckoutError(fields: readonly CheckoutField[]): InteractionEvent {
  return { event: ANALYTICS_EVENTS.checkoutError, interaction: { error_fields: fields.join(',') } }
}

// Datos que GTM guarda y mezcla entre eventos: hay que vaciarlos antes de cada evento que los trae,
// o uno heredaría los productos o los parámetros del anterior.
const RESETTABLE_KEYS = ['ecommerce', 'interaction'] as const

// GTM reemplaza el push del array al cargar: hay que leer window.dataLayer en cada evento.
export function pushToDataLayer(event: AnalyticsEvent): void {
  window.dataLayer = window.dataLayer ?? []
  for (const key of RESETTABLE_KEYS) {
    if (key in event) window.dataLayer.push({ [key]: null })
  }
  window.dataLayer.push(event)
}
