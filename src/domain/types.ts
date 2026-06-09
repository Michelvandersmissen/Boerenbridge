// Domeinmodellen voor de Boerenbridge score-app.
// Alle objecten worden immutable behandeld (nieuwe kopieën, geen mutatie).

export interface Player {
  id: string
  naam: string
}

/** Beschikbare scoring-presets. 'custom' laat de velden vrij instellen. */
export type ScoringPreset = 'tien-plus-twee' | 'drie-per-slag' | 'zaans' | 'custom'

/**
 * Hoe een ronde wordt gescoord:
 * - 'juist-fout': bonus + punten per slag bij juiste voorspelling, anders straf per verschil.
 * - 'per-slag':   vast aantal punten per gehaalde slag, ongeacht de voorspelling (Zaans).
 */
export type ScoringModus = 'juist-fout' | 'per-slag'

export interface ScoringConfig {
  preset: ScoringPreset
  modus: ScoringModus
  /** Bonus bij een correcte voorspelling (alleen 'juist-fout'). */
  bonusJuist: number
  /** Punten per gehaalde slag. */
  puntenPerSlag: number
  /** Strafpunten (positief getal) per slag verschil bij een foute voorspelling. */
  strafPerVerschil: number
}

/** Richting van de kaarten-reeks over de rondes heen. */
export type SequentieModus = 'op' | 'op-af'

export interface RoundEntry {
  playerId: string
  /** Geboden (voorspelde) slagen. */
  bod: number
  /** Daadwerkelijk gehaalde slagen. */
  gehaald: number
}

export interface Round {
  /** Aantal kaarten dat deze ronde is gedeeld. */
  kaarten: number
  /** Index in de spelerslijst van de deler deze ronde. */
  delerIndex: number
  /** Optionele troefkleur (informatief). */
  troef?: string
  entries: RoundEntry[]
}

export type GameStatus = 'setup' | 'spelen' | 'klaar'

export interface Game {
  id: string
  naam: string
  createdAt: number
  updatedAt: number
  players: Player[]
  scoring: ScoringConfig
  /** Volledige geplande kaarten-reeks, bijv. [1,2,3,2,1]. */
  kaartenReeks: number[]
  rounds: Round[]
  status: GameStatus
}
