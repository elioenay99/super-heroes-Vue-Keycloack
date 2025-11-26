<script setup lang="ts">
import type { Hero } from '@/models/superhero'

const props = defineProps<{
  hero: Hero
  index: number
  canMoveLeft?: boolean
  canMoveRight?: boolean
}>()

const emit = defineEmits<{
  remove: [id: number]
  moveLeft: [index: number]
  moveRight: [index: number]
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    emit('remove', props.hero.id)
    e.preventDefault()
  } else if (e.key === 'ArrowLeft' && props.canMoveLeft) {
    emit('moveLeft', props.index)
    e.preventDefault()
  } else if (e.key === 'ArrowRight' && props.canMoveRight) {
    emit('moveRight', props.index)
    e.preventDefault()
  }
}
</script>

<template>
  <div
    tabindex="0"
    class="rounded-xl border border-white/10 bg-slate-800/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
    @keydown="onKeydown"
    :aria-label="`Card do herói ${hero.name}`"
  >
    <div class="relative">
      <img :src="hero.images.sm" :alt="hero.name" class="w-full h-40 object-cover bg-slate-900" />
      <div class="absolute top-2 right-2 flex gap-1">
        <button
          class="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs hover:border-white/20 disabled:opacity-40"
          :disabled="!canMoveLeft"
          @click.stop="emit('moveLeft', index)"
          aria-label="Mover para a esquerda"
          title="Mover para a esquerda"
        >←</button>
        <button
          class="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs hover:border-white/20 disabled:opacity-40"
          :disabled="!canMoveRight"
          @click.stop="emit('moveRight', index)"
          aria-label="Mover para a direita"
          title="Mover para a direita"
        >→</button>
        <button
          class="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-xs hover:border-white/20"
          @click.stop="emit('remove', hero.id)"
          aria-label="Remover do comparador"
          title="Remover"
        >×</button>
      </div>
    </div>
    <div class="p-3">
      <div class="flex items-center justify-between gap-2 mb-1">
        <h3 class="text-base font-medium truncate" :title="hero.name">{{ hero.name }}</h3>
        <span v-if="hero.biography.publisher" class="rounded-md border border-white/10 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">{{ hero.biography.publisher }}</span>
      </div>
      <p
        class="inline-block text-[11px] capitalize rounded-full border px-2 py-0.5 mb-2"
        :class="{
          'bg-emerald-400/10 text-emerald-300 border-emerald-500/40': hero.biography.alignment === 'good',
          'bg-rose-400/10 text-rose-300 border-rose-500/40': hero.biography.alignment === 'bad',
          'bg-slate-400/10 text-slate-300 border-slate-500/40': !hero.biography.alignment || hero.biography.alignment === 'neutral',
        }"
      >
        {{ hero.biography.alignment === 'good' ? 'herói' : (hero.biography.alignment === 'bad' ? 'vilão' : 'neutro') }}
      </p>
      <ul class="text-xs text-slate-300 grid grid-cols-2 gap-y-1">
        <li>Inteligência: <span class="text-slate-100">{{ hero.powerstats.intelligence ?? 0 }}</span></li>
        <li>Força: <span class="text-slate-100">{{ hero.powerstats.strength ?? 0 }}</span></li>
        <li>Velocidade: <span class="text-slate-100">{{ hero.powerstats.speed ?? 0 }}</span></li>
        <li>Durabilidade: <span class="text-slate-100">{{ hero.powerstats.durability ?? 0 }}</span></li>
        <li>Poder: <span class="text-slate-100">{{ hero.powerstats.power ?? 0 }}</span></li>
        <li>Combate: <span class="text-slate-100">{{ hero.powerstats.combat ?? 0 }}</span></li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
