import { useEffect, useRef, useState } from 'react'
import type { Game, Round } from '../domain/types'
import { useGame } from '../hooks/useGame'
import { isSlagenGeldig } from '../domain/rounds'
import { startVolgendeRonde, vervangRonde } from '../domain/game'
import { RoundCard } from '../components/RoundCard'
import { Scoreboard } from '../components/Scoreboard'
import { RoundHistory } from '../components/RoundHistory'
import { nu } from '../lib/util'

interface GamePageProps {
  id: string
  onExit: () => void
}

const AUTOSAVE_MS = 700

export function GamePage({ id, onExit }: GamePageProps) {
  const { game, loading, error, opslaan } = useGame(id)
  const [werkSpel, setWerkSpel] = useState<Game | null>(null)
  const [actieveIndex, setActieveIndex] = useState(0)
  const geseed = useRef(false)

  // Eenmalig seeden vanuit Firestore; daarna is de lokale kopie leidend.
  useEffect(() => {
    if (game && !geseed.current) {
      geseed.current = true
      setWerkSpel(game)
      setActieveIndex(Math.max(0, game.rounds.length - 1))
    }
  }, [game])

  // Debounced autosave van wijzigingen.
  useEffect(() => {
    if (!werkSpel) return
    const t = setTimeout(() => {
      void opslaan(werkSpel).catch(() => {})
    }, AUTOSAVE_MS)
    return () => clearTimeout(t)
  }, [werkSpel, opslaan])

  if (loading && !werkSpel) {
    return <p className="text-slate-400">Laden…</p>
  }
  if (error && !werkSpel) {
    return <p className="text-rose-400">Fout: {error}</p>
  }
  if (!werkSpel) {
    return <p className="text-slate-400">Spel niet gevonden.</p>
  }

  const huidigeIndex = werkSpel.rounds.length - 1
  const bekijktHuidige = actieveIndex === huidigeIndex
  const actieveRonde = werkSpel.rounds[actieveIndex]
  const slagenKloppen = actieveRonde
    ? isSlagenGeldig(actieveRonde.entries, actieveRonde.kaarten)
    : false
  const isLaatsteGeplande = huidigeIndex >= werkSpel.kaartenReeks.length - 1
  const klaar = werkSpel.status === 'klaar'

  const wijzigRonde = (ronde: Round) => {
    setWerkSpel((prev) =>
      prev ? vervangRonde(prev, actieveIndex, ronde, nu()) : prev,
    )
  }

  const volgendeRonde = () => {
    setWerkSpel((prev) => {
      if (!prev) return prev
      const next = startVolgendeRonde(prev, nu())
      setActieveIndex(next.rounds.length - 1)
      return next
    })
  }

  const afronden = () => {
    setWerkSpel((prev) =>
      prev ? { ...prev, status: 'klaar', updatedAt: nu() } : prev,
    )
  }

  const heropen = () => {
    setWerkSpel((prev) =>
      prev ? { ...prev, status: 'spelen', updatedAt: nu() } : prev,
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm text-slate-400"
        >
          ← Spellen
        </button>
        <span className="truncate font-semibold">{werkSpel.naam}</span>
        <span className="text-xs text-slate-500">
          {Math.min(werkSpel.rounds.length, werkSpel.kaartenReeks.length)}/
          {werkSpel.kaartenReeks.length}
        </span>
      </div>

      {klaar && <Scoreboard game={werkSpel} toonWinnaar />}

      {actieveRonde && (
        <RoundCard
          ronde={actieveRonde}
          rondeNummer={actieveIndex + 1}
          players={werkSpel.players}
          onChange={wijzigRonde}
        />
      )}

      {!bekijktHuidige ? (
        <button
          type="button"
          onClick={() => setActieveIndex(huidigeIndex)}
          className="rounded-xl border border-slate-700 px-4 py-3 text-slate-200"
        >
          ← Terug naar huidige ronde
        </button>
      ) : klaar ? (
        <button
          type="button"
          onClick={heropen}
          className="rounded-xl border border-slate-700 px-4 py-3 text-slate-200"
        >
          Spel heropenen om te corrigeren
        </button>
      ) : isLaatsteGeplande ? (
        <button
          type="button"
          onClick={afronden}
          disabled={!slagenKloppen}
          className="rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
        >
          Spel afronden
        </button>
      ) : (
        <button
          type="button"
          onClick={volgendeRonde}
          disabled={!slagenKloppen}
          className="rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
        >
          Volgende ronde →
        </button>
      )}

      {!klaar && <Scoreboard game={werkSpel} aantalRondes={huidigeIndex} />}

      <RoundHistory
        game={werkSpel}
        actieveIndex={actieveIndex}
        onBewerk={setActieveIndex}
      />
    </div>
  )
}
