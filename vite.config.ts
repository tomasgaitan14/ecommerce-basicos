/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { GTM_CONTAINER_ID, gtmTags, shouldLoadGtm } from './vite/gtm.ts'
import { resolveSiteUrl } from './vite/siteUrl.ts'

const SITE_URL_PLACEHOLDER = '%SITE_URL%'

// Completa las URLs absolutas de index.html (Open Graph) con la URL pública del sitio.
function siteUrlPlugin(siteUrl: string): Plugin {
  return {
    name: 'basicos:site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll(SITE_URL_PLACEHOLDER, siteUrl),
    },
  }
}

// Google Tag Manager, solo en el deploy de producción (ver vite/gtm.ts).
function gtmPlugin(enabled: boolean): Plugin {
  return {
    name: 'basicos:gtm',
    transformIndexHtml: () => (enabled ? gtmTags(GTM_CONTAINER_ID) : []),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Prefijo vacío: lee SITE_URL y las variables de sistema de Vercel. Esto queda en la config;
  // al navegador solo llegan las variables VITE_*, como siempre.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), siteUrlPlugin(resolveSiteUrl(env)), gtmPlugin(shouldLoadGtm(env))],
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.{ts,tsx}'],
      setupFiles: ['tests/setup.ts'],
    },
  }
})
