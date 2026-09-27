import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../src/data/categories'
import { PLACARD_SLUGS } from '../src/data/home'
import { PRODUCTS } from '../src/data/products'
import { SIZE_GUIDES } from '../src/data/sizeGuides'
import {
  getCategory,
  getProductBySlug,
  getProductsByCategory,
  getRelatedProducts,
  getVariantStock,
  isLowStock,
  parseSortOrder,
  sortProducts,
} from '../src/lib/catalog'

function productBySlug(slug: string) {
  const product = getProductBySlug(slug)
  if (!product) throw new Error(`El test necesita el producto ${slug}`)
  return product
}

describe('getProductBySlug', () => {
  it('devuelve el producto cuando el slug existe', () => {
    expect(getProductBySlug('remera-clasica')?.name).toBe('Remera clásica')
  })

  it('devuelve undefined cuando el slug no existe', () => {
    expect(getProductBySlug('remera-que-no-existe')).toBeUndefined()
  })
})

describe('getCategory', () => {
  it('devuelve la categoría cuando el slug existe', () => {
    expect(getCategory('ropa-interior')?.name).toBe('Ropa interior')
  })

  it('devuelve undefined para un slug que no es una categoría', () => {
    expect(getCategory('zapatillas')).toBeUndefined()
  })
})

describe('getProductsByCategory', () => {
  it('devuelve solo los productos de esa categoría, en el orden del catálogo', () => {
    expect(getProductsByCategory('camperas').map((product) => product.slug)).toEqual([
      'campera-bomber',
      'campera-acolchada',
    ])
  })
})

describe('sortProducts', () => {
  const prices = (products: readonly { price: number }[]) => products.map((product) => product.price)

  it('ordena de menor a mayor precio', () => {
    const sorted = prices(sortProducts(PRODUCTS, 'precio-asc'))
    expect(sorted).toEqual([...sorted].sort((a, b) => a - b))
  })

  it('ordena de mayor a menor precio', () => {
    const sorted = prices(sortProducts(PRODUCTS, 'precio-desc'))
    expect(sorted).toEqual([...sorted].sort((a, b) => b - a))
  })

  it('con "destacados" respeta el orden del catálogo', () => {
    expect(sortProducts(PRODUCTS, 'destacados')).toEqual(PRODUCTS)
  })

  it('ante precios iguales mantiene el orden del catálogo', () => {
    const samePrice = sortProducts(PRODUCTS, 'precio-asc')
      .filter((product) => product.price === 24900)
      .map((product) => product.slug)
    expect(samePrice).toEqual(['remera-clasica', 'boxer-pack'])
  })

  it('no modifica la lista que recibe', () => {
    const original = [...PRODUCTS]
    sortProducts(PRODUCTS, 'precio-desc')
    expect(PRODUCTS).toEqual(original)
  })
})

describe('parseSortOrder', () => {
  it('acepta los órdenes conocidos', () => {
    expect(parseSortOrder('precio-asc')).toBe('precio-asc')
    expect(parseSortOrder('precio-desc')).toBe('precio-desc')
  })

  it('cae en "destacados" si el valor falta o no es válido', () => {
    expect(parseSortOrder(null)).toBe('destacados')
    expect(parseSortOrder('')).toBe('destacados')
    expect(parseSortOrder('precio')).toBe('destacados')
  })
})

describe('getRelatedProducts', () => {
  it('sugiere solo prendas de otras categorías', () => {
    const remera = productBySlug('remera-clasica')
    const related = getRelatedProducts(remera)
    expect(related.length).toBeGreaterThan(0)
    expect(related.every((product) => product.category !== remera.category)).toBe(true)
  })

  it('sigue el orden de las categorías que combinan con la prenda', () => {
    const related = getRelatedProducts(productBySlug('pantalon-chino'))
    expect(related.map((product) => product.slug)).toEqual([
      'remera-clasica',
      'buzo-cuello-redondo',
      'camisa-oxford',
      'campera-bomber',
    ])
  })

  it('devuelve como máximo la cantidad pedida', () => {
    expect(getRelatedProducts(productBySlug('remera-clasica'), 2)).toHaveLength(2)
  })

  it('funciona para todos los productos sin repetir sugerencias', () => {
    for (const product of PRODUCTS) {
      const slugs = getRelatedProducts(product).map((related) => related.slug)
      expect(slugs, product.slug).toHaveLength(4)
      expect(new Set(slugs).size, product.slug).toBe(slugs.length)
      expect(slugs, product.slug).not.toContain(product.slug)
    }
  })
})

