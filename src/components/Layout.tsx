import { Outlet, ScrollRestoration, useLocation, type Location } from 'react-router'
import { useTrackOnce } from '../hooks/useTrackOnce'
import { buildPageView } from '../lib/analytics'
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

// Una visita por página: cambiar el color (?color) o el orden (?orden) no es otra página.
function usePageViewTracking() {
  const { pathname, search } = useLocation()
  useTrackOnce(pathname, () => buildPageView(window.location.origin, pathname + search, document.title))
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
