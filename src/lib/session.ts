import { cache } from 'react'
import { api } from './api';

export type User = { id: string; username: string }

// cache() dedupes the call within one render pass
export const getUser = cache(async (): Promise<User | null> => {
  const res = await api('/users/me')
  return res.ok ? res.json() : null
})