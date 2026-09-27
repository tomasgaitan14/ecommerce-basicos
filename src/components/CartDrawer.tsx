import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/cartContext'
import { COLORS } from '../data/colors'
import type { CartItem } from '../lib/cart'
import { formatPrice, type OrderSummary } from '../lib/pricing'
import { PATHS } from '../paths'
import { closeOnBackdropClick } from './dialog'
import { GarmentImage } from './GarmentImage'
import { QuantityStepper } from './QuantityStepper'

export function CartDrawer() {
  const { isOpen, closeCart, items, summary, setQuantity, removeItem, lastAdded } = useCart()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // El estado vive en el contexto; el <dialog> nativo se sincroniza con él.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={closeCart}
      onClick={closeOnBackdropClick}
      className="drawer m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 text-ink"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold tabular-nums">
            Carrito ({summary.itemCount})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="text-sm underline underline-offset-4"
          >
            Cerrar
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {lastAdded ? `Agregaste ${lastAdded.name}, ${lastAdded.colorName}, talle ${lastAdded.size}.` : ''}
        </p>
        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-4 px-5 py-8">
            <p>Tu carrito está vacío.</p>
            <Link to={PATHS.shop} onClick={closeCart} className="button-primary">
              Ver la tienda
            </Link>
          </div>
        ) : (
          <>
            <FreeShippingProgress summary={summary} />
            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <CartLine
                  key={item.lineId}
                  item={item}
                  onQuantityChange={(quantity) => setQuantity(item.lineId, quantity)}
                  onRemove={() => removeItem(item.lineId)}
                  onNavigate={closeCart}
                />
              ))}
            </ul>
            <div className="border-t border-rule px-5 py-5">
              <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm tabular-nums">
                <dt>Subtotal</dt>
                <dd>{formatPrice(summary.subtotal)}</dd>
                <dt>Envío</dt>
                <dd>{summary.shipping === 0 ? 'Gratis' : formatPrice(summary.shipping)}</dd>
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">{formatPrice(summary.total)}</dd>
              </dl>
              <Link to={PATHS.checkout} onClick={closeCart} className="button-primary mt-4 w-full">
                Finalizar compra
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

function FreeShippingProgress({ summary }: { summary: OrderSummary }) {
  return (
    <div className="border-b border-rule px-5 py-4">
      <p className="text-sm tabular-nums">
        {summary.missingForFreeShipping > 0
          ? `Te faltan ${formatPrice(summary.missingForFreeShipping)} para el envío gratis.`
          : 'Tenés envío gratis.'}
      </p>
      <div aria-hidden="true" className="mt-2 h-0.5 bg-rule">
        <div className="h-full bg-ink" style={{ width: `${summary.freeShippingProgress * 100}%` }} />
      </div>
    </div>
  )
}

interface CartLineProps {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  onNavigate: () => void
}

function CartLine({ item, onQuantityChange, onRemove, onNavigate }: CartLineProps) {
  const href = PATHS.product(item.productSlug, item.colorId)
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] gap-4 border-b border-rule py-4 last:border-b-0">
      <Link to={href} onClick={onNavigate} tabIndex={-1} aria-hidden="true" className="block aspect-[4/5] bg-canvas p-1.5">
        <GarmentImage garment={item.garment} color={COLORS[item.colorId]} className="size-full" />
      </Link>
      <div className="min-w-0">
        <p className="font-medium">
          <Link to={href} onClick={onNavigate} className="underline-offset-4 hover:underline">
            {item.name}
          </Link>
        </p>
        <p className="text-xs text-muted">
          {item.colorName}, talle {item.size}
        </p>
        <div className="mt-3">
          <QuantityStepper
            value={item.quantity}
            max={item.maxQuantity}
            onChange={onQuantityChange}
            itemName={item.name}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <p className="tabular-nums">{formatPrice(item.lineTotal)}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${item.name}, ${item.colorName}, talle ${item.size}`}
          className="text-xs text-muted underline underline-offset-4 hover:text-ink"
        >
          Quitar
        </button>
      </div>
    </li>
  )
}
