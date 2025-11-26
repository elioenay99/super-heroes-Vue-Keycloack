export const palette = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'] as const

export function paletteColor(i: number): string {
  const idx = Math.abs(Math.trunc(i)) % palette.length
  return palette[idx]
}
