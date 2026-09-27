import { useId, type ChangeEvent } from 'react'
import { NavLink, useParams, useSearchParams } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'
import {
  DEFAULT_SORT_ORDER,
  SORT_ORDERS,
  getCategory,
  getProductsByCategory,
  parseSortOrder,
  sortProducts,
} from '../lib/catalog'
import { PATHS, SORT_PARAM } from '../paths'
import { NotFoundPage } from './NotFoundPage'

const filterLinkClass = ({ isActive }: { isActive: boolean }) =>
  `underline-offset-4 hover:underline ${isActive ? 'font-medium underline' : 'text-muted hover:text-ink'}`

const productCount = (count: number) => `${count} ${count === 1 ? 'producto' : 'productos'}`

export function CatalogPage() {
  const { categoria } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const sortId = useId()

  // Sin parámetro es toda la tienda; con un parámetro que no es categoría, la página no existe.
  const category = categoria === undefined ? null : getCategory(categoria)
  if (category === undefined) return <NotFoundPage />

  const order = parseSortOrder(searchParams.get(SORT_PARAM))
  const products = sortProducts(category ? getProductsByCategory(category.slug) : PRODUCTS, order)
  const title = category?.name ?? 'Toda la tienda'

  function changeOrder(event: ChangeEvent<HTMLSelectElement>) {
    const next = parseSortOrder(event.target.value)
    setSearchParams(next === DEFAULT_SORT_ORDER ? {} : { [SORT_PARAM]: next }, { preventScrollReset: true })
  }

  return (
    <>
      <title>{`${title} | basicos`}</title>
      <div className="pt-10 md:pt-14">
        <h1 className="type-title">{title}</h1>
        <p className="mt-2 text-sm text-muted tabular-nums">{productCount(products.length)}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-rule pb-4">
        <nav aria-label="Categorías de la tienda" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-5 text-sm whitespace-nowrap">
            <li>
              <NavLink to={PATHS.shop} end className={filterLinkClass}>
                Todo
              </NavLink>
            </li>
            {CATEGORIES.map((item) => (
              <li key={item.slug}>
                <NavLink to={PATHS.category(item.slug)} className={filterLinkClass}>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={sortId}>Ordenar por</label>
          <select id={sortId} value={order} onChange={changeOrder} className="border border-control bg-paper px-2 py-1.5">
            {SORT_ORDERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul aria-label="Productos" className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  )
}
