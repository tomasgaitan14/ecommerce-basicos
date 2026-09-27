import { useId, useRef } from 'react'
import { SIZE_GUIDES, type SizeGuideId } from '../data/sizeGuides'
import { closeOnBackdropClick } from './dialog'

export function SizeGuideDialog({ guideId }: { guideId: SizeGuideId }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const guide = SIZE_GUIDES[guideId]

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm underline underline-offset-4"
      >
        Guía de talles
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={closeOnBackdropClick}
        className="m-auto w-[min(32rem,calc(100%-2rem))] bg-paper p-0 text-ink"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="type-title">
              Guía de talles
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="text-sm underline underline-offset-4"
            >
              Cerrar
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            {guide.title}. Medidas de la prenda en centímetros, tomadas en plano.
          </p>
          <table className="mt-5 w-full text-left text-sm tabular-nums">
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="py-2 font-medium">
                  Talle
                </th>
                {guide.columns.map((column) => (
                  <th key={column} scope="col" className="py-2 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((row) => (
                <tr key={row.size} className="border-b border-rule">
                  <th scope="row" className="py-2 font-medium">
                    {row.size}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={guide.columns[index]} className="py-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </>
  )
}
