import { PROVINCES } from '../data/provinces'
import { describeCart, type CartItem, type CartState } from './cart'
import type { OrderSummary } from './pricing'

export const PAYMENT_METHODS = [
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
] as const

export interface CheckoutValues {
  email: string
  firstName: string
  lastName: string
  phone: string
  // Calle y número.
  address: string
  // Piso y departamento: el único campo opcional.
  apartment: string
  city: string
  province: string
  postalCode: string
  paymentMethod: string
}

export type CheckoutField = keyof CheckoutValues
export type CheckoutErrors = Partial<Record<CheckoutField, string>>
export type CheckoutResult = { ok: true; data: CheckoutValues } | { ok: false; errors: CheckoutErrors }

const MAX_LENGTH = { email: 254, name: 50, address: 100, apartment: 20, city: 60 }
const MIN_NAME_LENGTH = 2
const PHONE_DIGITS = { min: 8, max: 15 }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Palabras de letras separadas por un espacio, apóstrofo o guion: "María José", "D'Alessandro".
const NAME_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u
const PHONE_PATTERN = /^\+?[\d\s()-]+$/
// Localidades como "Villa Gral. Belgrano" o "25 de Mayo".
const CITY_PATTERN = /^[\p{L}\d]+(?:[ .'’-]+[\p{L}\d]+)*\.?$/u
// Código postal viejo (4 números) o CPA: letra de provincia (no existen la I ni la O),
// 4 números y 3 letras.
const POSTAL_CODE_PATTERN = /^(?:\d{4}|[A-HJ-NP-Z]\d{4}[A-Z]{3})$/
const LETTER = /\p{L}/u
// Global: se usa con match() para contar todos los dígitos.
const DIGITS = /\d/g

const tooLong = (max: number) => `Usá hasta ${max} caracteres.`

function normalize(values: CheckoutValues): CheckoutValues {
  const clean = (value: string) => value.trim().replace(/\s+/g, ' ')
  return {
    email: values.email.trim(),
    firstName: clean(values.firstName),
    lastName: clean(values.lastName),
    phone: clean(values.phone),
    address: clean(values.address),
    apartment: clean(values.apartment),
    city: clean(values.city),
    province: values.province.trim(),
    postalCode: values.postalCode.trim().toUpperCase(),
    paymentMethod: values.paymentMethod.trim(),
  }
}

function validateEmail(email: string): string | undefined {
  if (email === '') return 'Ingresá tu email.'
  if (email.length > MAX_LENGTH.email) return tooLong(MAX_LENGTH.email)
  if (!EMAIL_PATTERN.test(email)) return 'Revisá el email: tiene que ser como nombre@dominio.com.'
}

function validateName(name: string, label: 'nombre' | 'apellido'): string | undefined {
  if (name === '') return `Ingresá tu ${label}.`
  if (name.length < MIN_NAME_LENGTH) return `Ingresá tu ${label} completo.`
  if (name.length > MAX_LENGTH.name) return tooLong(MAX_LENGTH.name)
  if (!NAME_PATTERN.test(name)) return 'Usá solo letras, espacios, apóstrofos o guiones.'
}

function validatePhone(phone: string): string | undefined {
  if (phone === '') return 'Ingresá un teléfono.'
  const digits = phone.match(DIGITS)?.length ?? 0
  if (!PHONE_PATTERN.test(phone) || digits < PHONE_DIGITS.min || digits > PHONE_DIGITS.max) {
    return `Revisá el teléfono: con código de área, entre ${PHONE_DIGITS.min} y ${PHONE_DIGITS.max} números.`
  }
}

function validateAddress(address: string): string | undefined {
  if (address === '') return 'Ingresá la calle y el número.'
  if (address.length > MAX_LENGTH.address) return tooLong(MAX_LENGTH.address)
  if (!LETTER.test(address) || !/\d/.test(address)) return 'Incluí la calle y el número.'
}

function validateCity(city: string): string | undefined {
  if (city === '') return 'Ingresá la localidad.'
  if (city.length > MAX_LENGTH.city) return tooLong(MAX_LENGTH.city)
  if (!CITY_PATTERN.test(city) || !LETTER.test(city)) return 'Usá solo letras, números, espacios, puntos o guiones.'
}

function validatePostalCode(postalCode: string): string | undefined {
  if (postalCode === '') return 'Ingresá el código postal.'
  if (!POSTAL_CODE_PATTERN.test(postalCode)) {
    return 'Revisá el código postal: 4 números (1425) o el formato nuevo (C1425ABC).'
  }
}

export function validateCheckout(values: CheckoutValues): CheckoutResult {
  const data = normalize(values)
  const checks: Record<CheckoutField, string | undefined> = {
    email: validateEmail(data.email),
    firstName: validateName(data.firstName, 'nombre'),
    lastName: validateName(data.lastName, 'apellido'),
    phone: validatePhone(data.phone),
    address: validateAddress(data.address),
    apartment: data.apartment.length > MAX_LENGTH.apartment ? tooLong(MAX_LENGTH.apartment) : undefined,
    city: validateCity(data.city),
    province: PROVINCES.some((province) => province === data.province)
      ? undefined
      : 'Elegí una provincia de la lista.',
    postalCode: validatePostalCode(data.postalCode),
    paymentMethod: PAYMENT_METHODS.some((method) => method.value === data.paymentMethod)
      ? undefined
      : 'Elegí un medio de pago.',
  }
  const errors: CheckoutErrors = Object.fromEntries(
    Object.entries(checks).filter((entry): entry is [CheckoutField, string] => entry[1] !== undefined),
  )
  return Object.keys(errors).length === 0 ? { ok: true, data } : { ok: false, errors }
}

// Sin 0, O, 1, I ni L: el número se dicta por teléfono y no tiene que prestarse a confusión.
const ORDER_NUMBER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const ORDER_NUMBER_LENGTH = 6
const ORDER_NUMBER_PREFIX = 'B-'

export interface Order {
  number: string
  // Fecha en formato ISO.
  createdAt: string
  customer: CheckoutValues
  items: CartItem[]
  summary: OrderSummary
}

export class EmptyCartError extends Error {
  constructor() {
    super('No se puede crear un pedido con el carrito vacío.')
    this.name = 'EmptyCartError'
  }
}

interface OrderDependencies {
  now: () => Date
  // Devuelve un número en [0, 1), como Math.random.
  random: () => number
}

function generateOrderNumber(random: () => number): string {
  const characters = Array.from(
    { length: ORDER_NUMBER_LENGTH },
    () => ORDER_NUMBER_ALPHABET[Math.floor(random() * ORDER_NUMBER_ALPHABET.length)],
  )
  return ORDER_NUMBER_PREFIX + characters.join('')
}

export function createOrder(cart: CartState, customer: CheckoutValues, { now, random }: OrderDependencies): Order {
  const { items, summary } = describeCart(cart)
  if (items.length === 0) throw new EmptyCartError()
  return {
    number: generateOrderNumber(random),
    createdAt: now().toISOString(),
    customer,
    items,
    summary,
  }
}
