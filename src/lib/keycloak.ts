// src/lib/keycloak.ts
import Keycloak, { type KeycloakInstance } from 'keycloak-js'

// Instância única do Keycloak para a aplicação
export const keycloak: KeycloakInstance = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_AUTH_URL as string,
  realm: import.meta.env.VITE_KEYCLOAK_REALM as string,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
})

export async function initKeycloak() {
  // onLoad 'check-sso' não interrompe o fluxo se o usuário não estiver logado
  const authenticated = await keycloak.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    // A URI deve estar cadastrada no cliente do Keycloak
    redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI as string,
    // Opcional: melhora a experiência de SSO silencioso
    silentCheckSsoRedirectUri: `${import.meta.env.VITE_KEYCLOAK_REDIRECT_URI as string}/silent-check-sso.html`,
  })

  // Se voltou do Keycloak, limpa parâmetros da URL para evitar reprocesso/loops
  if (authenticated && isReturningFromKeycloak()) {
    try {
      const url = new URL(window.location.href)
      // Remover parâmetros na querystring
      url.searchParams.delete('code')
      url.searchParams.delete('session_state')
      url.searchParams.delete('state')
      url.searchParams.delete('error')
      url.searchParams.delete('iss')
      url.searchParams.delete('access_token')
      // Remover parâmetros também no hash (alguns fluxos do KC retornam via fragmento)
      const rawHash = url.hash?.startsWith('#') ? url.hash.slice(1) : url.hash
      const hashParams = new URLSearchParams(rawHash ?? '')
      hashParams.delete('code')
      hashParams.delete('session_state')
      hashParams.delete('state')
      hashParams.delete('error')
      hashParams.delete('iss')
      hashParams.delete('access_token')
      const newHash = hashParams.toString()
      url.hash = newHash ? `#${newHash}` : ''
      // Mantém hash e path, remove apenas os params
      window.history.replaceState({}, document.title, url.pathname + url.search + url.hash)
    } catch (e) {
      // como fallback, não faz nada
    }
  }

  // Se autenticou e havia uma rota desejada salva, redireciona para ela
  if (authenticated) {
    try {
      const to = sessionStorage.getItem('postLoginRedirect')
      if (to && to !== window.location.href) {
        sessionStorage.removeItem('postLoginRedirect')
        // navegar para a URL original solicitada
        window.location.replace(to)
        // retorna aqui pois a navegação substituirá a página
        return authenticated
      }
    } catch {}
  }

  // Refresh automático periódico
  startTokenAutoRefresh()
  return authenticated
}

function startTokenAutoRefresh() {
  // Tenta renovar o token a cada 30s, se estiver logado
  const interval = 30_000
  setInterval(async () => {
    if (!keycloak.authenticated) return
    try {
      // Renova se faltar menos de 60s para expirar
      await keycloak.updateToken(60)
    } catch (err) {
      console.warn('Falha ao renovar token, redirecionando para login...', err)
      try {
        // Usa a redirectUri base configurada para evitar mismatch e loops
        await login(false)
      } catch {}
    }
  }, interval)
}

export function login(redirectToCurrent = true) {
  return keycloak.login({
    redirectUri: redirectToCurrent
      ? window.location.href
      : (import.meta.env.VITE_KEYCLOAK_REDIRECT_URI as string),
  })
}

export function logout() {
  return keycloak.logout({
    redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI as string,
  })
}

// Detecta se a URL atual contém parâmetros de retorno do Keycloak (para evitar loops)
export function isReturningFromKeycloak(): boolean {
  const searchParams = new URLSearchParams(window.location.search)
  const rawHash = window.location.hash?.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash ?? ''
  const hashParams = new URLSearchParams(rawHash)
  // OIDC (Keycloak) pode retornar parâmetros tanto na query quanto no hash
  const keys = ['code', 'session_state', 'state', 'iss', 'error', 'access_token']
  return keys.some((k) => searchParams.has(k) || hashParams.has(k))
}
