import type { Hero } from '@/models/superhero'
import { getJson } from '@/lib/http'

export const superheroApi = {
  getAll(signal?: AbortSignal) {
    // Atenção: não usar barra inicial, pois isso ignora o path do baseURL do Axios
    return getJson<Hero[]>('all.json', signal)
  },
  getById(id: number, signal?: AbortSignal) {
    // Idem acima: manter caminho relativo ao baseURL configurado
    return getJson<Hero>(`id/${id}.json`, signal)
  },
}

export type SuperheroApi = typeof superheroApi
