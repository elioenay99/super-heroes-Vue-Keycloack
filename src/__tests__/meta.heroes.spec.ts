/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import HeroesListView from '@/views/HeroesListView.vue'
import { useHeroesStore } from '@/stores/heroes'
import * as api from '@/services/superheroApi'

describe('Metadados - HeroesListView', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    spy = vi.spyOn(api.superheroApi, 'getAll').mockResolvedValue([] as any)
    document.title = ''
  })

  afterEach(() => {
    spy.mockRestore()
    container.innerHTML = ''
  })

  it('define título padrão quando sem busca', async () => {
    const app = createApp(HeroesListView)
    const pinia = createPinia()
    app.use(pinia)
    app.use(createHead())
    app.mount(container)
    await Promise.resolve()
    expect(document.title).toContain('Super-heróis — Lista')
  })

  it('atualiza título com a busca', async () => {
    const app = createApp(HeroesListView)
    const pinia = createPinia()
    app.use(pinia)
    app.use(createHead())
    app.mount(container)
    const store = useHeroesStore()
    store.setQuery('Batman')
    await Promise.resolve()
    expect(document.title).toContain('Super-heróis — Busca: Batman')
  })
})
