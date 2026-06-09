import { describe, it, expect } from 'vitest'
import {
  maakSpelData,
  maakLegeRonde,
  startVolgendeRonde,
  isSpelKlaar,
  vervangRonde,
} from './game'
import { presetConfig } from './scoring'
import type { Game, Player } from './types'

const players: Player[] = [
  { id: 'a', naam: 'Anna' },
  { id: 'b', naam: 'Bram' },
  { id: 'c', naam: 'Cas' },
]

describe('maakSpelData', () => {
  it('genereert kaarten-reeks op basis van spelers en sequentie', () => {
    const data = maakSpelData({
      naam: 'Avondje',
      players,
      scoring: presetConfig('tien-plus-twee'),
      sequentie: 'op',
      maxKaartenOverride: 3,
      nu: 1000,
    })
    expect(data.kaartenReeks).toEqual([1, 2, 3])
    expect(data.status).toBe('spelen')
    expect(data.createdAt).toBe(1000)
  })

  it('gebruikt floor(52/spelers) als geen override gegeven is', () => {
    const data = maakSpelData({
      naam: 'x',
      players,
      scoring: presetConfig('zaans'),
      sequentie: 'op',
      nu: 0,
    })
    expect(data.kaartenReeks.at(-1)).toBe(17) // floor(52/3)
  })
})

describe('maakLegeRonde', () => {
  it('maakt een nul-entry per speler', () => {
    const ronde = maakLegeRonde(players, 2, 1)
    expect(ronde.kaarten).toBe(2)
    expect(ronde.delerIndex).toBe(1)
    expect(ronde.entries).toHaveLength(3)
    expect(ronde.entries.every((e) => e.bod === 0 && e.gehaald === 0)).toBe(true)
  })
})

function basisSpel(): Game {
  return {
    id: 'g1',
    naam: 'Test',
    createdAt: 0,
    updatedAt: 0,
    players,
    scoring: presetConfig('tien-plus-twee'),
    kaartenReeks: [1, 2],
    rounds: [],
    status: 'spelen',
  }
}

describe('startVolgendeRonde', () => {
  it('voegt de eerste ronde toe met de juiste kaarten en deler', () => {
    const game = startVolgendeRonde(basisSpel(), 50)
    expect(game.rounds).toHaveLength(1)
    expect(game.rounds[0].kaarten).toBe(1)
    expect(game.rounds[0].delerIndex).toBe(0)
    expect(game.updatedAt).toBe(50)
  })

  it('rouleert de deler bij de tweede ronde', () => {
    const na1 = startVolgendeRonde(basisSpel(), 1)
    const na2 = startVolgendeRonde(na1, 2)
    expect(na2.rounds[1].delerIndex).toBe(1)
    expect(na2.rounds[1].kaarten).toBe(2)
  })

  it('zet status op klaar als alle rondes gespeeld zijn', () => {
    const na1 = startVolgendeRonde(basisSpel(), 1)
    const na2 = startVolgendeRonde(na1, 2)
    const na3 = startVolgendeRonde(na2, 3)
    expect(na3.rounds).toHaveLength(2)
    expect(na3.status).toBe('klaar')
  })

  it('muteert het originele spel niet', () => {
    const origineel = basisSpel()
    startVolgendeRonde(origineel, 1)
    expect(origineel.rounds).toHaveLength(0)
  })
})

describe('isSpelKlaar', () => {
  it('false zolang er nog rondes te spelen zijn', () => {
    expect(isSpelKlaar(basisSpel())).toBe(false)
  })
})

describe('vervangRonde', () => {
  it('vervangt een ronde immutable en update-t status', () => {
    const na1 = startVolgendeRonde(basisSpel(), 1)
    const aangepast = vervangRonde(
      na1,
      0,
      { ...na1.rounds[0], troef: 'harten' },
      99,
    )
    expect(aangepast.rounds[0].troef).toBe('harten')
    expect(na1.rounds[0].troef).toBeUndefined()
    expect(aangepast.updatedAt).toBe(99)
  })
})
