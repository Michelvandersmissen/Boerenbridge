import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { getAuthInstance } from './config'

/** Zorgt dat er een (anonieme) gebruiker is en levert de uid via de callback. */
export function watchAuth(
  onUser: (uid: string | null) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const auth = getAuthInstance()
    const unsub = onAuthStateChanged(
      auth,
      (user: User | null) => {
        if (user) {
          onUser(user.uid)
        } else {
          // Nog niemand ingelogd: meld anoniem aan.
          signInAnonymously(auth).catch((err: unknown) =>
            onError(err instanceof Error ? err : new Error('Inloggen mislukt')),
          )
        }
      },
      (err) => onError(err instanceof Error ? err : new Error('Auth-fout')),
    )
    return unsub
  } catch (error: unknown) {
    onError(error instanceof Error ? error : new Error('Firebase-fout'))
    return () => {}
  }
}
