// Tipos mínimos para @vueuse/core quando a dependência ainda não estiver instalada/baixada.
// Remove erros de TS2307 no CI até que as dependências sejam resolvidas pelo ambiente.
declare module '@vueuse/core' {
  import type { Ref } from 'vue'

  export interface WatchDebouncedOptions {
    debounce?: number
    maxWait?: number
    immediate?: boolean
  }

  export function watchDebounced<T>(
    source: Ref<T> | (() => T),
    cb: (value: T) => void,
    options?: WatchDebouncedOptions
  ): void

  export function useEventListener(
    target: EventTarget | Ref<EventTarget | null | undefined>,
    event: string,
    listener: (e: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): () => void

  export function useIntersectionObserver(
    target: Ref<Element | null | undefined> | Element,
    callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
    options?: IntersectionObserverInit
  ): { stop: () => void }
}
