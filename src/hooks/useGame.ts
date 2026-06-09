import { useCallback, useEffect, useState } from 'react'
import type { Game } from '../domain/types'
import { saveGame, subscribeGame } from '../firebase/games'

interface UseGameResult {
  game: Game | null
  loading: boolean
  error: string | null
  /** Schrijft een gewijzigd spel weg naar Firestore. */
  opslaan: (game: Game) => Promise<void>
}

/** Abonneert op één spel en biedt een opslaan-actie. */
export function useGame(id: string): UseGameResult {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeGame(
      id,
      (next) => {
        setGame(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [id])

  const opslaan = useCallback(async (next: Game) => {
    try {
      await saveGame(next)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Opslaan mislukt'
      setError(message)
      throw new Error(message, { cause: err })
    }
  }, [])

  return { game, loading, error, opslaan }
}
