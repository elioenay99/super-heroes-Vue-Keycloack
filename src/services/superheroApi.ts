import type { Hero } from '@/models/superhero'

const BASE_URL = 'https://akabab.github.io/superhero-api/api'

async function httpGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${path}${text ? `: ${text}` : ''}`)
  }
  return (await res.json()) as T
}

export const superheroApi = {
  getAll(signal?: AbortSignal) {
    return httpGet<Hero[]>('/all.json', signal)
  },
  getById(id: number, signal?: AbortSignal) {
    return httpGet<Hero>(`/id/${id}.json`, signal)
  },
}

export type SuperheroApi = typeof superheroApi
