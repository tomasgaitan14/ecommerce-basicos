import { describe, expect, it } from 'vitest'
import { PROVINCES } from '../src/data/provinces'
import { EMPTY_CART, cartReducer, describeCart } from '../src/lib/cart'
import { EmptyCartError, createOrder, validateCheckout, type CheckoutValues } from '../src/lib/checkout'

const VALID: CheckoutValues = {
  email: 'lucas.fernandez@example.com',
  firstName: 'Lucas',
  lastName: 'Fernández',
  phone: '11 4567-8910',
  address: 'Av. Corrientes 1234',
  apartment: '',
  city: 'Buenos Aires',
  province: 'Ciudad Autónoma de Buenos Aires',
  postalCode: 'C1043AAZ',
  paymentMethod: 'mercadopago',
}

function errorsFor(overrides: Partial<CheckoutValues>) {
  const result = validateCheckout({ ...VALID, ...overrides })
  return result.ok ? {} : result.errors
}

describe('validateCheckout', () => {
  it('acepta un formulario completo y devuelve los datos limpios', () => {
    const result = validateCheckout({ ...VALID, firstName: '  Lucas  ', lastName: 'Fernández   Paz', postalCode: 'c1043aaz' })
    expect(result).toEqual({
      ok: true,
      data: { ...VALID, firstName: 'Lucas', lastName: 'Fernández Paz', postalCode: 'C1043AAZ' },
    })
  })

  it('marca cada campo obligatorio vacío o con solo espacios', () => {
    const blank = Object.fromEntries(Object.keys(VALID).map((field) => [field, '   '])) as unknown as CheckoutValues
    const result = validateCheckout(blank)
    expect(result.ok).toBe(false)
    expect(Object.keys(result.ok ? {} : result.errors).sort()).toEqual(
      ['address', 'city', 'email', 'firstName', 'lastName', 'paymentMethod', 'phone', 'postalCode', 'province'].sort(),
    )
  })

  it('piso y departamento es opcional pero tiene un largo máximo', () => {
    expect(errorsFor({ apartment: '3° B' })).toEqual({})
    expect(errorsFor({ apartment: 'x'.repeat(21) })).toHaveProperty('apartment')
  })

  describe('email', () => {
    it('rechaza direcciones sin arroba, sin dominio o con espacios', () => {
      for (const email of ['lucas.example.com', 'lucas@', 'lucas@example', 'lucas @example.com', '@example.com']) {
        expect(errorsFor({ email }), email).toHaveProperty('email')
      }
    })

    it('rechaza un email de más de 254 caracteres', () => {
      expect(errorsFor({ email: `${'a'.repeat(250)}@example.com` })).toHaveProperty('email')
    })
  })

  describe('nombre y apellido', () => {
    it('aceptan tildes, ñ, apóstrofos, guiones y nombres compuestos', () => {
      for (const name of ['María José', 'Ñandú', "D'Alessandro", 'Pérez-García', 'Müller']) {
        expect(errorsFor({ firstName: name, lastName: name }), name).toEqual({})
      }
    })

    it('rechazan números, símbolos y emojis', () => {
      for (const name of ['Lucas3', 'Lucas!', 'Lu_cas', 'Lucas 🙂', '-Lucas']) {
        expect(errorsFor({ firstName: name }), name).toHaveProperty('firstName')
        expect(errorsFor({ lastName: name }), name).toHaveProperty('lastName')
      }
    })

    it('rechazan menos de 2 o más de 50 caracteres', () => {
      expect(errorsFor({ firstName: 'L' })).toHaveProperty('firstName')
      expect(errorsFor({ lastName: 'a'.repeat(51) })).toHaveProperty('lastName')
      expect(errorsFor({ lastName: 'a'.repeat(50) })).toEqual({})
    })
  })

  describe('teléfono', () => {
    it('acepta formatos habituales con código de área', () => {
      for (const phone of ['1145678910', '+54 9 11 4567-8910', '(0351) 456-7890']) {
        expect(errorsFor({ phone }), phone).toEqual({})
      }
    })

    it('rechaza letras y cantidades de números fuera de rango', () => {
      for (const phone of ['11-CASA-1234', '4567-891', '+54 9 11 4567 8910 12345', '++54 11 4567 8910']) {
        expect(errorsFor({ phone }), phone).toHaveProperty('phone')
      }
    })
  })

  describe('dirección', () => {
    it('exige calle y número', () => {
      expect(errorsFor({ address: 'Av. Corrientes' })).toHaveProperty('address')
      expect(errorsFor({ address: '1234' })).toHaveProperty('address')
    })

    it('rechaza más de 100 caracteres', () => {
      expect(errorsFor({ address: `Calle ${'x'.repeat(95)} 12` })).toHaveProperty('address')
    })
  })

  describe('localidad', () => {
    it('acepta nombres con puntos, apóstrofos, guiones y números', () => {
      for (const city of ['San Carlos de Bariloche', 'Villa Gral. Belgrano', '25 de Mayo', "Villa L'Écluse"]) {
        expect(errorsFor({ city }), city).toEqual({})
      }
    })

    it('rechaza símbolos, solo números o más de 60 caracteres', () => {
      for (const city of ['Rosario!', '1234', 'a'.repeat(61)]) {
        expect(errorsFor({ city }), city).toHaveProperty('city')
      }
    })
  })

  describe('provincia', () => {
    it('acepta cualquiera de las 24 jurisdicciones', () => {
      expect(PROVINCES).toHaveLength(24)
      for (const province of PROVINCES) {
        expect(errorsFor({ province }), province).toEqual({})
      }
    })

    it('rechaza lo que no está en la lista', () => {
      expect(errorsFor({ province: 'Capital' })).toHaveProperty('province')
    })
  })

  describe('código postal', () => {
    it('acepta 4 números o el formato nuevo de 8 caracteres', () => {
      for (const postalCode of ['1425', 'C1425ABC', 'x5000abc']) {
        expect(errorsFor({ postalCode }), postalCode).toEqual({})
      }
    })

    it('rechaza otros largos, letras sueltas y letras de provincia inexistentes', () => {
      for (const postalCode of ['142', '14250', 'C1425AB', 'CC1425ABC', 'I1425ABC', 'O1425ABC']) {
        expect(errorsFor({ postalCode }), postalCode).toHaveProperty('postalCode')
      }
    })
  })

  describe('medio de pago', () => {
    it('acepta Mercado Pago y transferencia', () => {
      expect(errorsFor({ paymentMethod: 'mercadopago' })).toEqual({})
      expect(errorsFor({ paymentMethod: 'transferencia' })).toEqual({})
    })

    it('rechaza cualquier otro valor', () => {
      expect(errorsFor({ paymentMethod: 'efectivo' })).toHaveProperty('paymentMethod')
    })
  })
})

