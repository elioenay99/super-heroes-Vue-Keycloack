import axios, { type AxiosInstance } from 'axios'

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

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await http.get<T>(url, { signal })
  return res.data
}

export type HttpClient = typeof http
