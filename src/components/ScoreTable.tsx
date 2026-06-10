import type { Game } from '../domain/types'
import { rondeScore } from '../domain/scoring'
import { isSlagenGeldig } from '../domain/rounds'

interface ScoreTableProps {
  game: Game
}

interface Cel {
  totaal: number
  gehaald: number
  /** Of de score van deze ronde al definitief is toegedeeld. */
  compleet: boolean
}

/**
 * Spreadsheet-weergave van het verloop: rijen = rondes (nieuwste boven),
 * kolommen = spelers. Per cel het lopende totaal + (klein) de gehaalde slagen.
 * Een ronde telt pas mee in het totaal zodra alle slagen zijn toegewezen
 * (som gehaald == aantal kaarten); tot dan toont de cel een streepje.
 * Horizontaal scrollbaar met snap per spelerskolom; ronde-kolom blijft links staan.
 */
export function ScoreTable({ game }: ScoreTableProps) {
  // Bouw per ronde het lopende totaal per speler op (in spelvolgorde).
  const lopend = game.players.map(() => 0)
  const rijen = game.rounds.map((round, index) => {
    const compleet = isSlagenGeldig(round.entries, round.kaarten)
    const cellen: Cel[] = game.players.map((p, i) => {
      const entry = round.entries.find((e) => e.playerId === p.id)
      const score = entry ? rondeScore(entry.bod, entry.gehaald, game.scoring) : 0
      if (compleet) {
        lopend[i] += score
      }
      return { totaal: lopend[i], gehaald: entry?.gehaald ?? 0, compleet }
    })
    return { ronde: index + 1, kaarten: round.kaarten, cellen }
  })
  const eindtotalen = [...lopend]
  const getoond = [...rijen].reverse() // nieuwste ronde bovenaan

  return (
    <div
      className="overflow-x-auto rounded-xl border border-slate-700 scroll-pl-16"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      <div className="flex min-w-max">
        {/* Sticky ronde-kolom */}
        <div className="sticky left-0 z-10 w-16 shrink-0 bg-slate-900">
          <div className="flex h-10 items-center justify-center border-b border-r border-slate-700 text-xs uppercase text-slate-500">
            Ronde
          </div>
          {getoond.map((rij) => (
            <div
              key={rij.ronde}
              className="flex h-12 flex-col items-center justify-center border-b border-r border-slate-800 text-slate-400"
            >
              <span className="text-sm font-semibold">R{rij.ronde}</span>
              <span className="text-[10px] text-slate-500">
                {rij.kaarten} krt
              </span>
            </div>
          ))}
          <div className="flex h-12 items-center justify-center border-r border-slate-700 bg-slate-800/60 text-xs font-semibold uppercase text-slate-400">
            Totaal
          </div>
        </div>

        {/* Spelers-kolommen */}
        {game.players.map((speler, i) => (
          <div
            key={speler.id}
            className="w-28 shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="flex h-10 items-center justify-center truncate border-b border-slate-700 px-1 text-sm font-medium">
              {speler.naam}
            </div>
            {getoond.map((rij) => {
              const cel = rij.cellen[i]
              return (
                <div
                  key={rij.ronde}
                  className="relative flex h-12 items-center justify-center border-b border-slate-800"
                >
                  {cel.compleet && (
                    <>
                      <span className="text-base font-semibold tabular-nums">
                        {cel.totaal}
                      </span>
                      <span className="absolute right-1.5 top-1 text-[10px] text-slate-500 tabular-nums">
                        {cel.gehaald}
                      </span>
                    </>
                  )}
                </div>
              )
            })}
            <div className="flex h-12 items-center justify-center bg-slate-800/60 text-lg font-bold tabular-nums">
              {eindtotalen[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
