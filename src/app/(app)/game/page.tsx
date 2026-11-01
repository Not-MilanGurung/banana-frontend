import { Suspense } from 'react'
import Game from '@/components/Game'
import Leaderboard from '@/components/Leaderboard'
import { api } from '@/lib/api'

async function GameLoader() {
  const res = await api('/scores/me')
  const { highScore } = res.ok ? await res.json() : { highScore: 0 }
  return <Game initialHighScore={highScore} />
}

export default function Page() {
  return (
    <main className="page page-game">
      <div className="game-layout">
        <Suspense fallback={<section className="panel">Loading...</section>}>
          <GameLoader />
        </Suspense>
        <aside className="sidebar">
          <Suspense fallback={<p>Loading...</p>}>
            <Leaderboard />
          </Suspense>
        </aside>
      </div>
    </main>
  )
}