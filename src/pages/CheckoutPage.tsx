import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { OrderSummaryPanel } from '../components/OrderSummaryPanel'
import { useCart } from '../context/cartContext'
import { PROVINCES } from '../data/provinces'
import { useTrackOnce } from '../hooks/useTrackOnce'
import { ANALYTICS_EVENTS, buildCartEvent, buildPurchase, pushToDataLayer } from '../lib/analytics'
import {
  PAYMENT_METHODS,
  createOrder,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutValues,
} from '../lib/checkout'
import { PATHS } from '../paths'

const EMPTY_VALUES: CheckoutValues = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  apartment: '',
  city: '',
  province: '',
  postalCode: '',
  paymentMethod: PAYMENT_METHODS[0].value,
}

// Orden en pantalla: al enviar con errores, el foco va al primero de esta lista que falle.
const FIELD_ORDER: CheckoutField[] = [
  'email',
  'firstName',
  'lastName',
  'phone',
  'address',
  'apartment',
  'city',
  'province',
  'postalCode',
  'paymentMethod',
]

type FieldElement = HTMLInputElement | HTMLSelectElement

export function CheckoutPage() {
  const { cart, items, summary, clear } = useCart()
  const navigate = useNavigate()
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  // Solo con productos: el checkout vacío no es un checkout empezado.
  useTrackOnce(items.length > 0 ? PATHS.checkout : null, () =>
    buildCartEvent(ANALYTICS_EVENTS.beginCheckout, items, summary),
  )

  if (items.length === 0) {
    return (
      <section className="py-24">
        <title>Finalizar compra | basicos</title>
        <h1 className="type-title">Finalizar compra</h1>
        <p className="mt-3 text-muted">Tu carrito está vacío.</p>
        <Link to={PATHS.shop} className="button-primary mt-6">
          Ver la tienda
        </Link>
      </section>
    )
  }

  function change(field: CheckoutField) {
    return (event: ChangeEvent<FieldElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      // Al corregir un campo, su error desaparece; los demás esperan al próximo envío.
      setErrors(({ [field]: _fixed, ...rest }) => rest)
    }
  }

  // Al salir de un campo con datos, su error aparece enseguida. Pasar de largo por uno vacío no
  // es un error: los obligatorios se avisan recién al enviar.
  function validateOnBlur(field: CheckoutField) {
    return () => {
      if (values[field].trim() === '') return
      const result = validateCheckout(values)
      const error = result.ok ? undefined : result.errors[field]
      setErrors(({ [field]: _previous, ...rest }) => (error ? { ...rest, [field]: error } : rest))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateCheckout(values)
    if (!result.ok) {
      // Los mensajes tienen que estar en el DOM antes de mover el foco, para que se anuncien.
      flushSync(() => setErrors(result.errors))
      const firstInvalid = FIELD_ORDER.find((field) => result.errors[field])
      const element = firstInvalid ? formRef.current?.elements.namedItem(firstInvalid) : null
      if (element instanceof HTMLElement) element.focus()
      return
    }
    const order = createOrder(cart, result.data, { now: () => new Date(), random: Math.random })
    // Acá y no en la confirmación: esa página se puede recargar y contaría la compra dos veces.
    pushToDataLayer(buildPurchase(order))
    clear()
    navigate(PATHS.orderConfirmed, { replace: true, state: { order } })
  }

  const fieldProps = (field: CheckoutField) => ({
    name: field,
    value: values[field],
    onChange: change(field),
    onBlur: validateOnBlur(field),
    error: errors[field],
  })

  return (
    <>
      <title>Finalizar compra | basicos</title>
      <h1 className="type-title pt-10 md:pt-14">Finalizar compra</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-x-10">
        <form ref={formRef} noValidate onSubmit={handleSubmit} className="grid gap-10 md:col-span-7">
          <FormSection title="Contacto">
            <TextField label="Email" type="email" autoComplete="email" spellCheck={false} {...fieldProps('email')} />
          </FormSection>

          <FormSection title="Envío">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Nombre" autoComplete="given-name" {...fieldProps('firstName')} />
              <TextField label="Apellido" autoComplete="family-name" {...fieldProps('lastName')} />
            </div>
            <TextField label="Teléfono" type="tel" autoComplete="tel" {...fieldProps('phone')} />
            <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
              <TextField label="Calle y número" autoComplete="address-line1" {...fieldProps('address')} />
              <TextField
                label="Piso y departamento (opcional)"
                autoComplete="address-line2"
                {...fieldProps('apartment')}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Localidad" autoComplete="address-level2" {...fieldProps('city')} />
              <TextField
                label="Código postal"
                autoComplete="postal-code"
                autoCapitalize="characters"
                {...fieldProps('postalCode')}
              />
            </div>
            <SelectField label="Provincia" autoComplete="address-level1" {...fieldProps('province')}>
              <option value="">Elegí una provincia</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </SelectField>
          </FormSection>

          <FormSection title="Pago">
            <div className="grid gap-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex cursor-pointer items-center gap-3 border border-control px-4 py-3 has-checked:border-ink"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={values.paymentMethod === method.value}
                    onChange={change('paymentMethod')}
                    className="accent-ink"
                  />
                  {method.label}
                </label>
              ))}
            </div>
            {errors.paymentMethod && <p className="text-sm text-alert">{errors.paymentMethod}</p>}
            <p className="text-xs text-muted">
              Es una demo: no se cobra nada. Al confirmar se genera un pedido de prueba.
            </p>
          </FormSection>

          <button type="submit" className="button-primary min-h-12 w-full">
            Confirmar pedido
          </button>
        </form>

        <div className="md:sticky md:top-24 md:col-span-5 md:self-start">
          <OrderSummaryPanel items={items} summary={summary} />
        </div>
      </div>
    </>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5">
      <legend className="mb-1 text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

interface FieldProps {
  label: string
  name: CheckoutField
  value: string
  onChange: (event: ChangeEvent<FieldElement>) => void
  onBlur: () => void
  error?: string
  autoComplete: string
}

// 16 px: con menos, Safari de iOS hace zoom al enfocar el campo.
const CONTROL_CLASS =
  'mt-1.5 min-h-11 w-full border border-control bg-paper px-3 py-2.5 text-[1rem] aria-invalid:border-alert'

function useFieldIds(error?: string) {
  const id = useId()
  const errorId = `${id}-error`
  return { id, errorId, describedBy: error ? errorId : undefined }
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} className="mt-1.5 text-sm text-alert">
      {error}
    </p>
  )
}

type TextFieldProps = FieldProps & Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'spellCheck' | 'autoCapitalize'>

function TextField({ label, error, type = 'text', ...inputProps }: TextFieldProps) {
  const { id, errorId, describedBy } = useFieldIds(error)
  return (
    <div>
      <label htmlFor={id} className="block text-sm">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={CONTROL_CLASS}
        {...inputProps}
      />
      <FieldError id={errorId} error={error} />
    </div>
  )
}

function SelectField({ label, error, children, ...selectProps }: FieldProps & { children: ReactNode }) {
  const { id, errorId, describedBy } = useFieldIds(error)
  return (
    <div>
      <label htmlFor={id} className="block text-sm">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={CONTROL_CLASS}
        {...selectProps}
      >
        {children}
      </select>
      <FieldError id={errorId} error={error} />
    </div>
  )
}
