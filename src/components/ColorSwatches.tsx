import { useId } from 'react'
import { COLORS, type ColorId } from '../data/colors'
import { getGarmentInk } from '../lib/garmentInk'

interface ColorSwatchesProps {
  colors: readonly ColorId[]
  selected: ColorId
  onSelect: (colorId: ColorId) => void
  // "sm" en las tarjetas del catálogo, "md" en la ficha de producto.
  size?: 'sm' | 'md'
  label?: string
}

const CHIP_SIZE = { sm: 'size-4', md: 'size-7' }
const TARGET_PADDING = { sm: 'p-1.5', md: 'p-2' }

// Radios nativos con forma de muestra de tela: el teclado (flechas) y los lectores de pantalla
// funcionan sin código extra.
export function ColorSwatches({ colors, selected, onSelect, size = 'sm', label = 'Color' }: ColorSwatchesProps) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label={label} className="-m-1.5 flex flex-wrap">
      {colors.map((colorId) => {
        const color = COLORS[colorId]
        const needsEdge = getGarmentInk(color.hex).outline !== null
        return (
          <label key={colorId} className={`cursor-pointer ${TARGET_PADDING[size]}`} title={color.name}>
            <input
              type="radio"
              name={name}
              value={colorId}
              checked={colorId === selected}
              onChange={() => onSelect(colorId)}
              aria-label={color.name}
              className="peer sr-only"
            />
            <span
              className={`block ${CHIP_SIZE[size]} outline-offset-2 peer-checked:outline peer-checked:outline-1 peer-checked:outline-ink peer-focus-visible:outline-2 ${needsEdge ? 'shadow-[inset_0_0_0_1px_rgb(0_0_0/0.2)]' : ''}`}
              style={{ backgroundColor: color.hex }}
            />
          </label>
        )
      })}
    </div>
  )
}
