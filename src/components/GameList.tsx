import type { Game } from '../domain/types'
import { berekenStand } from '../domain/rounds'

interface GameListProps {
  games: Game[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

function datumLabel(ms: number): string {
  return new Date(ms).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Overzicht van opgeslagen spellen. */
export function GameList({ games, onOpen, onDelete }: GameListProps) {
  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-400">
        Nog geen spellen. Start een nieuw spel om te beginnen.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {games.map((game) => {
        const leider = berekenStand(game)[0]
        const leiderNaam = game.players.find(
          (p) => p.id === leider?.playerId,
        )?.naam
        return (
          <div
            key={game.id}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3"
          >
            <button
              type="button"
              onClick={() => onOpen(game.id)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{game.naam}</span>
                {game.status === 'klaar' && (
                  <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                    klaar
                  </span>
                )}
              </div>
              <div className="truncate text-sm text-slate-400">
                {game.players.map((p) => p.naam).join(', ')}
              </div>
              <div className="text-xs text-slate-500">
                {datumLabel(game.updatedAt)} · ronde{' '}
                {Math.min(game.rounds.length, game.kaartenReeks.length)}/
                {game.kaartenReeks.length}
                {leiderNaam && ` · leider: ${leiderNaam}`}
              </div>
            </button>
            <button
              type="button"
              onClick={() => onDelete(game.id)}
              aria-label="verwijder spel"
              className="h-9 w-9 shrink-0 rounded-lg bg-rose-900/60 text-rose-200"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
