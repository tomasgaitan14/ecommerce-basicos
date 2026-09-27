import { useId } from 'react'
import { COLORS } from '../data/colors'
import type { CartItem } from '../lib/cart'
import { formatPrice, type OrderSummary } from '../lib/pricing'
import { GarmentImage } from './GarmentImage'

interface OrderSummaryPanelProps {
  items: readonly CartItem[]
  summary: OrderSummary
  title?: string
}

const units = (quantity: number) => `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`

// Prendas y totales del pedido: lo usan el checkout y la confirmación.
export function OrderSummaryPanel({ items, summary, title = 'Resumen del pedido' }: OrderSummaryPanelProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="border border-rule p-5 sm:p-6">
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      <ul className="mt-4">
        {items.map((item) => (
          <li key={item.lineId} className="grid grid-cols-[3.5rem_1fr_auto] gap-4 border-t border-rule py-4">
            <span className="block aspect-[4/5] bg-canvas p-1">
              <GarmentImage garment={item.garment} color={COLORS[item.colorId]} className="size-full" />
            </span>
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted">
                {item.colorName}, talle {item.size}, {units(item.quantity)}
              </p>
            </div>
            <p className="tabular-nums">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-[1fr_auto] gap-y-1 border-t border-rule pt-4 text-sm tabular-nums">
        <dt>Subtotal</dt>
        <dd>{formatPrice(summary.subtotal)}</dd>
        <dt>Envío</dt>
        <dd>{summary.shipping === 0 ? 'Gratis' : formatPrice(summary.shipping)}</dd>
        <dt className="text-base font-semibold">Total</dt>
        <dd className="text-base font-semibold">{formatPrice(summary.total)}</dd>
      </dl>
    </section>
  )
}
