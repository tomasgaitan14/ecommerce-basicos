// URL pública del sitio, para las etiquetas Open Graph de index.html: los crawlers de LinkedIn o
// WhatsApp solo aceptan URLs absolutas. Se resuelve al compilar.
export const LOCAL_SITE_URL = 'http://localhost:5173'

const ABSOLUTE_HTTP_URL = /^https?:\/\/[^\s/]+/

type BuildEnv = Record<string, string | undefined>

export function resolveSiteUrl(env: BuildEnv): string {
  const explicit = env.SITE_URL?.trim()
  if (explicit) {
    if (!ABSOLUTE_HTTP_URL.test(explicit)) {
      throw new Error(`SITE_URL tiene que ser una URL absoluta con http o https, por ejemplo https://basicos.com.ar. Llegó: "${explicit}"`)
    }
    return explicit.replace(/\/+$/, '')
  }
  // Vercel expone el dominio de producción, sin protocolo, durante el build.
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelHost) return `https://${vercelHost}`
  return LOCAL_SITE_URL
}
