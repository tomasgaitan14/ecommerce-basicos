import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
  // Cada test arranca sin eventos de analytics de los anteriores.
  delete window.dataLayer
})

// jsdom no implementa showModal() ni close() de <dialog>. Se reemplazan por lo que los tests
// necesitan (abrir, cerrar y avisar el cierre); el foco y la tecla Escape se verifican en Chrome.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

// ScrollRestoration de React Router llama a window.scrollTo, que jsdom no implementa.
window.scrollTo = () => {}
