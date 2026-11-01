import { cookies } from 'next/headers'

export async function api(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies()
  return fetch(`${process.env.API_URL}${path}`, {
    ...init,
    headers: { ...init.headers, cookie: cookieStore.toString() },
    cache: 'no-store',
  })
}