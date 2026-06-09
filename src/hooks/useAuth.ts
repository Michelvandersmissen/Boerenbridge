import { useEffect, useState } from 'react'
import { watchAuth } from '../firebase/auth'

interface UseAuthResult {
  uid: string | null
  loading: boolean
  error: string | null
}

/** Houdt de (anonieme) auth-status bij en logt automatisch anoniem in. */
export function useAuth(): UseAuthResult {
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = watchAuth(
      (next) => {
        setUid(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { uid, loading, error }
}
