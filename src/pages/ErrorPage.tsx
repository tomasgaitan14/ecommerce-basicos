import { PATHS } from '../paths'

// Para errores inesperados de render. Se muestra sin el encabezado, que también podría fallar,
// y vuelve al inicio con un link común para recargar la app desde cero.
export function ErrorPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6">
      <title>Algo salió mal | basicos</title>
      <p className="type-wordmark">basicos</p>
      <h1 className="type-title mt-12">Algo salió mal</h1>
      <p className="mt-3 max-w-[50ch] text-muted">
        La página tuvo un error inesperado. Tu carrito sigue guardado en este navegador.
      </p>
      <a href={PATHS.home} className="button-primary mt-6">
        Volver al inicio
      </a>
    </main>
  )
}
