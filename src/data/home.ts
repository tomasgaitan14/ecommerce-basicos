import { RETURN_WINDOW_DAYS } from './policies'

// La prenda de la franja de colores de la portada.
export const HERO_PRODUCT_SLUG = 'remera-clasica'

// "Un placard resuelto": seis prendas que combinan entre sí y cubren la semana.
export const PLACARD_SLUGS = [
  'remera-clasica',
  'chomba-pique',
  'camisa-oxford',
  'buzo-cuello-redondo',
  'pantalon-chino',
  'campera-bomber',
]

// Ficha técnica de la marca: datos concretos en vez de adjetivos.
export const BRAND_FACTS = [
  { label: 'Algodón', value: 'Peinado 24/1 en remeras. Frisa de 320 g/m² en buzos.' },
  { label: 'Costuras', value: 'Dobles en hombros, puños y ruedo.' },
  { label: 'Talles', value: 'Del S al XXL y del 38 al 48, con medidas en centímetros.' },
  { label: 'Cambios', value: `Sin cargo dentro de los ${RETURN_WINDOW_DAYS} días.` },
]
