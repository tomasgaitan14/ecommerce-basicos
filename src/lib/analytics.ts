// La app solo deja los eventos en el dataLayer de Google Tag Manager; qué se manda a Google
// Analytics, y cómo, se configura en el contenedor. Sin GTM (local, previews, tests) el dataLayer
// es un array que nadie lee.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
} as const

// Type y no interface: tiene que entrar en el dataLayer, que es un array de objetos sueltos.
export type PageViewEvent = {
  event: typeof ANALYTICS_EVENTS.pageView
  page_location: string
  page_title: string
}

// `path` es la ruta con sus parámetros, como la muestra la barra de direcciones: /tienda?orden=precio-asc.
export function buildPageView(origin: string, path: string, title: string): PageViewEvent {
  return { event: ANALYTICS_EVENTS.pageView, page_location: new URL(path, origin).href, page_title: title }
}

// GTM reemplaza el push del array al cargar: hay que leer window.dataLayer en cada evento.
export function pushToDataLayer(event: PageViewEvent): void {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(event)
}
