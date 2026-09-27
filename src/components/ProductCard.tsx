import { useState } from 'react'
import { Link } from 'react-router'
import { COLORS } from '../data/colors'
import type { Product } from '../data/products'
import { formatPrice } from '../lib/pricing'
import { PATHS } from '../paths'
import { ColorSwatches } from './ColorSwatches'
import { GarmentImage } from './GarmentImage'

export function ProductCard({ product }: { product: Product }) {
  const [colorId, setColorId] = useState(product.colors[0])
  const href = PATHS.product(product.slug, colorId)

  return (
    <article>
      {/* El nombre ya es el link accesible: la imagen repite el destino solo para el mouse. */}
      <Link to={href} tabIndex={-1} aria-hidden="true" className="block aspect-[4/5] bg-canvas p-[14%]">
        <GarmentImage garment={product.garment} color={COLORS[colorId]} className="size-full" />
      </Link>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-medium">
          <Link to={href} className="underline-offset-4 hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 tabular-nums">{formatPrice(product.price)}</p>
      </div>
      <p className="text-xs text-muted">{product.summary}</p>
      <div className="mt-2">
        <ColorSwatches
          colors={product.colors}
          selected={colorId}
          onSelect={setColorId}
          label={`Color de ${product.name}`}
        />
      </div>
    </article>
  )
}
