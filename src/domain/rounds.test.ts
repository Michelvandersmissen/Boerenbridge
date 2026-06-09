import { describe, it, expect } from 'vitest'
import {
  maxKaarten,
  genereerKaartenReeks,
  delerIndex,
  verbodenDelerBod,
  somBiedingen,
  isSlagenGeldig,
  berekenStand,
} from './rounds'
import { presetConfig } from './scoring'
import type { Game } from './types'

describe('maxKaarten', () => {
  it('verdeelt het 52-kaarten deck over de spelers (afgerond naar beneden)', () => {
    expect(maxKaarten(4)).toBe(13)
    expect(maxKaarten(5)).toBe(10)
    expect(maxKaarten(3)).toBe(17)
  })
})

describe('genereerKaartenReeks', () => {
  it('oplopend: 1..max', () => {
    expect(genereerKaartenReeks(5, 'op')).toEqual([1, 2, 3, 4, 5])
  })

  it('op-af: 1..max..1 zonder max te dubbelen', () => {
    expect(genereerKaartenReeks(4, 'op-af')).toEqual([1, 2, 3, 4, 3, 2, 1])
  })

  it('max van 1 levert [1]', () => {
    expect(genereerKaartenReeks(1, 'op-af')).toEqual([1])
  })
})

describe('delerIndex', () => {
  it('rouleert per ronde vanaf de startdeler', () => {
    expect(delerIndex(0, 4, 0)).toBe(0)
    expect(delerIndex(1, 4, 0)).toBe(1)
    expect(delerIndex(4, 4, 0)).toBe(0)
    expect(delerIndex(2, 4, 3)).toBe(1) // (3 + 2) % 4
  })
})

describe('verbodenDelerBod (deler-regel)', () => {
  it('geeft het bod dat het totaal gelijk aan de kaarten zou maken', () => {
    // 5 kaarten, anderen bieden samen 3 -> deler mag geen 2 bieden
    expect(verbodenDelerBod(3, 5)).toBe(2)
  })

  it('geeft null als anderen al meer dan de kaarten bieden', () => {
    expect(verbodenDelerBod(6, 5)).toBeNull()
  })

  it('verboden bod kan 0 zijn', () => {
    expect(verbodenDelerBod(5, 5)).toBe(0)
  })
})

describe('somBiedingen', () => {
  it('telt de biedingen op', () => {
    expect(
      somBiedingen([
        { playerId: 'a', bod: 2, gehaald: 0 },
        { playerId: 'b', bod: 1, gehaald: 0 },
      ]),
    ).toBe(3)
  })
})

describe('isSlagenGeldig', () => {
  const entries = [
    { playerId: 'a', bod: 1, gehaald: 2 },
    { playerId: 'b', bod: 1, gehaald: 1 },
  ]
  it('geldig als som gehaalde slagen gelijk is aan kaarten', () => {
    expect(isSlagenGeldig(entries, 3)).toBe(true)
  })
  it('ongeldig als som niet klopt', () => {
    expect(isSlagenGeldig(entries, 4)).toBe(false)
  })
})

describe('berekenStand', () => {
  const game: Game = {
    id: 'g1',
    naam: 'Test',
    createdAt: 0,
    updatedAt: 0,
    players: [
      { id: 'a', naam: 'Anna' },
      { id: 'b', naam: 'Bram' },
    ],
    scoring: presetConfig('tien-plus-twee'),
    kaartenReeks: [1, 2],
    status: 'spelen',
    rounds: [
      {
        kaarten: 1,
        delerIndex: 0,
        entries: [
          { playerId: 'a', bod: 1, gehaald: 1 }, // juist: 10 + 2 = 12
          { playerId: 'b', bod: 0, gehaald: 0 }, // juist: 10
        ],
      },
      {
        kaarten: 2,
        delerIndex: 1,
        entries: [
          { playerId: 'a', bod: 2, gehaald: 0 }, // fout: -4
          { playerId: 'b', bod: 0, gehaald: 2 }, // fout: -4
        ],
      },
    ],
  }

  it('telt de totalen per speler op over alle rondes', () => {
    const stand = berekenStand(game)
    const anna = stand.find((s) => s.playerId === 'a')
    const bram = stand.find((s) => s.playerId === 'b')
    expect(anna?.totaal).toBe(8) // 12 - 4
    expect(bram?.totaal).toBe(6) // 10 - 4
  })

  it('sorteert aflopend op totaal (leider eerst)', () => {
    const stand = berekenStand(game)
    expect(stand[0].playerId).toBe('a')
    expect(stand[0].positie).toBe(1)
  })

  it('bevat de rondescores per speler', () => {
    const stand = berekenStand(game)
    const anna = stand.find((s) => s.playerId === 'a')
    expect(anna?.rondeScores).toEqual([12, -4])
  })
})
