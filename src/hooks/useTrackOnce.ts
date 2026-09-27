import { useEffect, useRef } from 'react'
import { pushToDataLayer, type AnalyticsEvent } from '../lib/analytics'

// Manda el evento una vez por cada `key` (una página, una lista, una ficha): un re-render no lo
// repite, y StrictMode, que en desarrollo corre los efectos dos veces, tampoco. Con `key` en null no
// manda nada. `buildEvent` corre en el efecto, cuando la página nueva (y su <title>) ya está puesta.
export function useTrackOnce(key: string | null, buildEvent: () => AnalyticsEvent): void {
  const trackedKey = useRef<string | null>(null)

  // buildEvent es una función nueva en cada render, así que el efecto corre en todos: lo que decide
  // si se manda algo es la key.
  useEffect(() => {
    if (key === null || trackedKey.current === key) return
    trackedKey.current = key
    pushToDataLayer(buildEvent())
  }, [key, buildEvent])
}
