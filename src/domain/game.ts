import type {
  Game,
  Player,
  Round,
  RoundEntry,
  ScoringConfig,
  SequentieModus,
} from './types'
import { delerIndex, genereerKaartenReeks, maxKaarten } from './rounds'

export interface NieuwSpelInput {
  naam: string
  /** uid van de eigenaar (anonieme login). */
  ownerId: string
  players: Player[]
  scoring: ScoringConfig
  sequentie: SequentieModus
  /** Optioneel max kaarten; standaard floor(52 / spelers). */
  maxKaartenOverride?: number
  /** Tijdstip (ms). Wordt door de aanroeper meegegeven (geen Date in domeinlaag). */
  nu: number
}

/** Bouwt de spel-data voor een nieuw spel (zonder id; die zet de repository). */
export function maakSpelData(input: NieuwSpelInput): Omit<Game, 'id'> {
  const max = input.maxKaartenOverride ?? maxKaarten(input.players.length)
  const kaartenReeks = genereerKaartenReeks(max, input.sequentie)

  return {
    ownerId: input.ownerId,
    naam: input.naam,
    createdAt: input.nu,
    updatedAt: input.nu,
    players: input.players,
    scoring: input.scoring,
    kaartenReeks,
    rounds: [],
    status: 'spelen',
  }
}

/** Lege ronde met een nul-entry per speler. */
export function maakLegeRonde(
  players: readonly Player[],
  kaarten: number,
  delerIdx: number,
): Round {
  const entries: RoundEntry[] = players.map((p) => ({
    playerId: p.id,
    bod: 0,
    gehaald: 0,
  }))
  return { kaarten, delerIndex: delerIdx, entries }
}

/** Index van de eerstvolgende nog te spelen ronde (gelijk aan aantal gespeelde rondes). */
export function volgendeRondeIndex(game: Readonly<Game>): number {
  return game.rounds.length
}

/** Of alle geplande rondes gespeeld zijn. */
export function isSpelKlaar(game: Readonly<Game>): boolean {
  return game.rounds.length >= game.kaartenReeks.length
}

/**
 * Voegt een nieuwe lege ronde toe op basis van de kaarten-reeks en delerrotatie,
 * of geeft het spel ongewijzigd terug als alle rondes al gespeeld zijn.
 */
export function startVolgendeRonde(game: Readonly<Game>, nu: number): Game {
  if (isSpelKlaar(game)) {
    return { ...game, status: 'klaar', updatedAt: nu }
  }
  const index = volgendeRondeIndex(game)
  const kaarten = game.kaartenReeks[index]
  const delerIdx = delerIndex(index, game.players.length)
  const ronde = maakLegeRonde(game.players, kaarten, delerIdx)
  return {
    ...game,
    rounds: [...game.rounds, ronde],
    updatedAt: nu,
  }
}

/** Vervangt een ronde op index `rondeIndex` (immutable). */
export function vervangRonde(
  game: Readonly<Game>,
  rondeIndex: number,
  ronde: Round,
  nu: number,
): Game {
  const rounds = game.rounds.map((r, i) => (i === rondeIndex ? ronde : r))
  const klaar = rounds.length >= game.kaartenReeks.length
  return {
    ...game,
    rounds,
    status: klaar ? 'klaar' : 'spelen',
    updatedAt: nu,
  }
}
