import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_URL!
const AUTH_PAGES = ['/login', '/register']

type Result = { authed: boolean; res: NextResponse }

// Merge Set-Cookie values into the request's cookie header,
// so Server Components see the fresh tokens in this same request.
function forwardCookies(req: NextRequest, setCookies: string[]) {
  const jar = new Map(req.cookies.getAll().map((c) => [c.name, c.value]))
  for (const sc of setCookies) {
    const pair = sc.split(';')[0]
    const i = pair.indexOf('=')
    jar.set(pair.slice(0, i), pair.slice(i + 1))
  }
  const headers = new Headers(req.headers)
  headers.set('cookie', [...jar].map(([k, v]) => `${k}=${v}`).join('; '))
  const res = NextResponse.next({ request: { headers } })
  setCookies.forEach((c) => res.headers.append('set-cookie', c))
  return res
}

async function authenticate(req: NextRequest): Promise<Result> {
  const cookie = req.headers.get('cookie')
  const pass = NextResponse.next()
  if (!cookie) return { authed: false, res: pass }

  try {
    const me = await fetch(`${API}/auth/me`, { headers: { cookie }, cache: 'no-store' })
    if (me.ok) return { authed: true, res: pass }
    if (me.status !== 401) return { authed: true, res: pass } // Spring problem, not an auth problem

    const refresh = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { cookie },
      cache: 'no-store',
    })
    if (refresh.ok) {
      return { authed: true, res: forwardCookies(req, refresh.headers.getSetCookie()) }
    }
    return { authed: false, res: pass }
  } catch {
    return { authed: true, res: pass } // Spring unreachable: don't wipe the session
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthPage = AUTH_PAGES.includes(pathname)
  const { authed, res } = await authenticate(req)

  if (!authed && !isAuthPage) {
    const redirect = NextResponse.redirect(new URL('/login', req.url))
    redirect.cookies.delete('access_token')
    redirect.cookies.delete('refresh_token')
    return redirect
  }
  if (authed && isAuthPage) {
    return NextResponse.redirect(new URL('/game', req.url))
  }
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
}