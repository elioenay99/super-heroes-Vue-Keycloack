import axios, { type AxiosInstance } from 'axios'

const baseURL: string = import.meta?.env?.VITE_BASE_URL as string

export const http: AxiosInstance = axios.create({
  baseURL,
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
