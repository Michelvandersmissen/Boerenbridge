import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'
import { deleteGame } from '../firebase/games'

interface HomePageProps {
  onNieuw: () => void
  onOpen: (id: string) => void
}

export function HomePage({ onNieuw, onOpen }: HomePageProps) {
  const { games, loading, error } = useGames()

  const verwijder = (id: string) => {
    if (confirm('Dit spel verwijderen?')) {
      void deleteGame(id).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onNieuw}
        className="rounded-xl bg-teal-600 px-4 py-3 text-lg font-semibold text-white"
      >
        + Nieuw spel
      </button>

      {loading && <p className="text-slate-400">Laden…</p>}
      {error && (
        <p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-300">
          Kon spellen niet laden: {error}. Controleer je Firebase-instellingen.
        </p>
      )}
      {!loading && !error && (
        <GameList games={games} onOpen={onOpen} onDelete={verwijder} />
      )}
    </div>
  )
}
