import { useId, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useCart } from '../context/cartContext'
import { CATEGORIES, type CategorySlug } from '../data/categories'
import { PATHS } from '../paths'

// En pantallas anchas el encabezado muestra estas categorías; las demás están en "Ver todo".
const HEADER_CATEGORY_SLUGS: readonly CategorySlug[] = ['remeras', 'buzos', 'camperas', 'pantalones']

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `underline-offset-4 hover:underline ${isActive ? 'underline' : ''}`

export function Header() {
  const { summary, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const closeMenu = () => setMenuOpen(false)
  const headerCategories = CATEGORIES.filter((category) => HEADER_CATEGORY_SLUGS.includes(category.slug))
  const menuLinkClass = (state: { isActive: boolean }) => `block py-3 ${navLinkClass(state)}`

  return (
    <header className="sticky top-0 z-10 border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-[1200px] items-center gap-8 px-4 py-2 sm:px-6">
        <Link to={PATHS.home} onClick={closeMenu} className="type-wordmark py-3">
          basicos
        </Link>
        <nav aria-label="Categorías" className="hidden flex-1 gap-5 text-sm md:flex">
          {headerCategories.map((category) => (
            <NavLink
              key={category.slug}
              to={PATHS.category(category.slug)}
              className={(state) => `py-3 ${navLinkClass(state)}`}
            >
              {category.name}
            </NavLink>
          ))}
          <NavLink to={PATHS.shop} end className={(state) => `py-3 ${navLinkClass(state)}`}>
            Ver todo
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
            className="min-h-11 px-1 md:hidden"
          >
            {menuOpen ? 'Cerrar menú' : 'Menú'}
          </button>
          <button type="button" aria-haspopup="dialog" onClick={openCart} className="-mr-1 min-h-11 px-1 tabular-nums">
            Carrito ({summary.itemCount})
          </button>
        </div>
      </div>
      {/* Siempre en el DOM (oculto con hidden) para que aria-controls apunte a un elemento real. */}
      <nav
        id={menuId}
        hidden={!menuOpen}
        aria-label="Categorías"
        className="border-t border-rule px-4 pt-1 pb-5 md:hidden"
      >
        <ul className="grid">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <NavLink to={PATHS.category(category.slug)} onClick={closeMenu} className={menuLinkClass}>
                {category.name}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to={PATHS.shop} end onClick={closeMenu} className={menuLinkClass}>
              Ver todo
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
