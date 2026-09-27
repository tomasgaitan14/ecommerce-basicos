import { Link, useLocation } from 'react-router'
import { OrderSummaryPanel } from '../components/OrderSummaryPanel'
import { PAYMENT_METHODS, type Order } from '../lib/checkout'
import { PATHS } from '../paths'

// El pedido llega en el estado del historial, que puede traer cualquier cosa: se valida la forma.
function isOrder(value: unknown): value is Order {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<Order>
  return (
    typeof candidate.number === 'string' &&
    Array.isArray(candidate.items) &&
    typeof candidate.summary === 'object' &&
    typeof candidate.customer === 'object'
  )
}

function readOrder(state: unknown): Order | null {
  if (typeof state !== 'object' || state === null || !('order' in state)) return null
  return isOrder(state.order) ? state.order : null
}

export function OrderConfirmationPage() {
  const order = readOrder(useLocation().state)

  if (!order) {
    return (
      <section className="py-24">
        <title>Pedido | basicos</title>
        <h1 className="type-title">No encontramos un pedido reciente</h1>
        <p className="mt-3 max-w-[50ch] text-muted">
          La confirmación se muestra una sola vez, justo después de comprar.
        </p>
        <Link to={PATHS.shop} className="button-primary mt-6">
          Ver la tienda
        </Link>
      </section>
    )
  }

  const { customer } = order
  const payment = PAYMENT_METHODS.find((method) => method.value === customer.paymentMethod)

  return (
    <section className="pt-10 md:pt-14">
      <title>Pedido confirmado | basicos</title>
      <h1 className="type-title">Pedido confirmado</h1>
      <p className="mt-6 text-sm text-muted">Número de pedido</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{order.number}</p>
      <p className="mt-4 max-w-[56ch] text-sm text-muted">
        Es una demo: no se cobró nada y no se va a enviar nada. En una tienda real, acá llegaría un mail con este
        detalle.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-x-10">
        <div className="grid content-start gap-8 md:col-span-5">
          <div>
            <h2 className="text-lg font-semibold">Envío</h2>
            <address className="mt-2 text-sm not-italic">
              {customer.firstName} {customer.lastName}
              <br />
              {customer.address}
              {customer.apartment && `, ${customer.apartment}`}
              <br />
              {customer.postalCode} {customer.city}, {customer.province}
              <br />
              {customer.phone}
              <br />
              {customer.email}
            </address>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pago</h2>
            <p className="mt-2 text-sm">{payment?.label}</p>
          </div>
          <Link to={PATHS.shop} className="button-primary justify-self-start">
            Seguir comprando
          </Link>
        </div>
        <div className="md:col-span-7">
          <OrderSummaryPanel items={order.items} summary={order.summary} title="Detalle del pedido" />
        </div>
      </div>
    </section>
  )
}
