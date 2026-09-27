import { describe, expect, it } from 'vitest'
import { GTM_CONTAINER_ID, gtmTags, shouldLoadGtm } from '../vite/gtm'

describe('shouldLoadGtm', () => {
  it('carga GTM solo en el deploy de producción de Vercel', () => {
    expect(shouldLoadGtm({ VERCEL_ENV: 'production' })).toBe(true)
  })

  it('no lo carga en previews, en vercel dev ni en local', () => {
    expect(shouldLoadGtm({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(shouldLoadGtm({ VERCEL_ENV: 'development' })).toBe(false)
    expect(shouldLoadGtm({})).toBe(false)
  })
})

describe('gtmTags', () => {
  it('pone el script de GTM al principio del <head>, con el contenedor', () => {
    const [script] = gtmTags(GTM_CONTAINER_ID)
    expect(script.tag).toBe('script')
    expect(script.injectTo).toBe('head-prepend')
    expect(script.children).toContain("https://www.googletagmanager.com/gtm.js?id='+i+dl")
    expect(script.children).toContain(`'dataLayer','${GTM_CONTAINER_ID}'`)
  })

  it('pone el iframe de respaldo sin JavaScript justo después de abrir el <body>', () => {
    const [, noscript] = gtmTags(GTM_CONTAINER_ID)
    expect(noscript.tag).toBe('noscript')
    expect(noscript.injectTo).toBe('body-prepend')
    expect(noscript.children).toEqual([
      {
        tag: 'iframe',
        attrs: {
          src: `https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`,
          height: '0',
          width: '0',
          style: 'display:none;visibility:hidden',
        },
      },
    ])
  })

  it('rechaza lo que no es un ID de contenedor de GTM', () => {
    for (const id of ['', 'GTM-', 'gtm-5fz7g4wn', 'UA-12345-1', "GTM-5FZ7G4WN');alert(1);//"]) {
      expect(() => gtmTags(id), id).toThrow(/GTM/)
    }
  })

  it('el contenedor configurado tiene formato válido', () => {
    expect(GTM_CONTAINER_ID).toMatch(/^GTM-[A-Z0-9]+$/)
  })
})
