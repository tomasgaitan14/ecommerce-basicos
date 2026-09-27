import { describe, expect, it } from 'vitest'
import { LOCAL_SITE_URL, resolveSiteUrl } from '../vite/siteUrl'

describe('resolveSiteUrl', () => {
  it('usa SITE_URL cuando está definida', () => {
    expect(resolveSiteUrl({ SITE_URL: 'https://basicos.com.ar' })).toBe('https://basicos.com.ar')
  })

  it('SITE_URL gana sobre la URL de producción de Vercel', () => {
    expect(
      resolveSiteUrl({ SITE_URL: 'https://basicos.com.ar', VERCEL_PROJECT_PRODUCTION_URL: 'basicos.vercel.app' }),
    ).toBe('https://basicos.com.ar')
  })

  it('en Vercel arma la URL con https a partir del dominio de producción', () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'basicos.vercel.app' })).toBe('https://basicos.vercel.app')
  })

  it('sin ninguna variable usa el servidor local', () => {
    expect(resolveSiteUrl({})).toBe(LOCAL_SITE_URL)
    expect(resolveSiteUrl({ SITE_URL: '', VERCEL_PROJECT_PRODUCTION_URL: '  ' })).toBe(LOCAL_SITE_URL)
  })

  it('saca la barra final para poder concatenar rutas', () => {
    expect(resolveSiteUrl({ SITE_URL: 'https://basicos.com.ar/' })).toBe('https://basicos.com.ar')
  })

  it('rechaza una SITE_URL que no es una URL http(s) absoluta', () => {
    for (const SITE_URL of ['basicos.com.ar', 'ftp://basicos.com.ar', '/tienda', 'no es una url']) {
      expect(() => resolveSiteUrl({ SITE_URL }), SITE_URL).toThrow(/SITE_URL/)
    }
  })
})
