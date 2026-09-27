import type { MouseEvent } from 'react'

// Un <dialog> modal no se cierra solo al tocar el fondo: el clic sobre el ::backdrop llega con
// el propio <dialog> como target, mientras que el contenido lo cubre por completo.
export function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
  if (event.target === event.currentTarget) event.currentTarget.close()
}
