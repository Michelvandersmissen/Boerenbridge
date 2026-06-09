import type { Game } from '../domain/types'
import { berekenStand } from '../domain/rounds'

interface ScoreboardProps {
  game: Game
  /** Markeer de winnaar (bij afgerond spel). */
  toonWinnaar?: boolean
}

/** Toont de totaalstand per speler, leider eerst. */
export function Scoreboard({ game, toonWinnaar = false }: ScoreboardProps) {
  const stand = berekenStand(game)
  const naamVan = (id: string) =>
    game.players.find((p) => p.id === id)?.naam ?? '?'

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Stand</h2>
      <ol className="flex flex-col gap-1">
        {stand.map((regel) => {
          const isLeider = regel.positie === 1
          return (
            <li
              key={regel.playerId}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                isLeider ? 'bg-teal-500/15' : 'bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-slate-500">{regel.positie}.</span>
                <span className="font-medium">{naamVan(regel.playerId)}</span>
                {toonWinnaar && isLeider && <span>🏆</span>}
              </span>
              <span className="text-lg font-bold tabular-nums">
                {regel.totaal}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
