import type { HtmlTagDescriptor } from 'vite'
import type { BuildEnv } from './buildEnv.ts'

// Contenedor de Google Tag Manager de la tienda. No es secreto: queda visible en el HTML publicado.
export const GTM_CONTAINER_ID = 'GTM-5FZ7G4WN'

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/
const PRODUCTION = 'production'

// Solo el deploy de producción de Vercel carga GTM: ni local ni las previews mandan visitas de
// prueba al contenedor.
export function shouldLoadGtm(env: BuildEnv): boolean {
  return env.VERCEL_ENV === PRODUCTION
}

// El snippet oficial de Google. El ID se valida antes de escribirlo dentro del <script>.
export function gtmTags(containerId: string): HtmlTagDescriptor[] {
  if (!GTM_ID_PATTERN.test(containerId)) {
    throw new Error(`ID de contenedor de GTM inválido: "${containerId}". Tiene que ser como GTM-XXXXXXX.`)
  }
  return [
    {
      tag: 'script',
      injectTo: 'head-prepend',
      children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`,
    },
    {
      tag: 'noscript',
      injectTo: 'body-prepend',
      children: [
        {
          tag: 'iframe',
          attrs: {
            src: `https://www.googletagmanager.com/ns.html?id=${containerId}`,
            height: '0',
            width: '0',
            style: 'display:none;visibility:hidden',
          },
        },
      ],
    },
  ]
}
