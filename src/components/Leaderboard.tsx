import { api } from '@/lib/api'
import { getUser } from '@/lib/session'

type Entry = { username: string; highScore: number }

export default async function Leaderboard() {
  const [res, user] = await Promise.all([api('/scores/leaderboard'), getUser()])
  const entries: Entry[] = res.ok ? await res.json() : []

  return (
    <>
      <h2 className="title">Leaderboard</h2>
      {entries.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        <table className="table">
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.username} className={e.username === user?.username ? 'row-me' : undefined}>
                <td>{i + 1}</td>
                <td>{e.username}</td>
                <td>{e.highScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}