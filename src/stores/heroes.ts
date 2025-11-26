import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Hero } from '@/models/superhero'
import { superheroApi } from '@/services/superheroApi'

export const useHeroesStore = defineStore('heroes', () => {
  // Mantemos o cache completo de heróis (inclui powerstats) para reutilização em múltiplas telas
  const items = ref<Hero[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(12)
  const query = ref('')

  // Sempre que a busca mudar, voltamos para a primeira página
  watch(query, () => {
    page.value = 1
  })

  async function fetchAll(signal?: AbortSignal) {
    loading.value = true
    error.value = null
    try {
      const data = await superheroApi.getAll(signal)
      // Mantemos os objetos inteiros (com powerstats) para comparação e detalhes
      items.value = data
      // Ajusta página após carregar
      if (page.value < 1) page.value = 1
      if (page.value > totalPages.value) page.value = totalPages.value
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido'
      error.value = message
    } finally {
      loading.value = false
    }
  }

  const filteredItems = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter((it) => it.name.toLowerCase().includes(q))
  })

  const count = computed(() => filteredItems.value.length)
  const totalPages = computed(() => (count.value === 0 ? 1 : Math.ceil(count.value / pageSize.value)))
  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  function setPage(newPage: number) {
    const clamped = Math.min(Math.max(1, Math.trunc(newPage)), totalPages.value)
    page.value = clamped
  }

  function nextPage() {
    if (page.value < totalPages.value) page.value += 1
  }

  function prevPage() {
    if (page.value > 1) page.value -= 1
  }

  function setPageSize(size: number) {
    if (size <= 0) return
    const firstIndex = (page.value - 1) * pageSize.value
    pageSize.value = Math.trunc(size)
    // mantém aproximadamente o primeiro item visível
    page.value = Math.floor(firstIndex / pageSize.value) + 1
    if (page.value > totalPages.value) page.value = totalPages.value
  }

  function setQuery(q: string) {
    query.value = q
    // Sempre que a busca mudar, resetamos para a primeira página
    page.value = 1
  }

  // Índice por ID para buscas rápidas O(1)
  const byIdMap = computed(() => {
    const map = new Map<number, Hero>()
    for (const h of items.value) map.set(h.id, h)
    return map
  })

  // Retorna um herói por ID (ou undefined se não estiver carregado)
  function byId(id: number): Hero | undefined {
    return byIdMap.value.get(id)
  }

  // Retorna uma lista de heróis na mesma ordem dos IDs informados
  function getByIds(ids: number[]): Hero[] {
    return ids
      .map((id) => byIdMap.value.get(id))
      .filter((h): h is Hero => !!h)
  }

  return { items, loading, error, fetchAll, query, filteredItems, count, page, pageSize, totalPages, pagedItems, setPage, nextPage, prevPage, setPageSize, setQuery, byId, getByIds }
})
