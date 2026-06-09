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
      <h2 className="text-lg font-semibold">
        Ronde {rondeNummer} · {ronde.kaarten}{' '}
        {ronde.kaarten === 1 ? 'kaart' : 'kaarten'}
      </h2>
      <p className="mb-3 text-sm text-slate-400">
        Deler: {deler?.naam || `Speler ${ronde.delerIndex + 1}`}
      </p>

      <div className="flex flex-col gap-2">
        {ronde.entries.map((entry, i) => {
          const speler = players.find((p) => p.id === entry.playerId)
          const isDeler = i === ronde.delerIndex
          const score = rondeScore(entry.bod, entry.gehaald, scoring)
          return (
            <div
              key={entry.playerId}
              className="rounded-xl bg-slate-800/50 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-medium">
                    {speler?.naam || `Speler ${i + 1}`}
                  </span>
                  {isDeler && (
                    <span className="shrink-0 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                      deler
                    </span>
                  )}
                </span>
                <span
                  className={`shrink-0 tabular-nums ${
                    score >= 0 ? 'text-teal-400' : 'text-rose-400'
                  }`}
                >
                  {score > 0 ? `+${score}` : score}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Stepper
                    label="Bod"
                    waarde={entry.bod}
                    max={ronde.kaarten}
                    onChange={(v) => zetEntry(entry.playerId, 'bod', v)}
                    waarschuwing={isDeler && delerRegelGeschonden}
                  />
                </div>
                <div className="flex-1">
                  <Stepper
                    label="Gehaald"
                    waarde={entry.gehaald}
                    max={ronde.kaarten}
                    onChange={(v) => zetEntry(entry.playerId, 'gehaald', v)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-1 text-sm">
        <div
          className={delerRegelGeschonden ? 'text-amber-400' : 'text-slate-400'}
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
