<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIntersectionObserver, watchDebounced } from '@vueuse/core'
import { useHeroesStore } from '@/stores/heroes'
import { useCompareStore } from '@/stores/compare'

const store = useHeroesStore()
const compare = useCompareStore()
const sentinel = ref<HTMLElement | null>(null)

onMounted(() => {
  // Permite cancelar se a view desmontar (não implementado aqui por simplicidade)
  void store.fetchAll()
})

// Debounce da busca: reseta para página 1 quando query muda
watchDebounced(
  () => store.query,
  () => {
    store.setPage(1)
  },
  { debounce: 250, maxWait: 1000 }
)

// IntersectionObserver com limpeza automática via VueUse
useIntersectionObserver(sentinel, (entries) => {
  const entry = entries[0]
  if (!entry) return
  if (entry.isIntersecting && store.page < store.totalPages && !store.loading) {
    store.nextPage()
  }
})

function toggleCompare(id: number) {
  if (compare.selectedIds.includes(id)) compare.remove(id)
  else compare.add(id)
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Super-heróis</h1>
        <p class="text-slate-300 mt-1">Fonte: akabab/superhero-api</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
        <label class="relative" aria-label="Buscar herói por nome" role="search">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          <input
            v-model="store.query"
            type="search"
            placeholder="Buscar por nome…"
            class="peer w-full sm:w-80 rounded-lg border border-white/10 bg-slate-800 pl-9 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-white/20"
          />
          <button v-if="store.query" @click="store.query = ''"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label="Limpar busca"
                  title="Limpar">×</button>
        </label>
        <p class="text-slate-300 mt-1 sm:mt-0" aria-live="polite">
          {{ store.count }} resultados • Página {{ store.page }} de {{ store.totalPages }}
        </p>
      </div>
    </header>

    <!-- Skeleton de carregamento -->
    <section v-if="store.loading" class="py-6">
      <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <li v-for="n in 12" :key="n" class="animate-pulse">
          <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-800/60">
            <div class="bg-slate-700/40 aspect-[3/4]"></div>
            <div class="p-3 space-y-2">
              <div class="h-4 bg-slate-700/40 rounded"></div>
              <div class="h-3 w-24 bg-slate-700/40 rounded"></div>
            </div>
          </div>
        </li>
      </ul>
    </section>
    <section v-else-if="store.error" class="py-6">
      <p class="text-rose-300">Ocorreu um erro: {{ store.error }}</p>
      <button class="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400" @click="store.fetchAll()">
        Tentar novamente
      </button>
    </section>
    <section v-else>
      <div v-if="store.count === 0" class="text-center py-12">
        <p class="text-slate-300 mb-3">Nenhum herói encontrado<span v-if="store.query"> para "{{ store.query }}"</span>.</p>
        <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm hover:border-white/20" @click="store.query = ''">Limpar filtro</button>
      </div>
      <div v-else>
        <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" role="grid">
          <li v-for="h in store.pagedItems" :key="h.id" :data-alignment="h.biography.alignment" role="gridcell">
            <RouterLink
              :to="`/heroes/${h.id}`"
              class="group block rounded-xl overflow-hidden border border-white/10 bg-slate-800/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <div class="relative">
                <div class="bg-slate-900 aspect-[3/4] w-full">
                  <img
                    class="w-full h-full object-cover"
                    :src="h.images.sm"
                    :alt="h.name"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span v-if="h.biography.publisher"
                      class="absolute left-2 bottom-2 rounded-md border border-white/10 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-200 backdrop-blur">
                  {{ h.biography.publisher }}
                </span>
              </div>
              <div class="px-3 py-3">
                <h2 class="text-base font-medium mb-1 truncate line-clamp-1">{{ h.name }}</h2>
                <p class="inline-block text-xs capitalize rounded-full border px-2 py-0.5"
                   :class="{
                     'bg-emerald-400/10 text-emerald-300 border-emerald-500/40': h.biography.alignment === 'good',
                     'bg-rose-400/10 text-rose-300 border-rose-500/40': h.biography.alignment === 'bad',
                     'bg-slate-400/10 text-slate-200 border-slate-500/40': !h.biography.alignment || h.biography.alignment === 'neutral'
                   }">
                  {{ h.biography.alignment === 'good' ? 'herói' : (h.biography.alignment === 'bad' ? 'vilão' : 'neutro') }}
                </p>
              </div>
            </RouterLink>
            <div class="mt-2 flex justify-end">
              <button
                class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                :class="{ 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300': compare.selectedIds.includes(h.id) }"
                @click.prevent.stop="toggleCompare(h.id)"
                :aria-pressed="compare.selectedIds.includes(h.id)"
              >
                {{ compare.selectedIds.includes(h.id) ? 'Selecionado' : 'Comparar' }}
              </button>
            </div>
          </li>
        </ul>
        <!-- Sentinela para auto-carregar próxima página -->
        <div ref="sentinel" class="h-1"></div>

        <!-- Paginação unificada (compacta) -->
        <div class="flex flex-wrap items-center gap-2 justify-center mt-6" aria-label="Paginação">
          <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.prevPage()" :disabled="store.page === 1">‹ Anterior</button>
          <span class="text-sm text-slate-400">Página {{ store.page }} / {{ store.totalPages }}</span>
          <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.nextPage()" :disabled="store.page === store.totalPages">Próxima ›</button>
        </div>
      </div>
    </section>

    <!-- Bandeja de comparação (sticky) -->
    <transition name="slide-up">
      <div v-if="compare.selectedIds.length"
           class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(100%,48rem)] rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur px-4 py-3 shadow-lg">
        <div class="flex items-center gap-3 justify-between">
          <div class="flex items-center gap-2 text-sm text-slate-200">
            <strong>{{ compare.selectedIds.length }}</strong> selecionado(s)
          </div>
          <RouterLink :to="{ name: 'compare', query: { ids: compare.selectedIds.join(',') } }"
                      class="inline-flex items-center rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400">
            Comparar agora
          </RouterLink>
        </div>
      </div>
    </transition>
  </div>

</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(8px);
    opacity: 0;
  }
}
</style>
