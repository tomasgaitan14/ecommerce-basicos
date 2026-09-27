interface QuantityStepperProps {
  value: number
  max: number
  onChange: (quantity: number) => void
  // Nombre de la prenda, para que cada botón diga qué cambia.
  itemName: string
}

const MIN_QUANTITY = 1

export function QuantityStepper({ value, max, onChange, itemName }: QuantityStepperProps) {
  const buttonClass =
    'flex size-9 items-center justify-center text-base disabled:cursor-not-allowed disabled:text-control'
  return (
    <div role="group" aria-label={`Cantidad de ${itemName}`} className="inline-flex items-center border border-control">
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= MIN_QUANTITY}
        aria-label={`Restar una unidad de ${itemName}`}
      >
        −
      </button>
      <output className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Sumar una unidad de ${itemName}`}
      >
        +
      </button>
    </div>
  )
}
