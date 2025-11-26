<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { watchDebounced, useEventListener } from '@vueuse/core'
import { useHeroesStore } from '@/stores/heroes'
import { useCompareStore, MAX_COMPARE } from '@/stores/compare'

const heroes = useHeroesStore()
const compare = useCompareStore()

const search = ref('')
const debounced = ref('')
const showList = ref(false)
const infoMsg = ref<string | null>(null)
// Acessibilidade: gestão de foco e item ativo (aria-activedescendant)
const wrapperRef = ref<HTMLElement | null>(null)
const activeIndex = ref<number>(-1)
const listId = `comparepicker-list-${Math.random().toString(36).slice(2)}`
const activeOptionId = computed<string | undefined>(() => {
  if (showList.value && activeIndex.value >= 0 && activeIndex.value < filtered.value.length) {
    const opt = filtered.value[activeIndex.value]
    return opt ? `${listId}-opt-${opt.id}` : undefined
  }
  return undefined
})

// Debounce com VueUse (limpa automaticamente)
watchDebounced(
  search,
  (val: string) => {
    debounced.value = val.trim()
  },
  { debounce: 250, maxWait: 1000 }
)

// Abrir a lista ao digitar e resetar índice ativo
watch(search, () => {
  if (!showList.value) showList.value = true
  // não seleciona automaticamente; deixa -1 até usuário navegar
  activeIndex.value = -1
})

const filtered = computed(() => {
  const q = debounced.value.toLowerCase()
  const arr = q
    ? heroes.items.filter((h) => h.name.toLowerCase().includes(q))
    : heroes.items
  // Limita a 10 resultados
  return arr.slice(0, 10)
})

// Divide o nome em partes destacadas sem usar v-html (evita XSS)
function splitHighlight(name: string): string[] {
  const q = debounced.value
  if (!q) return [name]
  const re = new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig')
  return name.split(re).filter(Boolean)
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
  const first = filtered.value[0]
  if (first) addToCompare(first.id)
}

function moveActive(delta: number) {
  const len = filtered.value.length
  if (!len) return
  showList.value = true
  const max = len - 1
  const current = activeIndex.value < 0 ? (delta > 0 ? 0 : max) : activeIndex.value + delta
  activeIndex.value = Math.min(max, Math.max(0, current))
}

function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      moveActive(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      moveActive(-1)
      break
    case 'Home':
      e.preventDefault()
      if (filtered.value.length) {
        showList.value = true
        activeIndex.value = 0
      }
      break
    case 'End':
      e.preventDefault()
      if (filtered.value.length) {
        showList.value = true
        activeIndex.value = filtered.value.length - 1
      }
      break
    case 'Enter':
      if (showList.value && activeIndex.value >= 0 && activeIndex.value < filtered.value.length) {
        e.preventDefault()
        const opt = filtered.value[activeIndex.value]
        if (opt) addToCompare(opt.id)
      } else {
        // fallback: adiciona o primeiro
        onEnter()
      }
      break
    case 'Escape':
      showList.value = false
      activeIndex.value = -1
      break
  }
}

// Normaliza activeIndex quando a lista filtra
watch(filtered, (arr) => {
  if (!showList.value) return
  if (arr.length === 0) activeIndex.value = -1
  else if (activeIndex.value >= arr.length) activeIndex.value = arr.length - 1
})

function onInputBlur() {
  // Espera movimentação de foco (ex.: clique numa opção) antes de decidir fechar
  setTimeout(() => {
    const root = wrapperRef.value
    const ae = document.activeElement
    if (!root || !ae || !root.contains(ae)) {
      showList.value = false
      activeIndex.value = -1
    }
  }, 0)
}

const inputRef = ref<HTMLInputElement | null>(null)
// Atalho Ctrl/Cmd+K com limpeza automática de listener
useEventListener(window, 'keydown', (e) => {
  const ev = e as KeyboardEvent
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
    inputRef.value?.focus()
    ev.preventDefault()
  }
})

const selectedHeroes = computed(() => heroes.getByIds(compare.selectedIds))
</script>

<template>
  <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-medium">Comparar heróis</h2>
      <span class="text-xs text-slate-400">{{ compare.selectedIds.length }}/{{ MAX_COMPARE }}</span>
    </div>
    <div class="relative" ref="wrapperRef">
      <input
        ref="inputRef"
        v-model="search"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showList && filtered.length > 0 ? 'true' : 'false'"
        :aria-controls="showList && filtered.length > 0 ? listId : undefined"
        :aria-activedescendant="activeOptionId"
        placeholder="Buscar heróis por nome… (Ctrl+K)"
        class="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-white/20"
        @focus="showList = true"
        @keydown="onKeydown"
        @blur="onInputBlur"
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
        :id="listId"
        class="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur shadow-lg"
        role="listbox"
      >
        <li
          v-for="(h, i) in filtered"
          :key="h.id"
          :id="`${listId}-opt-${h.id}`"
          class="px-3 py-2 text-sm text-slate-200 hover:bg-white/5 cursor-pointer flex items-center justify-between"
          @mouseenter="activeIndex = i"
          @mousedown.prevent="addToCompare(h.id)"
          role="option"
          :aria-selected="i === activeIndex"
        >
          <span class="truncate">
            <template v-for="(chunk, ci) in splitHighlight(h.name)" :key="ci">
              <mark
                v-if="chunk.toLowerCase() === debounced.toLowerCase()"
                class="bg-amber-400/30 text-amber-200 rounded px-0.5"
              >{{ chunk }}</mark>
              <template v-else>{{ chunk }}</template>
            </template>
          </span>
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

    <p v-if="infoMsg" class="mt-2 text-xs text-amber-300" role="status" aria-live="polite" aria-atomic="true">{{ infoMsg }}</p>
  </div>
</template>

<style scoped></style>
