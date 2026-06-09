import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { z } from 'zod'
import type { Game } from '../domain/types'
import { getDb } from './config'

const COLLECTIE = 'games'

// Schema-validatie op de systeemgrens (data uit Firestore is onvertrouwd).
const playerSchema = z.object({ id: z.string(), naam: z.string() })

const scoringSchema = z.object({
  preset: z.enum([
    'tien-plus-twee',
    'tien-plus-een',
    'drie-per-slag',
    'zaans',
    'custom',
  ]),
  modus: z.enum(['juist-fout', 'per-slag']),
  bonusJuist: z.number(),
  puntenPerSlag: z.number(),
  strafPerVerschil: z.number(),
})

const entrySchema = z.object({
  playerId: z.string(),
  bod: z.number().int().min(0),
  gehaald: z.number().int().min(0),
})

const roundSchema = z.object({
  kaarten: z.number().int().min(1),
  delerIndex: z.number().int().min(0),
  troef: z.string().optional(),
  entries: z.array(entrySchema),
})

const gameSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  naam: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  players: z.array(playerSchema),
  scoring: scoringSchema,
  kaartenReeks: z.array(z.number().int().min(1)),
  rounds: z.array(roundSchema),
  status: z.enum(['setup', 'spelen', 'klaar']),
})

function parseGame(id: string, data: unknown): Game | null {
  const result = gameSchema.safeParse({ ...(data as object), id })
  if (!result.success) {
    return null
  }
  return result.data
}

/** Maakt een nieuw spel aan en geeft het gegenereerde id terug. */
export async function createGame(data: Omit<Game, 'id'>): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTIE), data)
  return ref.id
}

/** Schrijft een volledig spel weg (id buiten het document gehouden). */
export async function saveGame(game: Game): Promise<void> {
  const { id, ...rest } = game
  await setDoc(doc(getDb(), COLLECTIE, id), rest)
}

export async function deleteGame(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIE, id))
}

const NOOP = () => {}

/** Abonneert op één spel; roept onChange aan bij elke wijziging (realtime). */
export function subscribeGame(
  id: string,
  onChange: (game: Game | null) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    return onSnapshot(
      doc(getDb(), COLLECTIE, id),
      (snap) => onChange(snap.exists() ? parseGame(snap.id, snap.data()) : null),
      (error) => onError(error),
    )
  } catch (error: unknown) {
    onError(error instanceof Error ? error : new Error('Firebase-fout'))
    return NOOP
  }
}

/** Abonneert op de spellen van één eigenaar, nieuwste eerst. */
export function subscribeGames(
  ownerId: string,
  onChange: (games: Game[]) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const q = query(
      collection(getDb(), COLLECTIE),
      where('ownerId', '==', ownerId),
      orderBy('updatedAt', 'desc'),
    )
    return onSnapshot(
      q,
      (snap) => {
        const games = snap.docs
          .map((d) => parseGame(d.id, d.data()))
          .filter((g): g is Game => g !== null)
        onChange(games)
      },
      (error) => onError(error),
    )
  } catch (error: unknown) {
    onError(error instanceof Error ? error : new Error('Firebase-fout'))
    return NOOP
  }
}
