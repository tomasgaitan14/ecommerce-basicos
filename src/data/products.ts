import type { CategorySlug } from './categories'
import type { ColorId } from './colors'
import type { GarmentType } from './garments'
import type { SizeGuideId } from './sizeGuides'

export interface Variant {
  colorId: ColorId
  size: string
  stock: number
}

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  slug: string
  name: string
  category: CategorySlug
  garment: GarmentType
  // Precio en pesos, sin centavos.
  price: number
  // Línea corta que acompaña al nombre en la tarjeta del catálogo.
  summary: string
  description: string
  specs: ProductSpec[]
  // En el orden en que se muestran las muestras de color.
  colors: ColorId[]
  sizes: string[]
  // Sin guía cuando hay un único talle.
  sizeGuide?: SizeGuideId
  variants: Variant[]
}

const TOP_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const NUMBERED_SIZES = ['38', '40', '42', '44', '46', '48']
const UNDERWEAR_SIZES = ['S', 'M', 'L', 'XL']
const ONE_SIZE = ['Único']

// Unidades por combinación de color y talle cuando no hay una excepción cargada.
const DEFAULT_STOCK = 12

const CARE = {
  cotton: 'Lavar en agua fría. Planchar del revés.',
  fleece: 'Lavar del revés en agua fría. No usar secarropas.',
  linen: 'Lavar en agua fría. Secar a la sombra.',
  delicate: 'Lavar a mano en agua fría. No planchar.',
}

// Genera una variante por cada color y talle. Las excepciones usan la clave "color/talle" y
// tienen que existir: una clave mal escrita corta la carga en vez de pasar inadvertida.
function variantsFor(colors: ColorId[], sizes: string[], exceptions: Record<string, number>): Variant[] {
  const variants = colors.flatMap((colorId) =>
    sizes.map((size) => ({ colorId, size, stock: exceptions[`${colorId}/${size}`] ?? DEFAULT_STOCK })),
  )
  const unknownKeys = Object.keys(exceptions).filter(
    (key) => !variants.some((variant) => `${variant.colorId}/${variant.size}` === key),
  )
  if (unknownKeys.length > 0) {
    throw new Error(`Excepciones de stock sin variante: ${unknownKeys.join(', ')}`)
  }
  return variants
}

type ProductInput = Omit<Product, 'variants'> & { stockExceptions?: Record<string, number> }

function defineProduct({ stockExceptions = {}, ...product }: ProductInput): Product {
  return { ...product, variants: variantsFor(product.colors, product.sizes, stockExceptions) }
}

