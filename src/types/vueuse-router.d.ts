// Tipos mínimos para @vueuse/router quando a dependência ainda não estiver instalada/baixada.
// Evita erros TS2307 em ambientes de CI sem cache de node_modules.
declare module '@vueuse/router' {
  import type { Ref } from 'vue'

  /**
   * Retorna um Ref reativo vinculado a uma query string específica.
   * Ex.: const foo = useRouteQuery<string | undefined>('foo')
   */
  export function useRouteQuery<T = string | string[] | undefined>(
    name: string,
    defaultValue?: T
  ): Ref<T>
}
