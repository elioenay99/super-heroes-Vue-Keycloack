// DEPRECADO: use '@/stores/compare' diretamente.
// Este arquivo é um shim fino para evitar drift e manter compatibilidade temporária.
import { useCompareStore } from '@/stores/compare'
export { MAX_COMPARE } from '@/stores/compare'

export function useCompare() {
  return useCompareStore()
}
