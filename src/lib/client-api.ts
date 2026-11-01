export async function post(path: string, body?: unknown) {
  const send = () =>
    fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

  let res = await send()
  if (res.status === 401) {
    const refreshed = await fetch('/api/auth/refresh', { method: 'POST' })
    if (refreshed.ok) res = await send()
  }
  return res
}

// Spring's ErrorResponse looks like { error, message }
export async function errorMessage(res: Response) {
  try {
    const data = await res.json()
    return typeof data?.message === 'string' ? data.message : 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}