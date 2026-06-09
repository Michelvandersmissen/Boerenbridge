import type { Game } from '../domain/types'
import { berekenStand } from '../domain/rounds'

interface ScoreboardProps {
  game: Game
  /** Markeer de winnaar (bij afgerond spel). */
  toonWinnaar?: boolean
  /** Reken alleen over de eerste N rondes (standaard: alle). */
  aantalRondes?: number
}

/** Toont de totaalstand per speler, leider eerst. */
export function Scoreboard({
  game,
  toonWinnaar = false,
  aantalRondes,
}: ScoreboardProps) {
  const stand = berekenStand(game, aantalRondes)
  const naamVan = (id: string) =>
    game.players.find((p) => p.id === id)?.naam ?? '?'

  const getoondeRondes =
    aantalRondes === undefined ? game.rounds.length : aantalRondes
  const ondertitel =
    aantalRondes !== undefined && getoondeRondes < game.rounds.length
      ? getoondeRondes === 0
        ? 'nog geen afgeronde ronde'
        : `t/m ronde ${getoondeRondes}`
      : null

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-3 flex items-baseline gap-2 text-lg font-semibold">
        Stand
        {ondertitel && (
          <span className="text-sm font-normal text-slate-500">
            {ondertitel}
          </span>
        )}
      </h2>
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
