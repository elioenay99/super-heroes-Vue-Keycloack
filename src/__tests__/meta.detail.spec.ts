/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createHead } from '@vueuse/head'
import HeroDetailView from '@/views/HeroDetailView.vue'
import * as api from '@/services/superheroApi'
import type { Hero } from '@/models/superhero'

describe('Metadados - HeroDetailView', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  let spy: ReturnType<typeof vi.spyOn>

  const hero: Hero = {
    id: 1,
    name: 'Spider-Man',
    slug: '1-spider-man',
    powerstats: { intelligence: 90, strength: 55, speed: 67, durability: 75, power: 74, combat: 85 },
    appearance: { gender: 'Male', race: 'Human', height: ['178 cm', '5ft 10in'], weight: ['76 kg', '167 lb'], eyeColor: 'Hazel', hairColor: 'Brown' },
    biography: {
      fullName: 'Peter Parker', alterEgos: 'No alter egos found.', aliases: ['Spidey'], placeOfBirth: 'Queens, New York', firstAppearance: 'Amazing Fantasy #15', publisher: 'Marvel Comics', alignment: 'good',
    },
    work: { occupation: 'Photographer', base: 'New York, New York' },
    connections: { groupAffiliation: 'Avengers', relatives: 'May Parker (aunt)' },
    images: { xs: '/spider-xs.png', sm: '/spider-sm.png', md: '/spider-md.png', lg: '/spider-lg.png' },
  }

  beforeEach(() => {
    spy = vi.spyOn(api.superheroApi, 'getById').mockResolvedValue(hero)
    document.title = ''
  })

  afterEach(() => {
    spy.mockRestore()
    container.innerHTML = ''
  })

  it('define título com o nome do herói ao carregar', async () => {
    const app = createApp(HeroDetailView, { id: 1 })
    app.use(createHead())
    app.mount(container)

    await nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(document.title).toContain('Spider-Man — Super-herói')
  })
})
