import { defineStore } from 'pinia'
import { ref } from 'vue'

export const MAX_COMPARE = 4

export const useCompareStore = defineStore('compare', () => {
  const selectedIds = ref<number[]>([])

  function set(ids: number[]) {
    // normaliza: números inteiros únicos, máximo 4
    const uniq = Array.from(new Set(ids.map((n) => Math.trunc(Number(n))).filter((n) => Number.isFinite(n) && n > 0)))
    selectedIds.value = uniq.slice(0, MAX_COMPARE)
  }

  function add(id: number) {
    const n = Math.trunc(Number(id))
    if (!Number.isFinite(n) || n <= 0) return
    if (selectedIds.value.includes(n)) return
    if (selectedIds.value.length >= MAX_COMPARE) return
    selectedIds.value = [...selectedIds.value, n]
  }

  function remove(id: number) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }

  function clear() {
    selectedIds.value = []
  }

  function move(fromIndex: number, toIndex: number) {
    const list = [...selectedIds.value]
    if (fromIndex < 0 || fromIndex >= list.length) return
    if (toIndex < 0 || toIndex >= list.length) return
    const [item] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, item)
    selectedIds.value = list
  }

  return { selectedIds, set, add, remove, clear, move }
})
