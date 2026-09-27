import { useId } from 'react'
import type { GarmentColor } from '../data/colors'
import { GARMENTS, type GarmentType } from '../data/garments'
import { getGarmentInk } from '../lib/garmentInk'

interface GarmentImageProps {
  garment: GarmentType
  color: GarmentColor
  // Sin etiqueta, el dibujo es decorativo y los lectores de pantalla lo saltean.
  label?: string
  className?: string
}

// Las líneas mantienen 1 px en pantalla sin importar el tamaño del dibujo.
const LINE = { vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const STITCH_DASHES = '3 2.5'
const CORD_WIDTH = 1.6

export function GarmentImage({ garment, color, label, className }: GarmentImageProps) {
  const drawing = GARMENTS[garment]
  const ink = getGarmentInk(color.hex)
  // useId puede traer caracteres que no sirven dentro de url(#...).
  const id = useId().replace(/[^\w-]/g, '')
  const [x, y, width, height] = drawing.viewBox
  const pieces = [drawing.body, ...(drawing.overlays ?? [])]

  return (
    <svg
      viewBox={drawing.viewBox.join(' ')}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={drawing.body} fill={color.hex} stroke={ink.outline ?? 'none'} {...LINE} />
      {drawing.overlays?.map((d) => (
        <path key={d} d={d} fill={color.hex} stroke={ink.line} {...LINE} />
      ))}
      {color.melange && (
        <>
          <defs>
            <clipPath id={`${id}-clip`}>
              {pieces.map((d) => (
                <path key={d} d={d} />
              ))}
            </clipPath>
            {/* Textura de hilado: ruido gris, muy tenue, recortado a la silueta. */}
            <filter id={`${id}-melange`} x={x} y={y} width={width} height={height} filterUnits="userSpaceOnUse">
              <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={4} />
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 -0.2" />
            </filter>
          </defs>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            filter={`url(#${id}-melange)`}
            clipPath={`url(#${id}-clip)`}
          />
        </>
      )}
      {drawing.shades?.map((d) => (
        <path key={d} d={d} fill={ink.shade} />
      ))}
      {drawing.seams?.map((d) => (
        <path key={d} d={d} fill="none" stroke={ink.line} {...LINE} />
      ))}
      {drawing.stitches?.map((d) => (
        <path key={d} d={d} fill="none" stroke={ink.line} strokeDasharray={STITCH_DASHES} {...LINE} />
      ))}
      {drawing.cords?.map((d) => (
        <path key={d} d={d} fill="none" stroke={ink.line} strokeWidth={CORD_WIDTH} {...LINE} />
      ))}
      {drawing.fills?.map((d) => (
        <path key={d} d={d} fill={ink.line} />
      ))}
      {drawing.dots?.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ink.line} />
      ))}
    </svg>
  )
}
