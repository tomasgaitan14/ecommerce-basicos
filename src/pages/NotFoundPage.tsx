import { Link } from 'react-router'
import { PATHS } from '../paths'

export function NotFoundPage() {
  return (
    <section className="py-24">
      <title>Página no encontrada | basicos</title>
      <h1 className="type-title">No encontramos esta página</h1>
      <p className="mt-3 max-w-[50ch] text-muted">
        Puede que el link esté mal escrito o que la prenda ya no esté en la tienda.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <Link to={PATHS.shop} className="button-primary">
          Ver la tienda
        </Link>
        <Link to={PATHS.home} className="text-sm underline underline-offset-4">
          Ir al inicio
        </Link>
      </div>
    </section>
  )
}
