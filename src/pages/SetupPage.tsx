import { useState } from 'react'
import type { Player, ScoringConfig as ScoringConfigType, SequentieModus } from '../domain/types'
import { PlayerSetup } from '../components/PlayerSetup'
import { ScoringConfig } from '../components/ScoringConfig'
import { presetConfig } from '../domain/scoring'
import { maakSpelData, startVolgendeRonde } from '../domain/game'
import { maxKaarten } from '../domain/rounds'
import { createGame } from '../firebase/games'
import { maakId, nu } from '../lib/util'

interface SetupPageProps {
  uid: string
  onCreated: (id: string) => void
  onCancel: () => void
}

function legeSpelers(): Player[] {
  return [
    { id: maakId(), naam: '' },
    { id: maakId(), naam: '' },
    { id: maakId(), naam: '' },
  ]
}

export function SetupPage({ uid, onCreated, onCancel }: SetupPageProps) {
  const [naam, setNaam] = useState('')
  const [players, setPlayers] = useState<Player[]>(legeSpelers)
  const [scoring, setScoring] = useState<ScoringConfigType>(() =>
    presetConfig('tien-plus-twee'),
  )
  const [sequentie, setSequentie] = useState<SequentieModus>('op-af')
  const [maxOverride, setMaxOverride] = useState<number | null>(null)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  const geldigeSpelers = players.filter((p) => p.naam.trim().length > 0)
  const standaardMax = maxKaarten(Math.max(players.length, 1))
  const effectiefMax = maxOverride ?? standaardMax
  const kanStarten = geldigeSpelers.length >= 3 && !bezig

  const start = async () => {
    setFout(null)
    setBezig(true)
    try {
      const data = maakSpelData({
        naam: naam.trim() || 'Boerenbridge',
        ownerId: uid,
        players: geldigeSpelers.map((p) => ({ ...p, naam: p.naam.trim() })),
        scoring,
        sequentie,
        maxKaartenOverride: effectiefMax,
        nu: nu(),
      })
      const metEersteRonde = startVolgendeRonde({ ...data, id: 'temp' }, nu())
      const { id: _id, ...zonderId } = metEersteRonde
      void _id
      const newId = await createGame(zonderId)
      onCreated(newId)
    } catch (err: unknown) {
      setFout(err instanceof Error ? err.message : 'Aanmaken mislukt')
      setBezig(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-sm text-slate-400">Naam van het spel</label>
        <input
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="bijv. Vrijdagavond"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>

      <PlayerSetup players={players} onChange={setPlayers} />

      <ScoringConfig config={scoring} onChange={setScoring} />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-200">Rondes</h2>
        <div className="flex gap-2">
          {(['op', 'op-af'] as SequentieModus[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSequentie(m)}
              className={`flex-1 rounded-lg border p-2 text-sm ${
                sequentie === m
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-slate-700 bg-slate-800'
              }`}
            >
              {m === 'op' ? '1 → max' : '1 → max → 1'}
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between gap-2 text-sm text-slate-400">
          Max kaarten per speler
          <input
            type="number"
            min={1}
            max={standaardMax}
            value={effectiefMax}
            onChange={(e) =>
              setMaxOverride(
                Math.min(standaardMax, Math.max(1, Number(e.target.value))),
              )
            }
            className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-center text-white"
          />
        </label>
        <p className="text-xs text-slate-500">
          Standaard {standaardMax} (52 kaarten ÷ {players.length} spelers).
        </p>
      </div>

      {geldigeSpelers.length < 3 && (
        <p className="text-sm text-amber-400">Minimaal 3 spelers met een naam.</p>
      )}
      {fout && <p className="text-sm text-rose-400">{fout}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 px-4 py-3 text-slate-300"
        >
          Terug
        </button>
        <button
          type="button"
          onClick={start}
          disabled={!kanStarten}
          className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
        >
          {bezig ? 'Bezig…' : 'Start spel'}
        </button>
      </div>
    </div>
  )
}
