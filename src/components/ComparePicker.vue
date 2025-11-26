<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHeroesStore } from '@/stores/heroes'
import { useCompareStore, MAX_COMPARE } from '@/stores/compare'

const heroes = useHeroesStore()
const compare = useCompareStore()

const search = ref('')
const debounced = ref('')
const showList = ref(false)
const infoMsg = ref<string | null>(null)
let t: number | undefined

watch(search, (val) => {
  window.clearTimeout(t)
  t = window.setTimeout(() => {
    debounced.value = val.trim()
  }, 250)
})

const filtered = computed(() => {
  const q = debounced.value.toLowerCase()
  const arr = q
    ? heroes.items.filter((h) => h.name.toLowerCase().includes(q))
    : heroes.items
  // Limita a 10 resultados
  return arr.slice(0, 10)
})

function highlight(name: string) {
  const q = debounced.value
  if (!q) return name
  const re = new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig')
  return name.replace(re, '<mark class="bg-amber-400/30 text-amber-200 rounded px-0.5">$1</mark>')
}

function addToCompare(id: number) {
  if (compare.selectedIds.length >= MAX_COMPARE) {
    infoMsg.value = `Limite de ${MAX_COMPARE} atingido`
    return
  }
  compare.add(id)
  showList.value = false
  infoMsg.value = null
}

function onEnter() {
  if (filtered.value.length > 0) addToCompare(filtered.value[0].id)
}

const inputRef = ref<HTMLInputElement | null>(null)
onMounted(() => {
  // Atalho Ctrl+K para focar pesquisa
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
      inputRef.value?.focus()
      e.preventDefault()
    }
  }
  window.addEventListener('keydown', onKey)
})

const selectedHeroes = computed(() => heroes.getByIds(compare.selectedIds))
</script>

<template>
  <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-medium">Comparar heróis</h2>
      <span class="text-xs text-slate-400">{{ compare.selectedIds.length }}/{{ MAX_COMPARE }}</span>
    </div>
    <div class="relative">
      <input
        ref="inputRef"
        v-model="search"
        type="search"
        placeholder="Buscar heróis por nome… (Ctrl+K)"
        class="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-white/20"
        @focus="showList = true"
        @keydown.enter.prevent="onEnter"
        aria-label="Buscar e adicionar heróis"
      />
      <button
        v-if="search"
        @click="search = ''"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
        aria-label="Limpar busca"
        title="Limpar"
      >×</button>

      <ul
        v-if="showList && filtered.length > 0"
        class="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur shadow-lg"
        role="listbox"
        @mouseleave="showList = false"
      >
        <li
          v-for="h in filtered"
          :key="h.id"
          class="px-3 py-2 text-sm text-slate-200 hover:bg-white/5 cursor-pointer flex items-center justify-between"
          @click="addToCompare(h.id)"
          role="option"
          :aria-selected="false"
        >
          <span class="truncate" v-html="highlight(h.name)"></span>
          <span v-if="h.biography.publisher" class="ml-2 text-[11px] text-slate-400">{{ h.biography.publisher }}</span>
        </li>
      </ul>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <span
        v-for="h in selectedHeroes"
        :key="h.id"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-xs"
        :title="h.name"
      >
        <img :src="h.images.xs" :alt="h.name" class="w-4 h-4 rounded-full bg-slate-700" />
        <span class="truncate max-w-[10rem]">{{ h.name }}</span>
        <button class="text-slate-300 hover:text-white" @click="compare.remove(h.id)" aria-label="Remover">×</button>
      </span>
      <button
        v-if="compare.selectedIds.length > 0"
        class="ml-auto text-xs text-slate-400 hover:text-slate-200 underline"
        @click="compare.clear()"
      >Limpar</button>
    </div>

    <p v-if="infoMsg" class="mt-2 text-xs text-amber-300">{{ infoMsg }}</p>
  </div>
</template>

<style scoped></style>
