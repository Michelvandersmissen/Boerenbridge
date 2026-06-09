import type { ScoringConfig, ScoringPreset } from './types'

export interface ScoringPresetInfo {
  preset: ScoringPreset
  label: string
  beschrijving: string
  config: ScoringConfig
}

const PRESET_CONFIGS: Record<Exclude<ScoringPreset, 'custom'>, ScoringConfig> = {
  'tien-plus-twee': {
    preset: 'tien-plus-twee',
    modus: 'juist-fout',
    bonusJuist: 10,
    puntenPerSlag: 2,
    strafPerVerschil: 2,
  },
  'drie-per-slag': {
    preset: 'drie-per-slag',
    modus: 'juist-fout',
    bonusJuist: 0,
    puntenPerSlag: 3,
    strafPerVerschil: 3,
  },
  zaans: {
    preset: 'zaans',
    modus: 'per-slag',
    bonusJuist: 0,
    puntenPerSlag: 5,
    strafPerVerschil: 0,
  },
}

/** Lijst van keuzbare presets voor de UI. */
export const SCORING_PRESETS: ScoringPresetInfo[] = [
  {
    preset: 'tien-plus-twee',
    label: '10 + 2 per slag',
    beschrijving: 'Juist = 10 punten + 2 per slag. Fout = −2 per slag verschil.',
    config: PRESET_CONFIGS['tien-plus-twee'],
  },
  {
    preset: 'drie-per-slag',
    label: '3 per slag',
    beschrijving: 'Juist = 3 per slag. Fout = −3 per slag verschil.',
    config: PRESET_CONFIGS['drie-per-slag'],
  },
  {
    preset: 'zaans',
    label: 'Zaans: 5 per slag',
    beschrijving: 'Elke gehaalde slag is 5 punten, ongeacht de voorspelling.',
    config: PRESET_CONFIGS.zaans,
  },
]

/** Standaard-config voor een gegeven preset. 'custom' valt terug op "10 + 2 per slag". */
export function presetConfig(preset: ScoringPreset): ScoringConfig {
  if (preset === 'custom') {
    return { ...PRESET_CONFIGS['tien-plus-twee'], preset: 'custom' }
  }
  return { ...PRESET_CONFIGS[preset] }
}

export function isVoorspellingJuist(bod: number, gehaald: number): boolean {
  return bod === gehaald
}

/** Berekent de rondescore voor één speler op basis van bod, gehaalde slagen en config. */
export function rondeScore(
  bod: number,
  gehaald: number,
  config: Readonly<ScoringConfig>,
): number {
  if (config.modus === 'per-slag') {
    return config.puntenPerSlag * gehaald
  }

  if (isVoorspellingJuist(bod, gehaald)) {
    return config.bonusJuist + config.puntenPerSlag * gehaald
  }

  const verschil = Math.abs(bod - gehaald)
  return -config.strafPerVerschil * verschil
}
