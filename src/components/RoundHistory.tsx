import type { Game } from '../domain/types'
import { rondeScore } from '../domain/scoring'

interface RoundHistoryProps {
  game: Game
  /** Index van de ronde die nu actief bewerkt wordt (niet als historie tonen). */
  actieveIndex: number | null
  onBewerk: (rondeIndex: number) => void
}

/** Lijst van gespeelde rondes; tik om een ronde te corrigeren. */
export function RoundHistory({ game, actieveIndex, onBewerk }: RoundHistoryProps) {
  const naamVan = (id: string) =>
    game.players.find((p) => p.id === id)?.naam ?? '?'

  const teTonen = game.rounds
    .map((ronde, index) => ({ ronde, index }))
    .filter(({ index }) => index !== actieveIndex)

  if (teTonen.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Historie</h2>
      <div className="flex flex-col gap-2">
        {teTonen
          .slice()
          .reverse()
          .map(({ ronde, index }) => (
            <button
              key={index}
              type="button"
              onClick={() => onBewerk(index)}
              className="rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-left"
            >
              <div className="mb-1 flex justify-between text-sm text-slate-400">
                <span>
                  Ronde {index + 1} · {ronde.kaarten}{' '}
                  {ronde.kaarten === 1 ? 'kaart' : 'kaarten'}
                </span>
                <span className="text-teal-400">bewerken</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
                {ronde.entries.map((e) => {
                  const score = rondeScore(e.bod, e.gehaald, game.scoring)
                  return (
                    <span key={e.playerId}>
                      <span className="text-slate-300">{naamVan(e.playerId)}</span>{' '}
                      <span className="text-slate-500">
                        {e.bod}/{e.gehaald}
                      </span>{' '}
                      <span
                        className={score >= 0 ? 'text-teal-400' : 'text-rose-400'}
                      >
                        {score >= 0 ? `+${score}` : score}
                      </span>
                    </span>
                  )
                })}
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}
