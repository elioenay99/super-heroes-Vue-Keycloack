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
  <div class="container">
    <header class="header">
      <h1>Superheroes</h1>
      <p class="muted">Fonte: akabab/superhero-api</p>
    </header>

    <section v-if="store.loading" class="state">Carregando heróis…</section>
    <section v-else-if="store.error" class="state error">
      <p>Ocorreu um erro: {{ store.error }}</p>
      <button class="retry" @click="store.fetchAll()">Tentar novamente</button>
    </section>
    <section v-else>
      <div v-if="store.count === 0" class="state">Nenhum herói encontrado.</div>
      <ul v-else class="grid">
        <li v-for="h in store.items" :key="h.id" class="card">
          <img :src="h.images.sm" :alt="h.name" loading="lazy" />
          <div class="body">
            <h2 class="name">{{ h.name }}</h2>
            <p class="publisher" v-if="h.biography.publisher">{{ h.biography.publisher }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>

</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}
.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header h1 {
  font-size: 28px;
  margin: 0;
}
.muted {
  color: var(--muted);
}
.state {
  color: var(--muted);
  padding: 24px 0;
}
.state.error { color: #fecaca; }
.retry {
  margin-top: 8px;
  background: var(--accent);
  border: 0;
  color: #06281a;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
}
.card {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}
.card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  background: #0b1222;
}
.body {
  padding: 10px 12px 14px;
}
.name {
  font-size: 16px;
  margin: 0 0 4px 0;
}
.publisher {
  color: var(--muted);
  font-size: 13px;
}
</style>
