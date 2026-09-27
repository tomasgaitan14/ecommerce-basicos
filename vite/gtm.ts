import type { HtmlTagDescriptor } from 'vite'
import type { BuildEnv } from './buildEnv.ts'

// Contenedor de Google Tag Manager. Es opcional: sin GTM_ID el sitio no lo carga. En Vercel se define
// solo en Production, así local, las previews y los tests no mandan visitas de prueba a Analytics.
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/
const GTM_SCRIPT_URL = 'https://www.googletagmanager.com/gtm.js'

export function resolveGtmId(env: BuildEnv): string | null {
  const id = env.GTM_ID?.trim()
  if (!id) return null
  if (!GTM_ID_PATTERN.test(id)) {
    throw new Error(
      `GTM_ID tiene que ser el ID de un contenedor de Google Tag Manager, por ejemplo GTM-XXXXXXX. Llegó: "${id}"`,
    )
  }
  return id
}

// Lo mismo que el snippet oficial, en dos etiquetas: el evento gtm.js arranca el contenedor y el
// script lo descarga sin bloquear la página. Sin el <noscript>: la tienda no funciona sin JavaScript.
export function gtmTags(containerId: string): HtmlTagDescriptor[] {
  return [
    {
      tag: 'script',
      injectTo: 'head-prepend',
      children: "window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'})",
    },
    {
      tag: 'script',
      injectTo: 'head-prepend',
      attrs: { async: true, src: `${GTM_SCRIPT_URL}?id=${containerId}` },
    },
  ]
}
