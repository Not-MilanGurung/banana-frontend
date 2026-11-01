'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { post, errorMessage } from '@/lib/client-api'

type GameState = { gameId: string; question: string; streak: number }
type AnswerResult = {
  correct: boolean
  gameOver: boolean
  streak: number
  highScore: number
  nextQuestion: string | null
}
type Phase = 'idle' | 'playing' | 'over'

export default function Game({ initialHighScore }: { initialHighScore: number }) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [game, setGame] = useState<GameState | null>(null)
  const [highScore, setHighScore] = useState(initialHighScore)
  const [finalStreak, setFinalStreak] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function start() {
    setPending(true)
    setError('')
    const res = await post('/game/start')
    setPending(false)
    if (res.status === 401) return router.replace('/login')
    if (!res.ok) return setError(await errorMessage(res))
    setGame(await res.json())
    setPhase('playing')
  }

  const submit = useCallback(async (answer: number) => {
    if (pending || !game) return
    setPending(true)
    setError('')
    const res = await post('/game/answer', { gameId: game.gameId, answer })
    setPending(false)
    if (res.status === 401) return router.replace('/login')
    if (!res.ok) return setError(await errorMessage(res))

    const result: AnswerResult = await res.json()
    if (result.gameOver) {
      setFinalStreak(result.streak)
      setPhase('over')
    } else if (result.nextQuestion) {
      setGame({ ...game, question: result.nextQuestion, streak: result.streak })
    }
    if (result.gameOver || result.highScore > highScore) router.refresh() // refreshes the sidebar
    setHighScore(result.highScore)
  }, [game, highScore, pending, router]);

  // keyboard: press 0-9 to answer
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) submit(Number(e.key))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, submit])

  return (
    <section className="panel">
      <div className="stats">
        <div>
          <div className="stat-label">Streak</div>
          <div className="stat-value">{phase === 'playing' ? game?.streak : phase === 'over' ? finalStreak : 0}</div>
        </div>
        <div>
          <div className="stat-label">Best</div>
          <div className="stat-value">{highScore}</div>
        </div>
      </div>

      {phase === 'playing' && game && (
        <>
          {/* plain <img> so you don't need remotePatterns for the puzzle host */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="puzzle" src={game.question} alt="Find the missing digit" />
          <div className="digits">
            {Array.from({ length: 10 }, (_, d) => (
              <button key={d} className="btn btn-primary" disabled={pending} onClick={() => submit(d)}>
                {d}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'over' && <p className="error">Wrong! Your streak was {finalStreak}.</p>}
      {error && <p className="error">{error}</p>}

      {phase !== 'playing' && (
        <button className="btn btn-secondary" disabled={pending} onClick={start}>
          {pending ? '...' : phase === 'over' ? 'Play again' : 'Start'}
        </button>
      )}
    </section>
  )
}