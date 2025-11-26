/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import { createRouter, createMemoryHistory } from 'vue-router'
import CompareView from '@/views/CompareView.vue'
import * as api from '@/services/superheroApi'

// Evita dependências pesadas em testes
vi.mock('@/components/RadarPowerstatsChart.vue', () => ({
  default: { name: 'RadarPowerstatsChart', template: '<div />' },
  __esModule: true,
}))
vi.mock('@/components/HeroCompareCard.vue', () => ({
  default: { name: 'HeroCompareCard', props: ['hero'], template: '<div />' },
  __esModule: true,
}))
vi.mock('@/components/ComparePicker.vue', () => ({
  default: { name: 'ComparePicker', template: '<div />' },
  __esModule: true,
}))

describe('Metadados - CompareView', () => {
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

  it('define título com contagem de selecionados a partir da URL', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/compare', name: 'compare', component: CompareView }],
    })
    router.push('/compare?ids=1,2,3')
    await router.isReady()

    const app = createApp({ template: '<RouterView />' })
    app.use(router)
    app.use(createPinia())
    app.use(createHead())
    app.mount(container)

    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(document.title).toContain('Comparar (3)')
  })
})
