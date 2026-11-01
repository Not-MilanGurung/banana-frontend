import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/session'
import LogoutButton from '@/components/LogoutButton'

async function Gate({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login') // the real check; children never render without it

  return (
    <>
      <nav className="nav">
        <Link className="link" href="/game">Game</Link>
        <span className="nav-spacer">{user.username}</span>
        <LogoutButton />
      </nav>
      {children}
    </>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="page">Loading...</main>}>
      <Gate>{children}</Gate>
    </Suspense>
  )
}