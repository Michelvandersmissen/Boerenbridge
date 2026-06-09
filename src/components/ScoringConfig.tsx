import type { ScoringConfig as ScoringConfigType, ScoringPreset } from '../domain/types'
import { SCORING_PRESETS, presetConfig } from '../domain/scoring'

interface ScoringConfigProps {
  config: ScoringConfigType
  onChange: (config: ScoringConfigType) => void
}

const NUM_VELDEN: { key: keyof ScoringConfigType; label: string }[] = [
  { key: 'bonusJuist', label: 'Bonus bij juist' },
  { key: 'puntenPerSlag', label: 'Punten per slag' },
  { key: 'strafPerVerschil', label: 'Straf per verschil' },
]

/** Kiest een scoring-preset of stelt custom waarden in. */
export function ScoringConfig({ config, onChange }: ScoringConfigProps) {
  const kiesPreset = (preset: ScoringPreset) => {
    if (preset === 'custom') {
      onChange({ ...config, preset: 'custom' })
    } else {
      onChange(presetConfig(preset))
    }
  }

  const zetVeld = (key: keyof ScoringConfigType, waarde: number) =>
    onChange({ ...config, preset: 'custom', [key]: waarde })

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-200">Puntentelling</h2>
      <div className="flex flex-col gap-2">
        {SCORING_PRESETS.map((p) => (
          <button
            key={p.preset}
            type="button"
            onClick={() => kiesPreset(p.preset)}
            className={`rounded-lg border p-3 text-left ${
              config.preset === p.preset
                ? 'border-teal-500 bg-teal-500/10'
                : 'border-slate-700 bg-slate-800'
            }`}
          >
            <div className="font-semibold text-slate-100">{p.label}</div>
            <div className="text-sm text-slate-400">{p.beschrijving}</div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => kiesPreset('custom')}
          className={`rounded-lg border p-3 text-left ${
            config.preset === 'custom'
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-slate-700 bg-slate-800'
          }`}
        >
          <div className="font-semibold text-slate-100">Eigen instelling</div>
          <div className="text-sm text-slate-400">
            Stel de punten zelf in.
          </div>
        </button>
      </div>

      {config.preset === 'custom' && (
        <div className="grid grid-cols-3 gap-2">
          {NUM_VELDEN.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1 text-xs text-slate-400">
              {label}
              <input
                type="number"
                value={config[key] as number}
                onChange={(e) => zetVeld(key, Number(e.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-center text-white"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
