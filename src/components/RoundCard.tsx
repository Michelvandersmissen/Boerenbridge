import type { Player, Round, ScoringConfig } from '../domain/types'
import { somBiedingen, somGehaald } from '../domain/rounds'
import { rondeScore } from '../domain/scoring'
import { Stepper } from './Stepper'

interface RoundCardProps {
  ronde: Round
  rondeNummer: number
  players: Player[]
  scoring: ScoringConfig
  onChange: (ronde: Round) => void
}

/** Invoer van biedingen en gehaalde slagen voor één ronde, met live score. */
export function RoundCard({
  ronde,
  rondeNummer,
  players,
  scoring,
  onChange,
}: RoundCardProps) {
  const deler = players[ronde.delerIndex]
  const totaalBiedingen = somBiedingen(ronde.entries)
  const totaalGehaald = somGehaald(ronde.entries)
  const delerRegelGeschonden = totaalBiedingen === ronde.kaarten
  const slagenKloppen = totaalGehaald === ronde.kaarten

  const zetEntry = (
    playerId: string,
    veld: 'bod' | 'gehaald',
    waarde: number,
  ) =>
    onChange({
      ...ronde,
      entries: ronde.entries.map((e) =>
        e.playerId === playerId ? { ...e, [veld]: waarde } : e,
      ),
    })

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">
          Ronde {rondeNummer} · {ronde.kaarten}{' '}
          {ronde.kaarten === 1 ? 'kaart' : 'kaarten'}
        </h2>
        <span className="text-sm text-slate-400">
          Deler: {deler?.naam || `Speler ${ronde.delerIndex + 1}`}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 gap-y-3">
        <span />
        <span className="text-center text-xs uppercase text-slate-500">Bod</span>
        <span className="text-center text-xs uppercase text-slate-500">
          Gehaald
        </span>
        <span className="text-center text-xs uppercase text-slate-500">Pnt</span>

        {ronde.entries.map((entry, i) => {
          const speler = players.find((p) => p.id === entry.playerId)
          const isDeler = i === ronde.delerIndex
          const score = rondeScore(entry.bod, entry.gehaald, scoring)
          return (
            <FragmentRow
              key={entry.playerId}
              naam={speler?.naam || `Speler ${i + 1}`}
              isDeler={isDeler}
              bod={entry.bod}
              gehaald={entry.gehaald}
              maxKaarten={ronde.kaarten}
              score={score}
              bodWaarschuwing={isDeler && delerRegelGeschonden}
              onBod={(v) => zetEntry(entry.playerId, 'bod', v)}
              onGehaald={(v) => zetEntry(entry.playerId, 'gehaald', v)}
            />
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-1 text-sm">
        <div
          className={
            delerRegelGeschonden ? 'text-amber-400' : 'text-slate-400'
          }
        >
          Som biedingen: {totaalBiedingen} / {ronde.kaarten}
          {delerRegelGeschonden &&
            ' — deler mag dit niet, totaal mag niet gelijk zijn aan de kaarten'}
        </div>
        <div className={slagenKloppen ? 'text-teal-400' : 'text-rose-400'}>
          Som gehaalde slagen: {totaalGehaald} / {ronde.kaarten}
          {!slagenKloppen && ' — moet precies gelijk zijn aan de kaarten'}
        </div>
      </div>
    </div>
  )
}

interface FragmentRowProps {
  naam: string
  isDeler: boolean
  bod: number
  gehaald: number
  maxKaarten: number
  score: number
  bodWaarschuwing: boolean
  onBod: (v: number) => void
  onGehaald: (v: number) => void
}

function FragmentRow({
  naam,
  isDeler,
  bod,
  gehaald,
  maxKaarten,
  score,
  bodWaarschuwing,
  onBod,
  onGehaald,
}: FragmentRowProps) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-1">
        <span className="truncate font-medium">{naam}</span>
        {isDeler && (
          <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
            deler
          </span>
        )}
      </div>
      <Stepper
        waarde={bod}
        max={maxKaarten}
        onChange={onBod}
        waarschuwing={bodWaarschuwing}
      />
      <Stepper waarde={gehaald} max={maxKaarten} onChange={onGehaald} />
      <span
        className={`w-10 text-right tabular-nums ${
          score >= 0 ? 'text-teal-400' : 'text-rose-400'
        }`}
      >
        {score > 0 ? `+${score}` : score}
      </span>
    </>
  )
}