export const PRODUCTS: readonly Product[] = [
  defineProduct({
    slug: 'remera-clasica',
    name: 'Remera clásica',
    category: 'remeras',
    garment: 'remera',
    price: 24900,
    summary: 'Algodón peinado 24/1',
    description:
      'La remera de todos los días: cuello redondo de rib, costuras dobles en hombros y ruedo, y un calce que no ajusta ni sobra.',
    specs: [
      { label: 'Composición', value: '100% algodón peinado 24/1' },
      { label: 'Tela', value: 'Jersey de 180 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['negro', 'blanco', 'gris', 'marino', 'oliva', 'arena', 'marron', 'bordo'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'blanco/XXL': 0, 'bordo/S': 0, 'negro/M': 2, 'gris/L': 3 },
  }),
  defineProduct({
    slug: 'remera-pesada',
    name: 'Remera pesada',
    category: 'remeras',
    garment: 'remera',
    price: 32900,
    summary: 'Jersey de 240 g/m²',
    description: 'Más gruesa y con más estructura. El cuello y el ruedo mantienen la forma lavado tras lavado.',
    specs: [
      { label: 'Composición', value: '100% algodón 20/1' },
      { label: 'Tela', value: 'Jersey de 240 g/m²' },
      { label: 'Calce', value: 'Holgado' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['arena', 'negro', 'blanco', 'gris', 'marino'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'arena/S': 0, 'negro/XL': 1 },
  }),
  defineProduct({
    slug: 'remera-manga-larga',
    name: 'Remera manga larga',
    category: 'remeras',
    garment: 'remeraMangaLarga',
    price: 29900,
    summary: 'Algodón peinado 24/1',
    description: 'La misma base que la clásica, con manga larga y puño de rib. Sirve sola o debajo de una camisa.',
    specs: [
      { label: 'Composición', value: '100% algodón peinado 24/1' },
      { label: 'Tela', value: 'Jersey de 180 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['gris', 'negro', 'blanco', 'marino', 'oliva'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'oliva/XXL': 0 },
  }),
  defineProduct({
    slug: 'musculosa',
    name: 'Musculosa',
    category: 'remeras',
    garment: 'musculosa',
    price: 17900,
    summary: 'Jersey de 160 g/m²',
    description: 'Sisa amplia con ribete y un largo que cubre la cintura. Para el verano o para entrenar.',
    specs: [
      { label: 'Composición', value: '100% algodón peinado 24/1' },
      { label: 'Tela', value: 'Jersey de 160 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['blanco', 'negro', 'gris'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'gris/S': 0 },
  }),
  defineProduct({
    slug: 'chomba-pique',
    name: 'Chomba piqué',
    category: 'chombas',
    garment: 'chomba',
    price: 39900,
    summary: 'Piqué de 220 g/m²',
    description: 'Cuello y puños de rib tejido, tapeta con botones y aberturas laterales en el ruedo.',
    specs: [
      { label: 'Composición', value: '100% algodón' },
      { label: 'Tela', value: 'Piqué de 220 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['marino', 'negro', 'blanco', 'oliva', 'arena'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'marino/L': 2 },
  }),
  defineProduct({
    slug: 'chomba-jersey',
    name: 'Chomba de jersey',
    category: 'chombas',
    garment: 'chomba',
    price: 34900,
    summary: 'Jersey de 200 g/m²',
    description: 'Más liviana y suave que la de piqué, con el cuello de la misma tela.',
    specs: [
      { label: 'Composición', value: '100% algodón peinado 24/1' },
      { label: 'Tela', value: 'Jersey de 200 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['gris', 'negro', 'marino'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'gris/XXL': 0 },
  }),
  defineProduct({
    slug: 'camisa-oxford',
    name: 'Camisa oxford',
    category: 'camisas',
    garment: 'camisa',
    price: 54900,
    summary: 'Oxford de algodón',
    description: 'Cuello con botones, bolsillo en el pecho y un tejido que se ablanda con cada lavado.',
    specs: [
      { label: 'Composición', value: '100% algodón' },
      { label: 'Tela', value: 'Oxford de 140 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: 'Lavar en agua fría. Planchar con vapor.' },
    ],
    colors: ['celeste', 'blanco', 'marino'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'celeste/S': 0, 'blanco/L': 3 },
  }),
  defineProduct({
    slug: 'camisa-lino',
    name: 'Camisa de lino',
    category: 'camisas',
    garment: 'camisa',
    price: 59900,
    summary: 'Lino y algodón',
    description: 'Fresca y con la textura irregular del lino. Se arruga, y está bien que se arrugue.',
    specs: [
      { label: 'Composición', value: '55% lino, 45% algodón' },
      { label: 'Tela', value: 'Lienzo de 150 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.linen },
    ],
    colors: ['crudo', 'blanco', 'arena', 'oliva'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'oliva/XL': 0 },
  }),
  defineProduct({
    slug: 'buzo-cuello-redondo',
    name: 'Buzo cuello redondo',
    category: 'buzos',
    garment: 'buzo',
    price: 59900,
    summary: 'Frisa de 320 g/m²',
    description: 'Frisa invisible por dentro y rib en cuello, puños y cintura. El buzo que va con todo lo demás.',
    specs: [
      { label: 'Composición', value: '80% algodón, 20% poliéster' },
      { label: 'Tela', value: 'Frisa invisible de 320 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.fleece },
    ],
    colors: ['gris', 'negro', 'marino', 'crudo', 'oliva'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'crudo/M': 2 },
  }),
  defineProduct({
    slug: 'buzo-capucha',
    name: 'Buzo con capucha',
    category: 'buzos',
    garment: 'buzoCapucha',
    price: 69900,
    summary: 'Frisa de 320 g/m²',
    description: 'Capucha doble con cordón, bolsillo canguro y rib en puños y cintura.',
    specs: [
      { label: 'Composición', value: '80% algodón, 20% poliéster' },
      { label: 'Tela', value: 'Frisa invisible de 320 g/m²' },
      { label: 'Calce', value: 'Regular, con puños y cintura de rib' },
      { label: 'Cuidado', value: CARE.fleece },
    ],
    colors: ['oliva', 'gris', 'negro', 'marino', 'crudo'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'gris/L': 2, 'negro/XXL': 0 },
  }),
  defineProduct({
    slug: 'buzo-rustico',
    name: 'Buzo rústico',
    category: 'buzos',
    garment: 'buzo',
    price: 49900,
    summary: 'Rústico de 260 g/m²',
    description: 'Más liviano que la frisa, con el revés de rizo. Para media estación.',
    specs: [
      { label: 'Composición', value: '100% algodón' },
      { label: 'Tela', value: 'Rústico de 260 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.fleece },
    ],
    colors: ['arena', 'gris', 'negro'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
  }),
  defineProduct({
    slug: 'campera-bomber',
    name: 'Campera bomber',
    category: 'camperas',
    garment: 'campera',
    price: 119900,
    summary: 'Gabardina con guata liviana',
    description: 'Cierre metálico, rib en cuello, puños y cintura, y dos bolsillos laterales.',
    specs: [
      { label: 'Composición', value: 'Exterior 100% algodón. Relleno 100% poliéster.' },
      { label: 'Tela', value: 'Gabardina de 260 g/m²' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.delicate },
    ],
    colors: ['oliva', 'negro', 'marino'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'oliva/S': 0, 'marino/XL': 1 },
  }),
  defineProduct({
    slug: 'campera-acolchada',
    name: 'Campera acolchada',
    category: 'camperas',
    garment: 'camperaAcolchada',
    price: 139900,
    summary: 'Relleno de guata térmica',
    description: 'Abriga sin pesar y se guarda en poco lugar. Cuello alto y cierre hasta arriba.',
    specs: [
      { label: 'Composición', value: 'Exterior 100% poliamida. Relleno 100% poliéster.' },
      { label: 'Tela', value: 'Poliamida repelente al agua' },
      { label: 'Calce', value: 'Regular' },
      { label: 'Cuidado', value: CARE.delicate },
    ],
    colors: ['negro', 'marino', 'arena'],
    sizes: TOP_SIZES,
    sizeGuide: 'superior',
    stockExceptions: { 'arena/XXL': 0 },
  }),
  defineProduct({
    slug: 'pantalon-chino',
    name: 'Pantalón chino',
    category: 'pantalones',
    garment: 'pantalon',
    price: 64900,
    summary: 'Gabardina elastizada',
    description: 'Tiro medio, pierna recta y bolsillos al sesgo. Va con zapatillas y con zapatos.',
    specs: [
      { label: 'Composición', value: '98% algodón, 2% elastano' },
      { label: 'Tela', value: 'Gabardina de 280 g/m²' },
      { label: 'Calce', value: 'Recto' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['arena', 'marino', 'negro', 'oliva'],
    sizes: NUMBERED_SIZES,
    sizeGuide: 'pantalones',
    stockExceptions: { 'negro/38': 0, 'arena/44': 2 },
  }),
  defineProduct({
    slug: 'pantalon-lino',
    name: 'Pantalón de lino',
    category: 'pantalones',
    garment: 'pantalon',
    price: 69900,
    summary: 'Lino y viscosa',
    description: 'Liviano y con caída. Para los días en que el chino da calor.',
    specs: [
      { label: 'Composición', value: '55% lino, 45% viscosa' },
      { label: 'Tela', value: 'Lienzo de 170 g/m²' },
      { label: 'Calce', value: 'Recto' },
      { label: 'Cuidado', value: CARE.linen },
    ],
    colors: ['crudo', 'arena', 'negro'],
    sizes: NUMBERED_SIZES,
    sizeGuide: 'pantalones',
    stockExceptions: { 'crudo/48': 0 },
  }),
  defineProduct({
    slug: 'jogger-frisa',
    name: 'Jogger de frisa',
    category: 'pantalones',
    garment: 'jogger',
    price: 54900,
    summary: 'Frisa de 320 g/m²',
    description: 'Cintura elástica con cordón, puño de rib en el tobillo y bolsillos laterales.',
    specs: [
      { label: 'Composición', value: '80% algodón, 20% poliéster' },
      { label: 'Tela', value: 'Frisa invisible de 320 g/m²' },
      { label: 'Calce', value: 'Regular, con puño en el tobillo' },
      { label: 'Cuidado', value: CARE.fleece },
    ],
    colors: ['negro', 'gris', 'marino'],
    sizes: TOP_SIZES,
    sizeGuide: 'jogger',
    stockExceptions: { 'marino/XXL': 0 },
  }),
  defineProduct({
    slug: 'bermuda-chino',
    name: 'Bermuda chino',
    category: 'bermudas',
    garment: 'bermuda',
    price: 39900,
    summary: 'Gabardina elastizada',
    description: 'Largo por encima de la rodilla, bolsillos al sesgo y ruedo con doble costura.',
    specs: [
      { label: 'Composición', value: '98% algodón, 2% elastano' },
      { label: 'Tela', value: 'Gabardina de 280 g/m²' },
      { label: 'Calce', value: 'Recto' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['marino', 'arena', 'oliva', 'negro'],
    sizes: NUMBERED_SIZES,
    sizeGuide: 'bermudas',
    stockExceptions: { 'oliva/46': 0 },
  }),
  defineProduct({
    slug: 'bermuda-lino',
    name: 'Bermuda de lino',
    category: 'bermudas',
    garment: 'bermuda',
    price: 42900,
    summary: 'Lino y viscosa',
    description: 'La versión corta del pantalón de lino: liviana, con caída y bolsillos al sesgo.',
    specs: [
      { label: 'Composición', value: '55% lino, 45% viscosa' },
      { label: 'Tela', value: 'Lienzo de 170 g/m²' },
      { label: 'Calce', value: 'Recto' },
      { label: 'Cuidado', value: CARE.linen },
    ],
    colors: ['celeste', 'crudo', 'arena'],
    sizes: NUMBERED_SIZES,
    sizeGuide: 'bermudas',
  }),
  defineProduct({
    slug: 'boxer-pack',
    name: 'Boxer (pack x3)',
    category: 'ropa-interior',
    garment: 'boxer',
    price: 24900,
    summary: 'Algodón con elastano',
    description: 'Tres boxers del mismo color, con cintura elástica suave y costuras planas.',
    specs: [
      { label: 'Composición', value: '95% algodón, 5% elastano' },
      { label: 'Tela', value: 'Jersey de 200 g/m²' },
      { label: 'Calce', value: 'Ajustado' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['gris', 'negro', 'marino'],
    sizes: UNDERWEAR_SIZES,
    sizeGuide: 'ropaInterior',
    stockExceptions: { 'gris/S': 0 },
  }),
  defineProduct({
    slug: 'medias-pack',
    name: 'Medias (pack x3)',
    category: 'ropa-interior',
    garment: 'medias',
    price: 12900,
    summary: 'Algodón peinado',
    description: 'Caña media, con talón y puntera reforzados. Tres pares del mismo color.',
    specs: [
      { label: 'Composición', value: '80% algodón, 17% poliamida, 3% elastano' },
      { label: 'Tela', value: 'Tejido de punto' },
      { label: 'Calce', value: 'Talle único, del 39 al 44' },
      { label: 'Cuidado', value: CARE.cotton },
    ],
    colors: ['blanco', 'negro', 'gris'],
    sizes: ONE_SIZE,
  }),
]
