import { useState } from 'react'
import { Link } from 'react-router'
import { COLORS } from '../data/colors'
import type { Product } from '../data/products'
import { buildSelectItem, pushToDataLayer, type ItemList } from '../lib/analytics'
import { formatPrice } from '../lib/pricing'
import { PATHS } from '../paths'
import { ColorSwatches } from './ColorSwatches'
import { GarmentImage } from './GarmentImage'

interface ProductCardProps {
  product: Product
  // La lista donde aparece la tarjeta y su posición: para medir qué se eligió y desde dónde.
  list: ItemList
  index: number
}

export function ProductCard({ product, list, index }: ProductCardProps) {
  const [colorId, setColorId] = useState(product.colors[0])
  const href = PATHS.product(product.slug, colorId)

  // Un solo link por tarjeta: su ::after cubre toda la tarjeta, así que se toca en cualquier parte.
  // Las muestras de color quedan por encima (z-1, debajo del encabezado fijo) y siguen siendo tocables.
  return (
    <article className="group relative">
      <div className="aspect-[4/5] bg-canvas p-[14%]">
        <GarmentImage garment={product.garment} color={COLORS[colorId]} className="size-full" />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-medium">
          <Link
            to={href}
            onClick={() => pushToDataLayer(buildSelectItem(list, product, index))}
            className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 tabular-nums">{formatPrice(product.price)}</p>
      </div>
      <p className="text-xs text-muted">{product.summary}</p>
      <div className="relative z-1 mt-2 w-fit">
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
