export interface GarmentColor {
  name: string
  hex: string
  // El gris melange se dibuja con textura de hilado.
  melange?: boolean
}

const colors = {
  negro: { name: 'Negro', hex: '#1C1C1C' },
  blanco: { name: 'Blanco', hex: '#F4F4F1' },
  gris: { name: 'Gris melange', hex: '#A4A6A7', melange: true },
  marino: { name: 'Azul marino', hex: '#1F2A44' },
  oliva: { name: 'Verde oliva', hex: '#5E6140' },
  arena: { name: 'Arena', hex: '#C8B797' },
  marron: { name: 'Marrón', hex: '#5A4535' },
  bordo: { name: 'Bordó', hex: '#5B1F2B' },
  crudo: { name: 'Crudo', hex: '#E6DFCD' },
  celeste: { name: 'Celeste', hex: '#A9C0D6' },
} satisfies Record<string, GarmentColor>

export type ColorId = keyof typeof colors

export const COLORS: Readonly<Record<ColorId, GarmentColor>> = colors