describe('createOrder', () => {
  const cart = cartReducer(
    cartReducer(EMPTY_CART, { type: 'add', productSlug: 'remera-clasica', colorId: 'marino', size: 'L', quantity: 2 }),
    { type: 'add', productSlug: 'buzo-capucha', colorId: 'gris', size: 'M', quantity: 1 },
  )
  const now = () => new Date('2026-09-27T15:30:00.000Z')
  const firstOption = () => 0

  it('guarda las prendas, el resumen y los datos del cliente', () => {
    const order = createOrder(cart, VALID, { now, random: firstOption })
    const { items, summary } = describeCart(cart)
    expect(order.items).toEqual(items)
    expect(order.summary).toEqual(summary)
    expect(order.customer).toEqual(VALID)
  })

  it('la fecha sale del reloj que recibe', () => {
    expect(createOrder(cart, VALID, { now, random: firstOption }).createdAt).toBe('2026-09-27T15:30:00.000Z')
  })

  it('el número tiene formato fijo y no usa caracteres que se confunden (0, O, 1, I, L)', () => {
    expect(createOrder(cart, VALID, { now, random: firstOption }).number).toBe('B-AAAAAA')
    expect(createOrder(cart, VALID, { now, random: () => 0.9999 }).number).toBe('B-999999')
    for (let seed = 0; seed < 50; seed += 1) {
      const number = createOrder(cart, VALID, { now, random: Math.random }).number
      expect(number).toMatch(/^B-[A-HJKMNP-Z2-9]{6}$/)
    }
  })

  it('no crea un pedido con el carrito vacío', () => {
    expect(() => createOrder(EMPTY_CART, VALID, { now, random: firstOption })).toThrow(EmptyCartError)
  })
})
