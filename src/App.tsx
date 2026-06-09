import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { SetupPage } from './pages/SetupPage'
import { GamePage } from './pages/GamePage'
import { useAuth } from './hooks/useAuth'

type View =
  | { naam: 'home' }
  | { naam: 'setup' }
  | { naam: 'game'; id: string }

function App() {
  const { uid, loading, error } = useAuth()
  const [view, setView] = useState<View>({ naam: 'home' })

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-4 pb-16 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-teal-400">Boerenbridge</h1>
        <p className="text-sm text-slate-400">Houd eenvoudig de scores bij.</p>
      </header>

      {loading && <p className="text-slate-400">Aanmelden…</p>}

      {error && (
        <p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-300">
          Inloggen mislukt: {error}. Controleer of anonieme login aanstaat in
          Firebase.
        </p>
      )}

      {!loading && !error && uid && (
        <>
          {view.naam === 'home' && (
            <HomePage
              uid={uid}
              onNieuw={() => setView({ naam: 'setup' })}
              onOpen={(id) => setView({ naam: 'game', id })}
            />
          )}

          {view.naam === 'setup' && (
            <SetupPage
              uid={uid}
              onCreated={(id) => setView({ naam: 'game', id })}
              onCancel={() => setView({ naam: 'home' })}
            />
          )}

          {view.naam === 'game' && (
            <GamePage id={view.id} onExit={() => setView({ naam: 'home' })} />
          )}
        </>
      )}
    </div>
  )
}

export default App
