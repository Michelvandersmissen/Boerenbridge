import type { Player } from '../domain/types'
import { maakId } from '../lib/util'

interface PlayerSetupProps {
  players: Player[]
  onChange: (players: Player[]) => void
}

const MAX_SPELERS = 8

/** Spelers toevoegen, hernoemen, verwijderen en de volgorde bepalen. */
export function PlayerSetup({ players, onChange }: PlayerSetupProps) {
  const hernoem = (id: string, naam: string) =>
    onChange(players.map((p) => (p.id === id ? { ...p, naam } : p)))

  const verwijder = (id: string) =>
    onChange(players.filter((p) => p.id !== id))

  const voegToe = () =>
    onChange([...players, { id: maakId(), naam: '' }])

  const verplaats = (index: number, richting: -1 | 1) => {
    const doel = index + richting
    if (doel < 0 || doel >= players.length) return
    const kopie = players.slice()
    ;[kopie[index], kopie[doel]] = [kopie[doel], kopie[index]]
    onChange(kopie)
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-slate-200">Spelers</h2>
      {players.map((p, i) => (
        <div key={p.id} className="flex items-center gap-2">
          <span className="w-5 text-right text-sm text-slate-500">{i + 1}.</span>
          <input
            value={p.naam}
            onChange={(e) => hernoem(p.id, e.target.value)}
            placeholder={`Speler ${i + 1}`}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
          <button
            type="button"
            onClick={() => verplaats(i, -1)}
            disabled={i === 0}
            aria-label="omhoog"
            className="h-9 w-9 rounded-lg bg-slate-700 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => verplaats(i, 1)}
            disabled={i === players.length - 1}
            aria-label="omlaag"
            className="h-9 w-9 rounded-lg bg-slate-700 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => verwijder(p.id)}
            aria-label="verwijder"
            className="h-9 w-9 rounded-lg bg-rose-900/60 text-rose-200"
          >
            ✕
          </button>
        </div>
      ))}
      {players.length < MAX_SPELERS && (
        <button
          type="button"
          onClick={voegToe}
          className="mt-1 rounded-lg border border-dashed border-slate-600 py-2 text-slate-300"
        >
          + Speler toevoegen
        </button>
      )}
    </div>
  )
}
