import { useState } from 'react'
import type { Game } from '../domain/types'
import { berekenStand } from '../domain/rounds'

interface ScoreboardProps {
  game: Game
  /** Markeer de winnaar (alleen op de eindstand). */
  toonWinnaar?: boolean
  /** Hoogst beschikbare ronde om te tonen (standaard: alle gespeelde rondes). */
  aantalRondes?: number
}

/** Toont de (tussen)stand per speler, met pijltjes om door de rondes te bladeren. */
export function Scoreboard({
  game,
  toonWinnaar = false,
  aantalRondes,
}: ScoreboardProps) {
  const maxRonde =
    aantalRondes === undefined ? game.rounds.length : aantalRondes

  // Welke ronde tonen we; volgt automatisch de nieuwste als er een ronde bijkomt.
  const [viewN, setViewN] = useState(maxRonde)
  const [prevMax, setPrevMax] = useState(maxRonde)
  if (maxRonde !== prevMax) {
    setPrevMax(maxRonde)
    setViewN(maxRonde)
  }
  const huidig = Math.min(Math.max(viewN, 1), Math.max(maxRonde, 1))

  const naamVan = (id: string) =>
    game.players.find((p) => p.id === id)?.naam ?? '?'

  if (maxRonde < 1) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <h2 className="flex items-baseline gap-2 text-lg font-semibold">
          Stand
          <span className="text-sm font-normal text-slate-500">
            nog geen afgeronde ronde
          </span>
        </h2>
      </div>
    )
  }

  const stand = berekenStand(game, huidig)
  const isEindstand = toonWinnaar && huidig === maxRonde

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-baseline gap-2 text-lg font-semibold">
          Stand
          <span className="text-sm font-normal text-slate-500">
            ronde {huidig}
          </span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewN(huidig - 1)}
            disabled={huidig <= 1}
            aria-label="vorige ronde"
            className="h-8 w-8 rounded-lg text-xl font-bold text-slate-300 disabled:opacity-25 active:opacity-60"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setViewN(huidig + 1)}
            disabled={huidig >= maxRonde}
            aria-label="volgende ronde"
            className="h-8 w-8 rounded-lg text-xl font-bold text-slate-300 disabled:opacity-25 active:opacity-60"
          >
            ›
          </button>
        </div>
      </div>

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
                {isEindstand && isLeider && <span>🏆</span>}
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
