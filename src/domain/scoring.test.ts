import { describe, it, expect } from 'vitest'
import {
  SCORING_PRESETS,
  presetConfig,
  rondeScore,
  isVoorspellingJuist,
} from './scoring'
import type { ScoringConfig } from './types'

describe('presetConfig', () => {
  it('levert de juiste waarden voor "10 + 2 per slag"', () => {
    expect(presetConfig('tien-plus-twee')).toEqual({
      preset: 'tien-plus-twee',
      modus: 'juist-fout',
      bonusJuist: 10,
      puntenPerSlag: 2,
      strafPerVerschil: 2,
    })
  })

  it('levert de juiste waarden voor "3 per slag"', () => {
    expect(presetConfig('drie-per-slag')).toMatchObject({
      modus: 'juist-fout',
      bonusJuist: 0,
      puntenPerSlag: 3,
      strafPerVerschil: 3,
    })
  })

  it('levert de juiste waarden voor "Zaans"', () => {
    expect(presetConfig('zaans')).toMatchObject({
      modus: 'per-slag',
      puntenPerSlag: 5,
    })
  })

  it('exposeert alle presets met label', () => {
    expect(SCORING_PRESETS.map((p) => p.preset)).toContain('tien-plus-twee')
    expect(SCORING_PRESETS.every((p) => p.label.length > 0)).toBe(true)
  })
})

describe('rondeScore — 10 + 2 per slag', () => {
  const cfg = presetConfig('tien-plus-twee')

  it('juiste voorspelling van 3 slagen = 10 + 2*3 = 16', () => {
    expect(rondeScore(3, 3, cfg)).toBe(16)
  })

  it('juiste voorspelling van 0 slagen = 10', () => {
    expect(rondeScore(0, 0, cfg)).toBe(10)
  })

  it('foute voorspelling, 2 te weinig = -4', () => {
    expect(rondeScore(3, 1, cfg)).toBe(-4)
  })

  it('foute voorspelling, 2 te veel = -4', () => {
    expect(rondeScore(1, 3, cfg)).toBe(-4)
  })
})

describe('rondeScore — 10 + 1 per slag', () => {
  const cfg = presetConfig('tien-plus-een')

  it('juiste voorspelling van 3 slagen = 10 + 1*3 = 13', () => {
    expect(rondeScore(3, 3, cfg)).toBe(13)
  })

  it('juiste voorspelling van 0 slagen = 10', () => {
    expect(rondeScore(0, 0, cfg)).toBe(10)
  })

  it('foute voorspelling, 2 verschil = -2', () => {
    expect(rondeScore(3, 1, cfg)).toBe(-2)
  })
})

describe('rondeScore — 3 per slag', () => {
  const cfg = presetConfig('drie-per-slag')

  it('juist voorspelde 2 slagen = 6', () => {
    expect(rondeScore(2, 2, cfg)).toBe(6)
  })

  it('1 slag verschil = -3', () => {
    expect(rondeScore(2, 3, cfg)).toBe(-3)
  })
})

describe('rondeScore — Zaans (per-slag)', () => {
  const cfg = presetConfig('zaans')

  it('telt 5 per gehaalde slag, ongeacht voorspelling', () => {
    expect(rondeScore(0, 3, cfg)).toBe(15)
    expect(rondeScore(3, 3, cfg)).toBe(15)
  })

  it('0 gehaalde slagen = 0', () => {
    expect(rondeScore(2, 0, cfg)).toBe(0)
  })
})

describe('rondeScore — custom config', () => {
  const cfg: ScoringConfig = {
    preset: 'custom',
    modus: 'juist-fout',
    bonusJuist: 5,
    puntenPerSlag: 1,
    strafPerVerschil: 1,
  }

  it('respecteert custom waarden bij juist', () => {
    expect(rondeScore(4, 4, cfg)).toBe(9) // 5 + 1*4
  })

  it('respecteert custom waarden bij fout', () => {
    expect(rondeScore(4, 1, cfg)).toBe(-3) // -1 * 3
  })
})

describe('isVoorspellingJuist', () => {
  it('true als bod gelijk aan gehaald', () => {
    expect(isVoorspellingJuist(2, 2)).toBe(true)
  })
  it('false als bod ongelijk aan gehaald', () => {
    expect(isVoorspellingJuist(2, 1)).toBe(false)
  })
})
