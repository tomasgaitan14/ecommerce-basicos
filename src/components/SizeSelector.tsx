import { useId } from 'react'

interface SizeSelectorProps {
  sizes: readonly string[]
  selected: string | null
  onSelect: (size: string) => void
  stockFor: (size: string) => number
  // Id del mensaje de error, para asociarlo al grupo.
  errorId?: string
}

export function SizeSelector({ sizes, selected, onSelect, stockFor, errorId }: SizeSelectorProps) {
  const name = useId()
  return (
    <div
      role="radiogroup"
      aria-label="Talle"
      aria-describedby={errorId}
      className="grid grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))] gap-1.5"
    >
      {sizes.map((size) => {
        const soldOut = stockFor(size) === 0
        return (
          <label key={size} className={soldOut ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <input
              type="radio"
              name={name}
              value={size}
              checked={size === selected}
              disabled={soldOut}
              onChange={() => onSelect(size)}
              aria-label={soldOut ? `${size}, sin stock` : size}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center border border-control text-sm font-medium tabular-nums peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:border-rule peer-disabled:text-control peer-disabled:line-through">
              {size}
            </span>
          </label>
        )
      })}
    </div>
  )
}
