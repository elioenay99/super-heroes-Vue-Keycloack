import axios, { type AxiosInstance } from 'axios'
import { keycloak } from '@/lib/keycloak'

// Usa a variável de ambiente quando disponível, senão cai para a URL pública padrão
const baseURL: string = (import.meta?.env?.VITE_BASE_URL as string) ?? 'https://akabab.github.io/superhero-api/api/'

export const http: AxiosInstance = axios.create({
  // Garante que tenha uma barra final e não duplique quando o serviço passar caminhos relativos
  baseURL: baseURL.endsWith('/') ? baseURL : baseURL + '/',
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
})

// Descobre para quais ORIGINS podemos enviar o header Authorization.
// Por padrão, só enviamos para a MESMA ORIGEM da aplicação (evita CORS em APIs públicas).
// Permita outras origens configurando VITE_AUTH_HEADER_ORIGINS com uma lista separada por vírgula.
const allowedAuthOrigins: string[] = (() => {
  const raw = (import.meta as any)?.env?.VITE_AUTH_HEADER_ORIGINS as string | undefined
  if (raw && raw.trim()) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }
  try {
    return [window.location.origin]
  } catch {
    return []
  }
})()

// Interceptor para anexar token SOMENTE quando a origem do request estiver permitida
http.interceptors.request.use(async (config) => {
  // Resolve a URL final do request (considerando url relativa + baseURL)
  let requestOrigin: string | null = null
  try {
    const base = (config.baseURL ?? http.defaults.baseURL ?? window.location.origin) as string
    const full = new URL(String(config.url ?? ''), base)
    requestOrigin = full.origin
  } catch {
    requestOrigin = null
  }

  const shouldAttachAuth = Boolean(keycloak?.authenticated) && !!requestOrigin && allowedAuthOrigins.includes(requestOrigin)

  if (shouldAttachAuth) {
    try {
      // Renova o token se estiver a menos de 30s de expirar
      await keycloak.updateToken(30)
      // Garante headers e define Authorization sem quebrar o tipo do Axios
      if (!config.headers) {
        ;(config.headers as any) = {}
      }
      const h: any = config.headers as any
      if (typeof h.set === 'function') {
        h.set('Authorization', `Bearer ${keycloak.token}`)
      } else {
        h['Authorization'] = `Bearer ${keycloak.token}`
      }
    } catch (e) {
      console.warn('Não foi possível atualizar o token', e)
    }
  }
  return config
})

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await http.get<T>(url, { signal })
  return res.data
}

export type HttpClient = typeof http
