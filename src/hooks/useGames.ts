import { useEffect, useState } from 'react'
import type { Game } from '../domain/types'
import { subscribeGames } from '../firebase/games'

interface UseGamesResult {
  games: Game[]
  loading: boolean
  error: string | null
}

/** Abonneert op de spellen van de gegeven eigenaar (realtime, nieuwste eerst). */
export function useGames(ownerId: string): UseGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeGames(
      ownerId,
      (next) => {
        setGames(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [ownerId])

  return { games, loading, error }
}
