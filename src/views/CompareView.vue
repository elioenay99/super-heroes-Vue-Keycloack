<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQuery } from 'vue-router'
import { useHeroesStore } from '@/stores/heroes'
import { useCompareStore, MAX_COMPARE } from '@/stores/compare'
import ComparePicker from '@/components/ComparePicker.vue'
import HeroCompareCard from '@/components/HeroCompareCard.vue'
import RadarPowerstatsChart, { type HeroSeries } from '@/components/RadarPowerstatsChart.vue'

const heroes = useHeroesStore()
const compare = useCompareStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (heroes.items.length === 0 && !heroes.loading) void heroes.fetchAll()
  // Inicializa a seleção a partir da query `ids`
  const ids = parseIdsFromQuery(route.query.ids)
  if (ids.length > 0) compare.set(ids)
})

watch(
  () => route.query.ids,
  (q) => {
    const ids = parseIdsFromQuery(q)
    compare.set(ids)
  }
)

watch(
  () => compare.selectedIds.slice(),
  (ids) => {
    // Atualiza a query `ids` mantendo outras queries
    const current = parseIdsFromQuery(route.query.ids)
    if (arrayEquals(current, ids)) return
    const qs: LocationQuery = { ...route.query }
    if (ids.length > 0) qs.ids = ids.join(',')
    else delete qs.ids
    router.replace({ query: qs })
  }
)

function parseIdsFromQuery(q: unknown): number[] {
  if (!q) return []
  const s = Array.isArray(q) ? q[0] : String(q)
  return s
    .split(',')
    .map((x) => Math.trunc(Number(x)))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, MAX_COMPARE)
}

function arrayEquals(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

// Cores fixas de alto contraste (tema escuro)
const palette = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'] // emerald, cyan, violet, amber

const selectedHeroes = computed(() => heroes.getByIds(compare.selectedIds))

const series = computed<HeroSeries[]>(() =>
  selectedHeroes.value.map((h, i) => ({
    id: h.id,
    name: h.name,
    color: palette[i % palette.length],
    stats: {
      intelligence: h.powerstats.intelligence ?? 0,
      strength: h.powerstats.strength ?? 0,
      speed: h.powerstats.speed ?? 0,
      durability: h.powerstats.durability ?? 0,
      power: h.powerstats.power ?? 0,
      combat: h.powerstats.combat ?? 0,
    },
  }))
)

const invalidIds = computed(() => compare.selectedIds.filter((id) => !heroes.byId(id)))

function remove(id: number) {
  compare.remove(id)
}
function moveLeft(index: number) {
  compare.move(index, index - 1)
}
function moveRight(index: number) {
  compare.move(index, index + 1)
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <nav class="mb-4 flex items-center justify-between">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm hover:border-white/20"
      >
        ← Voltar
      </RouterLink>
      <h1 class="text-2xl font-semibold tracking-tight">Comparação</h1>
    </nav>

    <ComparePicker />

    <p v-if="invalidIds.length > 0" class="mt-2 text-xs text-amber-300">Alguns IDs não foram encontrados e foram ignorados: {{ invalidIds.join(', ') }}</p>

    <section class="mt-4">
      <div v-if="heroes.loading" class="text-slate-400 py-6">Carregando heróis…</div>
      <div v-else>
        <p v-if="compare.selectedIds.length < 2" class="text-slate-400 py-6">
          Selecione pelo menos dois heróis para comparar. Use a busca acima para adicionar heróis (Enter adiciona o primeiro resultado).
        </p>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <HeroCompareCard
              v-for="(h, idx) in selectedHeroes"
              :key="h.id"
              :hero="h"
              :index="idx"
              :can-move-left="idx > 0"
              :can-move-right="idx < selectedHeroes.length - 1"
              @remove="remove"
              @move-left="moveLeft"
              @move-right="moveRight"
            />
          </div>

          <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <h2 class="text-lg font-medium mb-2">Radar de atributos</h2>
            <RadarPowerstatsChart :series="series" />
          </div>

          <div class="overflow-x-auto rounded-xl border border-white/10 bg-slate-800/60">
            <table class="min-w-full text-sm">
              <thead class="bg-white/5">
                <tr>
                  <th class="text-left px-3 py-2 font-medium">Atributo</th>
                  <th v-for="h in selectedHeroes" :key="h.id" class="text-left px-3 py-2 font-medium">
                    <span class="inline-flex items-center gap-2">
                      <span
                        class="inline-block w-2 h-2 rounded-full"
                        :style="{ backgroundColor: palette[selectedHeroes.indexOf(h) % palette.length] }"
                        aria-hidden="true"
                      ></span>
                      {{ h.name }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 text-slate-300">Intelligence</td>
                  <td v-for="h in selectedHeroes" :key="'i'+h.id" class="px-3 py-2">{{ h.powerstats.intelligence ?? 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 text-slate-300">Strength</td>
                  <td v-for="h in selectedHeroes" :key="'s'+h.id" class="px-3 py-2">{{ h.powerstats.strength ?? 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 text-slate-300">Speed</td>
                  <td v-for="h in selectedHeroes" :key="'sp'+h.id" class="px-3 py-2">{{ h.powerstats.speed ?? 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 text-slate-300">Durability</td>
                  <td v-for="h in selectedHeroes" :key="'d'+h.id" class="px-3 py-2">{{ h.powerstats.durability ?? 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 text-slate-300">Power</td>
                  <td v-for="h in selectedHeroes" :key="'p'+h.id" class="px-3 py-2">{{ h.powerstats.power ?? 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="px-3 py-2 text-slate-300">Combat</td>
                  <td v-for="h in selectedHeroes" :key="'c'+h.id" class="px-3 py-2">{{ h.powerstats.combat ?? 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
