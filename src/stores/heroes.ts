import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Hero, HeroListItem } from '@/models/superhero'
import { superheroApi } from '@/services/superheroApi'

export const useHeroesStore = defineStore('heroes', () => {
  const items = ref<HeroListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido'
      error.value = message
    } finally {
      loading.value = false
    }
  }

  const count = computed(() => items.value.length)

  return { items, loading, error, fetchAll, count }
})
