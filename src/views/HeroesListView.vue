<script setup lang="ts">
import { onMounted } from 'vue'
import { useHeroesStore } from '@/stores/heroes'

const store = useHeroesStore()

onMounted(() => {
  // Permite cancelar se a view desmontar (não implementado aqui por simplicidade)
  void store.fetchAll()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <header class="flex items-baseline justify-between mb-4">
      <h1 class="text-3xl font-semibold tracking-tight">Superheroes</h1>
      <div class="flex items-baseline gap-3">
        <p class="text-slate-400">Fonte: akabab/superhero-api</p>
        <p class="text-sm text-slate-400" v-if="store.count">{{ store.count }} heróis • Página {{ store.page }} de {{ store.totalPages }}</p>
      </div>
    </header>

    <section v-if="store.loading" class="text-slate-400 py-6">Carregando heróis…</section>
    <section v-else-if="store.error" class="py-6">
      <p class="text-rose-300">Ocorreu um erro: {{ store.error }}</p>
      <button class="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400" @click="store.fetchAll()">
        Tentar novamente
      </button>
    </section>
    <section v-else>
      <div v-if="store.count === 0" class="text-slate-400 py-6">Nenhum herói encontrado.</div>
      <div v-else>
        <div class="flex flex-wrap items-center justify-between gap-3 my-2" aria-label="Paginação e opções">
          <div class="flex flex-wrap items-center gap-2">
            <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.setPage(1)" :disabled="store.page === 1">« Primeiro</button>
            <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.prevPage()" :disabled="store.page === 1">‹ Anterior</button>
            <span class="text-sm text-slate-400">Página {{ store.page }} / {{ store.totalPages }}</span>
            <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.nextPage()" :disabled="store.page === store.totalPages">Próxima ›</button>
            <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.setPage(store.totalPages)" :disabled="store.page === store.totalPages">Último »</button>
          </div>
          <label class="inline-flex items-center gap-2 text-slate-400 text-sm">
            Itens por página
            <select class="rounded-lg border border-white/10 bg-slate-800 px-2 py-1 text-slate-100" :value="store.pageSize" @change="store.setPageSize(parseInt(($event.target as HTMLSelectElement).value))">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="48">48</option>
              <option :value="96">96</option>
            </select>
          </label>
        </div>

        <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <li v-for="h in store.pagedItems" :key="h.id" class="rounded-xl overflow-hidden border border-white/10 bg-slate-800/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition" :data-alignment="h.biography.alignment">
            <div class="relative">
              <img class="w-full h-56 object-cover bg-slate-900" :src="h.images.sm" :alt="h.name" loading="lazy" />
              <span class="absolute left-2 bottom-2 rounded-md border border-white/10 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300 backdrop-blur" v-if="h.biography.publisher">{{ h.biography.publisher }}</span>
            </div>
            <div class="px-3 py-3">
              <h2 class="text-base font-medium mb-1 truncate">{{ h.name }}</h2>
              <p class="inline-block text-xs capitalize rounded-full border px-2 py-0.5"
                 :class="{
                   'bg-emerald-400/10 text-emerald-300 border-emerald-500/40': h.biography.alignment === 'good',
                   'bg-rose-400/10 text-rose-300 border-rose-500/40': h.biography.alignment === 'bad',
                   'bg-slate-400/10 text-slate-300 border-slate-500/40': !h.biography.alignment || h.biography.alignment === 'neutral'
                 }">
                {{ h.biography.alignment || 'neutral' }}
              </p>
            </div>
          </li>
        </ul>

        <div class="flex flex-wrap items-center gap-2 justify-center mt-6">
          <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.setPage(1)" :disabled="store.page === 1">« Primeiro</button>
          <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.prevPage()" :disabled="store.page === 1">‹ Anterior</button>
          <span class="text-sm text-slate-400">Página {{ store.page }} / {{ store.totalPages }}</span>
          <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.nextPage()" :disabled="store.page === store.totalPages">Próxima ›</button>
          <button class="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed" @click="store.setPage(store.totalPages)" :disabled="store.page === store.totalPages">Último »</button>
        </div>
      </div>
    </section>
  </div>

</template>

<style scoped></style>
