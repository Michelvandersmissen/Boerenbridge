interface StepperProps {
  waarde: number
  onChange: (waarde: number) => void
  min?: number
  max?: number
  /** Visuele waarschuwing (bijv. deler-regel geschonden). */
  waarschuwing?: boolean
  label?: string
}

/** Grote, duim-vriendelijke +/− teller voor snelle invoer. */
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
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs text-slate-400">{label}</span>}
      <div
        className={`flex items-center gap-2 rounded-xl px-2 py-1 ${ringClass}`}
      >
        <button
          type="button"
          onClick={omlaag}
          disabled={waarde <= min}
          aria-label="minder"
          className="h-11 w-11 rounded-lg bg-slate-700 text-2xl font-bold text-white disabled:opacity-30 active:bg-slate-600"
        >
          −
        </button>
        <span className="w-8 text-center text-2xl font-bold tabular-nums">
          {waarde}
        </span>
        <button
          type="button"
          onClick={omhoog}
          disabled={waarde >= max}
          aria-label="meer"
          className="h-11 w-11 rounded-lg bg-teal-600 text-2xl font-bold text-white disabled:opacity-30 active:bg-teal-500"
        >
          +
        </button>
      </div>
    </div>
  )
}
