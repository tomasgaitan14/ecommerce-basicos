import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation, type Location } from 'react-router'
import { buildPageView, pushToDataLayer } from '../lib/analytics'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'

export const MAIN_CONTENT_ID = 'contenido'

// Toda carga inicial de la app llega con la clave "default": si se usara tal cual, abrir otra URL
// desde la barra de direcciones heredaría el scroll guardado de la página anterior. Con la URL como
// clave, un reload vuelve a la posición de esa misma página.
const INITIAL_LOCATION_KEY = 'default'

function scrollKey(location: Location): string {
  return location.key === INITIAL_LOCATION_KEY ? location.pathname + location.search : location.key
}

// Una visita por página. Cambiar el color (?color) o el orden (?orden) no es otra página, y en
// desarrollo StrictMode corre los efectos dos veces: la página ya contada no se vuelve a contar.
function usePageViewTracking() {
  const location = useLocation()
  const trackedPathname = useRef<string | null>(null)

  useEffect(() => {
    if (trackedPathname.current === location.pathname) return
    trackedPathname.current = location.pathname
    // Los efectos corren después de que React puso el <title> de la página nueva.
    pushToDataLayer(buildPageView(window.location.origin, location.pathname + location.search, document.title))
  }, [location])
}

export function Layout() {
  usePageViewTracking()
  return (
    <>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-20 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id={MAIN_CONTENT_ID} className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      {/* Al volver atrás, el catálogo recupera la posición de scroll. */}
      <ScrollRestoration getKey={scrollKey} />
    </>
  )
}
