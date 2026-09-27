import { describe, expect, it } from 'vitest'
import { buildPageView, pushToDataLayer } from '../src/lib/analytics'

const ORIGIN = 'https://tiendabasicosecommerce.vercel.app'

describe('buildPageView', () => {
  it('arma la URL completa, con los parámetros de la ruta, y el título de la página', () => {
    expect(buildPageView(ORIGIN, '/tienda?orden=precio-asc', 'Toda la tienda | basicos')).toEqual({
      event: 'page_view',
      page_location: `${ORIGIN}/tienda?orden=precio-asc`,
      page_title: 'Toda la tienda | basicos',
    })
  })
})

describe('pushToDataLayer', () => {
  const pageView = buildPageView(ORIGIN, '/', 'basicos | Ropa lisa para hombre')

  it('crea el dataLayer cuando GTM no está cargado (local, previews, tests)', () => {
    pushToDataLayer(pageView)
    expect(window.dataLayer).toEqual([pageView])
  })

  it('agrega al final, sin pisar lo que ya dejó GTM', () => {
    window.dataLayer = [{ event: 'gtm.js' }]
    pushToDataLayer(pageView)
    expect(window.dataLayer).toEqual([{ event: 'gtm.js' }, pageView])
  })
})
