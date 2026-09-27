import { useId, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ColorSwatches } from '../components/ColorSwatches'
import { GarmentImage } from '../components/GarmentImage'
import { ProductCard } from '../components/ProductCard'
import { SizeGuideDialog } from '../components/SizeGuideDialog'
import { SizeSelector } from '../components/SizeSelector'
import { SpecList } from '../components/SpecList'
import { useCart } from '../context/cartContext'
import { COLORS, type ColorId } from '../data/colors'
import { RETURN_WINDOW_DAYS } from '../data/policies'
import type { Product } from '../data/products'
import { getCategory, getProductBySlug, getRelatedProducts, getVariantStock, isLowStock } from '../lib/catalog'
import { FREE_SHIPPING_THRESHOLD, INSTALLMENTS, formatPrice, getInstallmentAmount } from '../lib/pricing'
import { COLOR_PARAM, PATHS } from '../paths'
import { NotFoundPage } from './NotFoundPage'

const MESSAGES = {
  sizeRequired: 'Elegí un talle.',
  noMoreStock: 'Ya tenés en el carrito todas las unidades de este talle.',
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProductBySlug(slug)
  if (!product) return <NotFoundPage />
  // La key reinicia el talle elegido al pasar de una ficha a otra.
  return <ProductDetail key={product.slug} product={product} />
}

function ProductDetail({ product }: { product: Product }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [size, setSize] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const messageId = useId()
  const relatedTitleId = useId()
  const { addItem, availableToAdd } = useCart()

  const colorParam = searchParams.get(COLOR_PARAM)
  const colorId = product.colors.find((candidate) => candidate === colorParam) ?? product.colors[0]
  const color = COLORS[colorId]
  const category = getCategory(product.category)
  const stockFor = (candidateSize: string) => getVariantStock(product.slug, colorId, candidateSize)
  const selectedStock = size ? stockFor(size) : 0

  // El color vive en la URL: se puede compartir el link con el color elegido.
  function selectColor(nextColorId: ColorId) {
    setSearchParams({ [COLOR_PARAM]: nextColorId }, { replace: true, preventScrollReset: true })
    if (size && getVariantStock(product.slug, nextColorId, size) === 0) setSize(null)
    setMessage('')
  }

  function selectSize(nextSize: string) {
    setSize(nextSize)
    setMessage('')
  }

  function handleAdd() {
    if (!size) {
      setMessage(MESSAGES.sizeRequired)
      return
    }
    const variant = { productSlug: product.slug, colorId, size }
    if (availableToAdd(variant) === 0) {
      setMessage(MESSAGES.noMoreStock)
      return
    }
    setMessage('')
    addItem(variant)
  }

  return (
    <>
      <title>{`${product.name} | basicos`}</title>
      <article className="grid gap-10 pt-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 lg:pt-10">
        <div className="aspect-square bg-canvas p-[10%] md:sticky md:top-24 md:self-start">
          <GarmentImage
            garment={product.garment}
            color={color}
            label={`${product.name}, ${color.name}`}
            className="size-full"
          />
        </div>
        <div>
          <nav aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <li>
                <Link to={PATHS.shop} className="inline-block py-1.5 hover:text-ink hover:underline">
                  Tienda
                </Link>
                <span aria-hidden="true"> /</span>
              </li>
              {category && (
                <li>
                  <Link to={PATHS.category(category.slug)} className="inline-block py-1.5 hover:text-ink hover:underline">
                    {category.name}
                  </Link>
                  <span aria-hidden="true"> /</span>
                </li>
              )}
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>
          <h1 className="type-title mt-4">{product.name}</h1>
          <p className="mt-3 text-lg tabular-nums">{formatPrice(product.price)}</p>
          <p className="text-sm text-muted tabular-nums">
            {INSTALLMENTS} cuotas sin interés de {formatPrice(getInstallmentAmount(product.price))}
          </p>

          <div className="mt-8">
            <p className="mb-2 text-sm">Color: {color.name}</p>
            <ColorSwatches colors={product.colors} selected={colorId} onSelect={selectColor} size="md" />
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span>Talle</span>
              {product.sizeGuide && <SizeGuideDialog guideId={product.sizeGuide} />}
            </div>
            <SizeSelector
              sizes={product.sizes}
              selected={size}
              onSelect={selectSize}
              stockFor={stockFor}
              errorId={message ? messageId : undefined}
            />
            {size && isLowStock(selectedStock) && (
              <p className="mt-2 text-sm">
                Quedan {selectedStock} en talle {size}.
              </p>
            )}
          </div>

          <button type="button" onClick={handleAdd} className="button-primary mt-7 min-h-12 w-full">
            Agregar al carrito
          </button>
          {/* Siempre en el árbol de accesibilidad (vacío no es display: none): así se anuncia cada mensaje. */}
          <p id={messageId} role="alert" className={`text-sm text-alert ${message ? 'mt-3' : ''}`}>
            {message}
          </p>
          <p className="mt-4 text-xs text-muted tabular-nums">
            Envío gratis en compras desde {formatPrice(FREE_SHIPPING_THRESHOLD)}. Cambios sin cargo dentro de los{' '}
            {RETURN_WINDOW_DAYS} días.
          </p>

          <p className="mt-10 max-w-[60ch]">{product.description}</p>
          <SpecList specs={product.specs} className="mt-6" />
        </div>
      </article>

      <section aria-labelledby={relatedTitleId} className="mt-24">
        <h2 id={relatedTitleId} className="type-title">
          Combinalo con
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {getRelatedProducts(product).map((related) => (
            <ProductCard key={related.slug} product={related} />
          ))}
        </div>
      </section>
    </>
  )
}
