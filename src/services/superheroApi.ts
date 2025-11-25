import type { Hero } from '@/models/superhero'
import { getJson } from '@/lib/http'

export const superheroApi = {
  getAll(signal?: AbortSignal) {
    return getJson<Hero[]>('/all.json', signal)
  },
  getById(id: number, signal?: AbortSignal) {
    return getJson<Hero>(`/id/${id}.json`, signal)
  },
}

export type SuperheroApi = typeof superheroApi
