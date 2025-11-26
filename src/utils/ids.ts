import { MAX_COMPARE } from '@/stores/compare'

/**
 * Normaliza IDs vindos de querystring (ou de qualquer origem desconhecida).
 * - aceita `undefined`, string "1,2,3" ou array de strings (como o router fornece)
 * - converte para inteiros positivos
 * - remove inválidos e duplicados preservando a ordem da 1ª ocorrência
 * - limita a `MAX_COMPARE` por padrão
 */
export function parseIdsFromQuery(q: unknown, max: number = MAX_COMPARE): number[] {
  if (!q) return []
  const s = Array.isArray(q) ? (q[0] ?? '') : String(q)
  return s
    .split(',')
    .map((x: string) => Math.trunc(Number(x)))
    .filter((n: number) => Number.isFinite(n) && n > 0)
    .filter((n: number, idx: number, arr: number[]) => arr.indexOf(n) === idx)
    .slice(0, max)
}

/**
 * Compara arrays de números por valor e ordem.
 */
export function arrayEquals(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}
