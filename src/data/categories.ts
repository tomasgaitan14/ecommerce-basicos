// En el orden en que aparecen en la navegación y en el catálogo.
export const CATEGORIES = [
  { slug: 'remeras', name: 'Remeras' },
  { slug: 'chombas', name: 'Chombas' },
  { slug: 'camisas', name: 'Camisas' },
  { slug: 'buzos', name: 'Buzos' },
  { slug: 'camperas', name: 'Camperas' },
  { slug: 'pantalones', name: 'Pantalones' },
  { slug: 'bermudas', name: 'Bermudas' },
  { slug: 'ropa-interior', name: 'Ropa interior' },
] as const

export type Category = (typeof CATEGORIES)[number]
export type CategorySlug = Category['slug']

// Con qué se combina cada categoría, en orden de prioridad. Alimenta "Combinalo con" en la ficha.
export const COMPLEMENTARY_CATEGORIES: Readonly<Record<CategorySlug, readonly CategorySlug[]>> = {
  remeras: ['pantalones', 'buzos', 'camperas', 'bermudas'],
  chombas: ['pantalones', 'bermudas', 'buzos', 'camperas'],
  camisas: ['pantalones', 'buzos', 'camperas', 'bermudas'],
  buzos: ['pantalones', 'remeras', 'camperas', 'camisas'],
  camperas: ['pantalones', 'buzos', 'remeras', 'camisas'],
  pantalones: ['remeras', 'buzos', 'camisas', 'camperas'],
  bermudas: ['remeras', 'chombas', 'camisas', 'buzos'],
  'ropa-interior': ['remeras', 'pantalones', 'buzos', 'chombas'],
}
