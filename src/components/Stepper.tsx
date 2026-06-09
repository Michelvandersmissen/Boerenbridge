interface StepperProps {
  waarde: number
  onChange: (waarde: number) => void
  min?: number
  max?: number
  /** Visuele waarschuwing (bijv. deler-regel geschonden). */
  waarschuwing?: boolean
  label?: string
}

/** Volle-breedte, duim-vriendelijke +/− teller: − links, waarde midden, + rechts. */
export function Stepper({
  waarde,
  onChange,
  min = 0,
  max = 99,
  waarschuwing = false,
  label,
}: StepperProps) {
  const omlaag = () => onChange(Math.max(min, waarde - 1))
  const omhoog = () => onChange(Math.min(max, waarde + 1))

  const ringClass = waarschuwing
    ? 'ring-2 ring-amber-400 bg-amber-400/10'
    : 'bg-slate-800'

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <span className="text-center text-xs uppercase text-slate-500">
          {label}
        </span>
      )}
      <div
        className={`flex w-full items-center justify-between gap-1 rounded-xl px-1 py-1 ${ringClass}`}
      >
        <button
          type="button"
          onClick={omlaag}
          disabled={waarde <= min}
          aria-label="minder"
          className="h-10 w-10 shrink-0 text-2xl font-bold text-slate-300 disabled:opacity-25 active:opacity-60"
        >
          −
        </button>
        <span className="min-w-0 flex-1 text-center text-xl font-bold tabular-nums">
          {waarde}
        </span>
        <button
          type="button"
          onClick={omhoog}
          disabled={waarde >= max}
          aria-label="meer"
          className="h-10 w-10 shrink-0 text-2xl font-bold text-teal-300 disabled:opacity-25 active:opacity-60"
        >
          +
        </button>
      </div>
    </div>
  )
}
