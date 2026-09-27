import { useId } from 'react'
import { Link } from 'react-router'
import { GarmentImage } from '../components/GarmentImage'
import { ProductCard } from '../components/ProductCard'
import { SpecList } from '../components/SpecList'
import { CATEGORIES } from '../data/categories'
import { COLORS } from '../data/colors'
import { BRAND_FACTS, HERO_PRODUCT_SLUG, PLACARD_SLUGS } from '../data/home'
import type { Product } from '../data/products'
import { getProductBySlug, getProductsByCategory } from '../lib/catalog'
import { formatPrice } from '../lib/pricing'
import { PATHS } from '../paths'

// Los tests de integridad garantizan que estos slugs existen; si faltara uno, es un error de datos.
function requireProduct(slug: string): Product {
  const product = getProductBySlug(slug)
  if (!product) throw new Error(`La portada usa un producto que no existe: ${slug}`)
  return product
}

export function HomePage() {
  const hero = requireProduct(HERO_PRODUCT_SLUG)
  const placard = PLACARD_SLUGS.map(requireProduct)
  const categoriesId = useId()
  const placardId = useId()
  const factsId = useId()

  return (
    <>
      <title>basicos | Ropa lisa para hombre</title>

      <section className="grid gap-8 pt-10 pb-10 md:grid-cols-12 md:items-end md:gap-x-6 md:pt-16">
        <div className="@container md:col-span-8">
          <h1 className="type-display hero-title">
            Todo liso.
            <br />
            Todo combina.
          </h1>
        </div>
        <div className="md:col-span-4">
          <p className="max-w-[36ch] text-muted">
            Remeras, buzos, camperas y pantalones sin estampas ni logos, en colores pensados para combinar entre sí.
          </p>
          <Link to={PATHS.shop} className="button-primary mt-5">
            Ver la tienda
          </Link>
        </div>
      </section>

      <ul aria-label={`${hero.name} en todos sus colores`} className="grid grid-cols-4 bg-canvas px-2 pt-6 sm:grid-cols-8">
        {hero.colors.map((colorId) => (
          <li key={colorId}>
            <Link
              to={PATHS.product(hero.slug, colorId)}
              aria-label={`${hero.name} en ${COLORS[colorId].name}`}
              className="group block px-1.5"
            >
              <span className="block aspect-square">
                <GarmentImage garment={hero.garment} color={COLORS[colorId]} className="size-full" />
              </span>
              <span className="block py-3 text-xs underline-offset-4 group-hover:underline sm:text-sm">
                {COLORS[colorId].name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-b border-rule py-4 text-sm">
        <p className="tabular-nums">
          {hero.name}. {hero.summary}. {formatPrice(hero.price)}
        </p>
        <Link to={PATHS.product(hero.slug)} className="text-action -my-3">
          Elegir talle
        </Link>
      </div>

      <section aria-labelledby={categoriesId} className="mt-24">
        <h2 id={categoriesId} className="type-title">
          Categorías
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
          {CATEGORIES.map((category) => {
            const products = getProductsByCategory(category.slug)
            const cover = products[0]
            return (
              <li key={category.slug}>
                <Link
                  to={PATHS.category(category.slug)}
                  aria-label={`${category.name}, ${products.length} productos`}
                  className="group block"
                >
                  <span className="block aspect-[4/5] bg-canvas p-[16%]">
                    <GarmentImage garment={cover.garment} color={COLORS[cover.colors[0]]} className="size-full" />
                  </span>
                  <span className="mt-3 flex justify-between gap-3 text-sm">
                    <span className="font-medium underline-offset-4 group-hover:underline">{category.name}</span>
                    <span className="text-muted tabular-nums">{products.length}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby={placardId} className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id={placardId} className="type-title">
              Un placard resuelto
            </h2>
            <p className="mt-2 max-w-[48ch] text-muted">Seis prendas que combinan entre sí y cubren la semana.</p>
          </div>
          <Link to={PATHS.shop} className="text-action text-sm">
            Ver toda la tienda
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {placard.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section aria-labelledby={factsId} className="mt-24 grid gap-6 md:grid-cols-12 md:gap-x-6">
        <h2 id={factsId} className="type-title md:col-span-4">
          Cómo está hecha
        </h2>
        <SpecList specs={BRAND_FACTS} className="md:col-span-8" />
      </section>
    </>
  )
}