describe('getVariantStock', () => {
  it('devuelve las unidades de esa combinación de color y talle', () => {
    expect(getVariantStock('remera-clasica', 'negro', 'M')).toBe(2)
    expect(getVariantStock('remera-clasica', 'blanco', 'XXL')).toBe(0)
  })

  it('devuelve 0 si el producto, el color o el talle no existen', () => {
    expect(getVariantStock('remera-inexistente', 'negro', 'M')).toBe(0)
    expect(getVariantStock('remera-clasica', 'celeste', 'M')).toBe(0)
    expect(getVariantStock('remera-clasica', 'negro', '42')).toBe(0)
  })
})

describe('isLowStock', () => {
  it('marca como últimas unidades de 1 a 3', () => {
    expect([1, 2, 3].every(isLowStock)).toBe(true)
  })

  it('no marca lo agotado ni lo que tiene stock de sobra', () => {
    expect(isLowStock(0)).toBe(false)
    expect(isLowStock(4)).toBe(false)
  })
})

describe('datos del catálogo', () => {
  it('no tiene slugs repetidos', () => {
    const slugs = PRODUCTS.map((product) => product.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('cada producto pertenece a una categoría existente', () => {
    const categorySlugs: string[] = CATEGORIES.map((category) => category.slug)
    for (const product of PRODUCTS) {
      expect(categorySlugs, product.slug).toContain(product.category)
    }
  })

  it('ninguna categoría queda vacía', () => {
    for (const category of CATEGORIES) {
      expect(PRODUCTS.some((product) => product.category === category.slug), category.slug).toBe(true)
    }
  })

  it('los precios son enteros positivos', () => {
    for (const product of PRODUCTS) {
      expect(Number.isInteger(product.price) && product.price > 0, product.slug).toBe(true)
    }
  })

  it('cada producto tiene al menos un color y un talle, sin repetir', () => {
    for (const product of PRODUCTS) {
      expect(product.colors.length, product.slug).toBeGreaterThan(0)
      expect(product.sizes.length, product.slug).toBeGreaterThan(0)
      expect(new Set(product.colors).size, product.slug).toBe(product.colors.length)
      expect(new Set(product.sizes).size, product.slug).toBe(product.sizes.length)
    }
  })

  it('tiene exactamente una variante por cada color y talle', () => {
    for (const product of PRODUCTS) {
      const keys = product.variants.map((variant) => `${variant.colorId}/${variant.size}`)
      const expected = product.colors.flatMap((color) => product.sizes.map((size) => `${color}/${size}`))
      expect([...keys].sort(), product.slug).toEqual([...expected].sort())
    }
  })

  it('el stock es siempre un entero mayor o igual a cero', () => {
    for (const product of PRODUCTS) {
      for (const variant of product.variants) {
        const label = `${product.slug} ${variant.colorId}/${variant.size}`
        expect(Number.isInteger(variant.stock) && variant.stock >= 0, label).toBe(true)
      }
    }
  })
})

describe('guías de talles', () => {
  it('todo producto con más de un talle tiene guía', () => {
    for (const product of PRODUCTS.filter((candidate) => candidate.sizes.length > 1)) {
      expect(product.sizeGuide, product.slug).toBeDefined()
    }
  })

  it('la guía de cada producto cubre todos sus talles', () => {
    for (const product of PRODUCTS) {
      if (!product.sizeGuide) continue
      const guideSizes = SIZE_GUIDES[product.sizeGuide].rows.map((row) => row.size)
      expect(guideSizes, product.slug).toEqual(expect.arrayContaining(product.sizes))
    }
  })

  it('cada fila tiene una medida positiva por columna', () => {
    for (const [id, guide] of Object.entries(SIZE_GUIDES)) {
      for (const row of guide.rows) {
        expect(row.values, `${id} ${row.size}`).toHaveLength(guide.columns.length)
        expect(row.values.every((value) => value > 0), `${id} ${row.size}`).toBe(true)
      }
    }
  })
})

describe('datos de la portada', () => {
  it('el placard son seis prendas distintas que existen en el catálogo', () => {
    expect(new Set(PLACARD_SLUGS).size).toBe(6)
    for (const slug of PLACARD_SLUGS) {
      expect(getProductBySlug(slug), slug).toBeDefined()
    }
  })
})
