<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { useHead } from '@vueuse/head'
import type { Hero } from '@/models/superhero'
import { superheroApi } from '@/services/superheroApi'

const props = defineProps<{ id: string | number }>()

const hero = ref<Hero | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchHero() {
  // cancela requisição anterior, se houver
  controller?.abort()
  controller = new AbortController()
  const parsed = Number(props.id)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    error.value = 'ID inválido'
    return
  }
  loading.value = true
  error.value = null
  hero.value = null
  try {
    hero.value = await superheroApi.getById(parsed, controller.signal)
  } catch (e: unknown) {
    // Ignora cancelamentos para evitar exibir erro em navegações rápidas
    const hasAxiosCanceledCode =
      typeof e === 'object' && e !== null && 'code' in e && (e as { code?: unknown }).code === 'ERR_CANCELED'
    const canceled = controller?.signal.aborted || hasAxiosCanceledCode
    if (!canceled) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar herói'
      error.value = msg
    }
  } finally {
    loading.value = false
  }
}

// Controller para cancelar em mudanças e ao desmontar
let controller: AbortController | null = null

onMounted(fetchHero)
watch(() => props.id, fetchHero)
onBeforeUnmount(() => controller?.abort())

// Metadados por rota: título/descrição/imagem quando dados carregarem
const title = computed(() => (hero.value ? `${hero.value.name} — Super-herói` : 'Detalhes — Super-heróis'))
useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: hero.value ? `Detalhes de ${hero.value.name}: atributos, aparência e biografia.` : 'Detalhes do super-herói.' },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: hero.value ? `Veja os powerstats e biografia de ${hero.value.name}.` : 'Detalhes do super-herói.' },
    hero.value?.images?.lg ? { property: 'og:image', content: hero.value.images.lg } : undefined,
    { property: 'og:type', content: 'article' },
  ].filter(Boolean) as { name?: string; property?: string; content: string }[],
}))
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6">
    <nav class="mb-4">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm hover:border-white/20"
      >
        ← Voltar
      </RouterLink>
    </nav>

    <section v-if="loading" class="text-slate-400 py-6">Carregando detalhes…</section>
    <section v-else-if="error" class="py-6">
      <p class="text-rose-300">{{ error }}</p>
      <button
        class="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
        @click="fetchHero()"
      >
        Tentar novamente
      </button>
    </section>
    <section v-else-if="hero" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1">
        <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-800/60">
          <img :src="hero.images.lg" :alt="hero.name" class="w-full h-auto object-cover bg-slate-900" />
        </div>
      </div>
      <div class="md:col-span-2">
        <header class="mb-4">
          <h1 class="text-3xl font-semibold tracking-tight">{{ hero.name }}</h1>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span v-if="hero.biography.publisher" class="rounded-md border border-white/10 bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300">{{ hero.biography.publisher }}</span>
            <span
              class="inline-block text-xs capitalize rounded-full border px-2 py-0.5"
              :class="{
                'bg-emerald-400/10 text-emerald-300 border-emerald-500/40': hero.biography.alignment === 'good',
                'bg-rose-400/10 text-rose-300 border-rose-500/40': hero.biography.alignment === 'bad',
                'bg-slate-400/10 text-slate-300 border-slate-500/40': !hero.biography.alignment || hero.biography.alignment === 'neutral',
              }"
            >{{ hero.biography.alignment === 'good' ? 'herói' : (hero.biography.alignment === 'bad' ? 'vilão' : 'neutro') }}</span>
          </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <h2 class="text-lg font-medium mb-2">Atributos</h2>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>Inteligência: <span class="text-slate-100">{{ hero.powerstats.intelligence }}</span></li>
              <li>Força: <span class="text-slate-100">{{ hero.powerstats.strength }}</span></li>
              <li>Velocidade: <span class="text-slate-100">{{ hero.powerstats.speed }}</span></li>
              <li>Durabilidade: <span class="text-slate-100">{{ hero.powerstats.durability }}</span></li>
              <li>Poder: <span class="text-slate-100">{{ hero.powerstats.power }}</span></li>
              <li>Combate: <span class="text-slate-100">{{ hero.powerstats.combat }}</span></li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <h2 class="text-lg font-medium mb-2">Aparência</h2>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>Gênero: <span class="text-slate-100">{{ hero.appearance.gender || '—' }}</span></li>
              <li>Raça: <span class="text-slate-100">{{ hero.appearance.race || '—' }}</span></li>
              <li>Altura: <span class="text-slate-100">{{ hero.appearance.height?.[1] || hero.appearance.height?.[0] || '—' }}</span></li>
              <li>Peso: <span class="text-slate-100">{{ hero.appearance.weight?.[1] || hero.appearance.weight?.[0] || '—' }}</span></li>
              <li>Olhos: <span class="text-slate-100">{{ hero.appearance.eyeColor || '—' }}</span></li>
              <li>Cabelo: <span class="text-slate-100">{{ hero.appearance.hairColor || '—' }}</span></li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <h2 class="text-lg font-medium mb-2">Biografia</h2>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>Nome completo: <span class="text-slate-100">{{ hero.biography.fullName || '—' }}</span></li>
              <li>Alter egos: <span class="text-slate-100">{{ hero.biography.alterEgos || '—' }}</span></li>
              <li>Apelidos: <span class="text-slate-100">{{ hero.biography.aliases?.join(', ') || '—' }}</span></li>
              <li>Nascimento: <span class="text-slate-100">{{ hero.biography.placeOfBirth || '—' }}</span></li>
              <li>Primeira aparição: <span class="text-slate-100">{{ hero.biography.firstAppearance || '—' }}</span></li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <h2 class="text-lg font-medium mb-2">Trabalho & Conexões</h2>
            <ul class="text-sm text-slate-300 space-y-1">
              <li>Ocupação: <span class="text-slate-100">{{ hero.work.occupation || '—' }}</span></li>
              <li>Base: <span class="text-slate-100">{{ hero.work.base || '—' }}</span></li>
              <li>Grupos: <span class="text-slate-100">{{ hero.connections.groupAffiliation || '—' }}</span></li>
              <li>Parentes: <span class="text-slate-100">{{ hero.connections.relatives || '—' }}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
