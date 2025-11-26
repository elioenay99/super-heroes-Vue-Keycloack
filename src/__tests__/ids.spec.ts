import { describe, it, expect } from 'vitest'
import { parseIdsFromQuery, arrayEquals } from '@/utils/ids'
import { MAX_COMPARE } from '@/stores/compare'

describe('parseIdsFromQuery', () => {
  it('retorna [] para undefined/null/empty', () => {
    expect(parseIdsFromQuery(undefined)).toEqual([])
    expect(parseIdsFromQuery(null as unknown as undefined)).toEqual([])
    expect(parseIdsFromQuery('')).toEqual([])
    expect(parseIdsFromQuery([])).toEqual([])
  })

  it('parseia string simples separada por vírgula', () => {
    expect(parseIdsFromQuery('1,2,3')).toEqual([1, 2, 3])
  })

  it('considera apenas o primeiro item quando vem como array (router)', () => {
    expect(parseIdsFromQuery(['4,5,6'])).toEqual([4, 5, 6])
    expect(parseIdsFromQuery(['7,8', 'ignored'])).toEqual([7, 8])
  })

  it('ignora inválidos, negativos e zero', () => {
    expect(parseIdsFromQuery('a,-1,0,2,3')).toEqual([2, 3])
  })

  it('remove duplicados preservando a ordem da primeira ocorrência', () => {
    expect(parseIdsFromQuery('2,1,2,3,1')).toEqual([2, 1, 3])
  })

  it('limita por MAX_COMPARE por padrão', () => {
    const input = Array.from({ length: 10 }, (_, i) => i + 1).join(',')
    expect(parseIdsFromQuery(input)).toEqual(Array.from({ length: MAX_COMPARE }, (_, i) => i + 1))
  })

  it('respeita o parâmetro max personalizado', () => {
    expect(parseIdsFromQuery('1,2,3,4', 2)).toEqual([1, 2])
  })
})

describe('arrayEquals', () => {
  it('true quando arrays iguais', () => {
    expect(arrayEquals([1, 2, 3], [1, 2, 3])).toBe(true)
  })

  it('false quando diferentes', () => {
    expect(arrayEquals([1, 2], [1, 2, 3])).toBe(false)
    expect(arrayEquals([1, 3, 2], [1, 2, 3])).toBe(false)
  })
})
