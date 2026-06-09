import type { Game, RoundEntry, SequentieModus } from './types'
import { rondeScore } from './scoring'

const DECK_SIZE = 52

/** Maximaal aantal kaarten per speler bij een gegeven aantal spelers. */
export function maxKaarten(spelerCount: number, deckSize = DECK_SIZE): number {
  return Math.floor(deckSize / spelerCount)
}

/** Genereert de kaarten-reeks over de rondes, bijv. [1,2,3,4,3,2,1] voor op-af. */
export function genereerKaartenReeks(
  max: number,
  modus: SequentieModus,
): number[] {
  const op = Array.from({ length: max }, (_, i) => i + 1)
  if (modus === 'op') {
    return op
  }
  const af = Array.from({ length: max - 1 }, (_, i) => max - 1 - i)
  return [...op, ...af]
}

/** Index in de spelerslijst van de deler voor een gegeven ronde. */
export function delerIndex(
  rondeIndex: number,
  spelerCount: number,
  startDelerIndex = 0,
): number {
  return (startDelerIndex + rondeIndex) % spelerCount
}

/**
 * Het bod dat de deler NIET mag doen volgens de deler-regel: de waarde die het
 * totaal precies gelijk aan het aantal kaarten zou maken. Null als de anderen al
 * meer dan het aantal kaarten bieden (dan kan de regel niet geschonden worden).
 */
export function verbodenDelerBod(
  somAndereBiedingen: number,
  kaarten: number,
): number | null {
  const verboden = kaarten - somAndereBiedingen
  return verboden >= 0 ? verboden : null
}

export function somBiedingen(entries: readonly RoundEntry[]): number {
  return entries.reduce((sum, e) => sum + e.bod, 0)
}

export function somGehaald(entries: readonly RoundEntry[]): number {
  return entries.reduce((sum, e) => sum + e.gehaald, 0)
}

/** De som van de gehaalde slagen moet gelijk zijn aan het aantal kaarten. */
export function isSlagenGeldig(
  entries: readonly RoundEntry[],
  kaarten: number,
): boolean {
  return somGehaald(entries) === kaarten
}

export interface StandRegel {
  playerId: string
  totaal: number
  rondeScores: number[]
  positie: number
}

/**
 * Berekent de totaalstand per speler, gesorteerd aflopend (leider eerst).
 * Met `aantalRondes` reken je alleen over de eerste N rondes (handig om de
 * stand tot en met de vorige ronde te tonen, zonder de ronde die nu wordt ingevuld).
 */
export function berekenStand(
  game: Readonly<Game>,
  aantalRondes: number = game.rounds.length,
): StandRegel[] {
  const rondes = game.rounds.slice(0, Math.max(0, aantalRondes))
  const regels = game.players.map((player): Omit<StandRegel, 'positie'> => {
    const rondeScores = rondes.map((round) => {
      const entry = round.entries.find((e) => e.playerId === player.id)
      if (!entry) {
        return 0
      }
      return rondeScore(entry.bod, entry.gehaald, game.scoring)
    })
    const totaal = rondeScores.reduce((sum, s) => sum + s, 0)
    return { playerId: player.id, totaal, rondeScores }
  })

  return regels
    .slice()
    .sort((a, b) => b.totaal - a.totaal)
    .map((regel, i) => ({ ...regel, positie: i + 1 }))
}
