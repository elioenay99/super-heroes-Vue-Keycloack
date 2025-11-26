import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Hero, HeroListItem } from '@/models/superhero'
import { superheroApi } from '@/services/superheroApi'

export const useHeroesStore = defineStore('heroes', () => {
  const items = ref<HeroListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(24)
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
      // Mapeia para uma lista enxuta
      items.value = data.map((h: Hero) => ({
        id: h.id,
        name: h.name,
        slug: h.slug,
        images: h.images,
        biography: h.biography,
      }))
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

  return { items, loading, error, fetchAll, query, filteredItems, count, page, pageSize, totalPages, pagedItems, setPage, nextPage, prevPage, setPageSize, setQuery }
})
