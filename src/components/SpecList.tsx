interface SpecListProps {
  specs: readonly { label: string; value: string }[]
  className?: string
}

// Ficha técnica: dato y valor, separados por líneas de hilo.
export function SpecList({ specs, className = '' }: SpecListProps) {
  return (
    <dl className={`text-sm ${className}`}>
      {specs.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-t border-rule py-3">
          <dt className="text-muted">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
