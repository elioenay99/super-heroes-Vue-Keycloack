/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_KEYCLOAK_REALM?: string
  readonly VITE_KEYCLOAK_AUTH_URL?: string
  readonly VITE_KEYCLOAK_REDIRECT_URI?: string
  readonly VITE_KEYCLOAK_CLIENT_ID?: string
  // Lista de ORIGINS (ex.: "http://localhost:9100,https://api.sebrae.com")
  // para os quais devemos enviar o header Authorization.
  // Por padrão, enviamos apenas para window.location.origin.
  readonly VITE_AUTH_HEADER_ORIGINS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
