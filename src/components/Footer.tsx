import { Link } from 'react-router'
import { CATEGORIES } from '../data/categories'
import { RETURN_WINDOW_DAYS } from '../data/policies'
import { FREE_SHIPPING_THRESHOLD, INSTALLMENTS, formatPrice } from '../lib/pricing'
import { PATHS } from '../paths'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="type-wordmark">basicos</p>
          <p className="mt-3 max-w-[38ch] text-sm text-muted">
            Ropa lisa para hombre, en colores pensados para combinar entre sí.
          </p>
        </div>
        <nav aria-label="Tienda">
          <h2 className="text-sm font-medium">Tienda</h2>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link to={PATHS.category(category.slug)} className="hover:text-ink hover:underline">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-medium">Compras</h2>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted tabular-nums">
            <li>Envío gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
            <li>{INSTALLMENTS} cuotas sin interés</li>
            <li>Cambios sin cargo por {RETURN_WINDOW_DAYS} días</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rule">
        <p className="mx-auto max-w-[1200px] px-4 py-5 text-xs text-muted sm:px-6">
          Proyecto de portfolio. basicos es una marca ficticia: no se venden productos ni se procesan pagos.
        </p>
      </div>
    </footer>
  )
}
