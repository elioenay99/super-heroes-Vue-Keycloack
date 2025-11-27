import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
import { initKeycloak } from '@/lib/keycloak'

const app = createApp(App)

app.use(createPinia())
app.use(createHead())
app.use(router)

// Aguarda init (não bloqueia se não estiver autenticado por causa do check-sso)
initKeycloak()
  .catch((e) => console.error('Erro ao inicializar Keycloak:', e))
  .finally(() => {
    app.mount('#app')
  })
