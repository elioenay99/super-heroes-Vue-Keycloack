import { createRouter, createWebHistory } from 'vue-router'
import HeroesListView from '@/views/HeroesListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HeroesListView,
    },
    {
      path: '/heroes/:id',
      name: 'hero',
      // lazy load para manter o bundle inicial pequeno
      component: () => import('@/views/HeroDetailView.vue'),
      props: true,
    },
    {
      path: '/compare',
      name: 'compare',
      // lazy load
      component: () => import('@/views/CompareView.vue'),
    },
  ],
})

export default router
