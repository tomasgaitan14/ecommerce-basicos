export interface SizeGuide {
  title: string
  // Qué mide cada columna, en centímetros.
  columns: readonly string[]
  rows: readonly { size: string; values: readonly number[] }[]
}

const guides = {
  superior: {
    title: 'Remeras, chombas, camisas, buzos y camperas',
    columns: ['Ancho de pecho', 'Largo'],
    rows: [
      { size: 'S', values: [50, 70] },
      { size: 'M', values: [53, 72] },
      { size: 'L', values: [56, 74] },
      { size: 'XL', values: [59, 76] },
      { size: 'XXL', values: [62, 78] },
    ],
  },
  pantalones: {
    title: 'Pantalones',
    columns: ['Cintura', 'Largo'],
    rows: [
      { size: '38', values: [76, 102] },
      { size: '40', values: [80, 103] },
      { size: '42', values: [84, 104] },
      { size: '44', values: [88, 105] },
      { size: '46', values: [92, 106] },
      { size: '48', values: [96, 107] },
    ],
  },
  bermudas: {
    title: 'Bermudas',
    columns: ['Cintura', 'Largo'],
    rows: [
      { size: '38', values: [76, 48] },
      { size: '40', values: [80, 49] },
      { size: '42', values: [84, 50] },
      { size: '44', values: [88, 51] },
      { size: '46', values: [92, 52] },
      { size: '48', values: [96, 53] },
    ],
  },
  jogger: {
    title: 'Joggers',
    columns: ['Cintura sin estirar', 'Largo'],
    rows: [
      { size: 'S', values: [72, 100] },
      { size: 'M', values: [76, 102] },
      { size: 'L', values: [80, 104] },
      { size: 'XL', values: [84, 106] },
      { size: 'XXL', values: [88, 108] },
    ],
  },
  ropaInterior: {
    title: 'Boxers',
    columns: ['Cintura sin estirar'],
    rows: [
      { size: 'S', values: [68] },
      { size: 'M', values: [72] },
      { size: 'L', values: [76] },
      { size: 'XL', values: [80] },
    ],
  },
} satisfies Record<string, SizeGuide>

export type SizeGuideId = keyof typeof guides

export const SIZE_GUIDES: Readonly<Record<SizeGuideId, SizeGuide>> = guides
