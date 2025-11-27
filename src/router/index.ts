import { createRouter, createWebHistory } from 'vue-router'
import HeroesListView from '@/views/HeroesListView.vue'
import { keycloak, login, isReturningFromKeycloak } from '@/lib/keycloak'

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

// Exigir autenticação para TODAS as rotas, evitando loop quando retornando do Keycloak
router.beforeEach(async () => {
  if (!keycloak.authenticated) {
    // Se está retornando com code/state, permita a navegação para que o init finalize
    if (isReturningFromKeycloak()) {
      return true
    }
    // Guarda a URL atual para restaurar após autenticar com redirectUri base
    try {
      sessionStorage.setItem('postLoginRedirect', window.location.href)
    } catch {}
    // Use a redirectUri padrão configurada no Keycloak (base da app) para evitar URI não permitida
    await login(false)
    return false
  }
})

export default router
