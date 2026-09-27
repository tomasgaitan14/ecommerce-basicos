import { describe, expect, it } from 'vitest'
import { gtmTags, resolveGtmId } from '../vite/gtm'

const CONTAINER_ID = 'GTM-KQT4NCMT'

type FakeWindow = { dataLayer?: unknown[] }

// Corre el script en línea contra una ventana de mentira, como lo haría el navegador al cargar la página.
function runInlineScript(code: unknown, target: FakeWindow) {
  if (typeof code !== 'string') throw new Error('El primer tag tiene que ser un script en línea')
  new Function('window', code)(target)
}

describe('resolveGtmId', () => {
  it('usa GTM_ID cuando está definida', () => {
    expect(resolveGtmId({ GTM_ID: CONTAINER_ID })).toBe(CONTAINER_ID)
  })

  it('ignora los espacios alrededor', () => {
    expect(resolveGtmId({ GTM_ID: `  ${CONTAINER_ID}\n` })).toBe(CONTAINER_ID)
  })

  it('sin GTM_ID no hay contenedor: así quedan local, las previews y los tests', () => {
    expect(resolveGtmId({})).toBeNull()
    expect(resolveGtmId({ GTM_ID: '' })).toBeNull()
    expect(resolveGtmId({ GTM_ID: '   ' })).toBeNull()
  })

  it('rechaza lo que no es un ID de contenedor de GTM', () => {
    // El ID de medición de GA4 (G-...) es la confusión más probable.
    const invalid = ['G-L4T9WL46PD', 'gtm-kqt4ncmt', 'GTM-', 'GTM KQT4NCMT', `${CONTAINER_ID}"><script>alert(1)</script>`]
    for (const GTM_ID of invalid) {
      expect(() => resolveGtmId({ GTM_ID }), GTM_ID).toThrow(/GTM_ID/)
    }
  })
})

describe('gtmTags', () => {
  it('el primer script arranca el dataLayer con el evento gtm.js', () => {
    const [init] = gtmTags(CONTAINER_ID)
    const fakeWindow: FakeWindow = {}
    runInlineScript(init.children, fakeWindow)
    expect(fakeWindow.dataLayer).toEqual([{ 'gtm.start': expect.any(Number), event: 'gtm.js' }])
    expect(init.injectTo).toBe('head-prepend')
  })

  it('no pisa lo que la página ya haya dejado en el dataLayer', () => {
    const [init] = gtmTags(CONTAINER_ID)
    const fakeWindow: FakeWindow = { dataLayer: [{ event: 'previo' }] }
    runInlineScript(init.children, fakeWindow)
    expect(fakeWindow.dataLayer).toEqual([{ event: 'previo' }, { 'gtm.start': expect.any(Number), event: 'gtm.js' }])
  })

  it('después descarga el contenedor sin bloquear la página', () => {
    const [, loader] = gtmTags(CONTAINER_ID)
    expect(loader).toEqual({
      tag: 'script',
      injectTo: 'head-prepend',
      attrs: { async: true, src: `https://www.googletagmanager.com/gtm.js?id=${CONTAINER_ID}` },
    })
  })
})
