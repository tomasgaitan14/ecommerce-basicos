// Por debajo de esta luminancia la prenda es oscura y sus costuras se dibujan claras.
const DARK_LUMINANCE = 0.2
// Por encima, la prenda se confunde con el fondo lona y necesita contorno.
const OUTLINE_LUMINANCE = 0.6

const HEX_COLOR = /^#[0-9a-f]{6}$/i

const INK = {
  dark: { line: 'rgba(255, 255, 255, 0.36)', shade: 'rgba(0, 0, 0, 0.4)' },
  light: { line: 'rgba(0, 0, 0, 0.32)', shade: 'rgba(0, 0, 0, 0.14)' },
}
const OUTLINE = 'rgba(0, 0, 0, 0.24)'

export interface GarmentInk {
  tone: 'dark' | 'light'
  // Costuras, pespuntes, cordones y botones.
  line: string
  // Interior de cuellos y capuchas.
  shade: string
  outline: string | null
}

// Luminancia relativa según WCAG 2.x.
function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getGarmentInk(hex: string): GarmentInk {
  if (!HEX_COLOR.test(hex)) throw new Error(`Color de prenda inválido: "${hex}"`)
  const luminance = relativeLuminance(hex)
  const tone = luminance < DARK_LUMINANCE ? 'dark' : 'light'
  return { tone, ...INK[tone], outline: luminance > OUTLINE_LUMINANCE ? OUTLINE : null }
}
