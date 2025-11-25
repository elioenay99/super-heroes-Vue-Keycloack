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
  ],
})

export default router
