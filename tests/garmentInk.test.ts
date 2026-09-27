import { describe, expect, it } from 'vitest'
import { COLORS, type ColorId } from '../src/data/colors'
import { getGarmentInk } from '../src/lib/garmentInk'

const hex = (id: ColorId) => COLORS[id].hex

describe('getGarmentInk', () => {
  it('las prendas oscuras llevan costuras claras', () => {
    for (const id of ['negro', 'marino', 'oliva', 'marron', 'bordo'] as const) {
      expect(getGarmentInk(hex(id)).tone, id).toBe('dark')
    }
  })

  it('las prendas claras y medias llevan costuras oscuras', () => {
    for (const id of ['blanco', 'crudo', 'arena', 'gris', 'celeste'] as const) {
      expect(getGarmentInk(hex(id)).tone, id).toBe('light')
    }
  })

  it('solo las muy claras llevan contorno, para no perderse sobre el fondo lona', () => {
    expect(getGarmentInk(hex('blanco')).outline).not.toBeNull()
    expect(getGarmentInk(hex('crudo')).outline).not.toBeNull()
    expect(getGarmentInk(hex('arena')).outline).toBeNull()
    expect(getGarmentInk(hex('negro')).outline).toBeNull()
  })

  it('rechaza colores que no son hexadecimales de 6 dígitos', () => {
    for (const value of ['1C1C1C', '#1C1C1', '#GGGGGG', 'negro', '']) {
      expect(() => getGarmentInk(value), value).toThrow()
    }
  })
})

describe('paleta de prendas', () => {
  it('todos los colores son hexadecimales de 6 dígitos', () => {
    for (const [id, color] of Object.entries(COLORS)) {
      expect(color.hex, id).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})
