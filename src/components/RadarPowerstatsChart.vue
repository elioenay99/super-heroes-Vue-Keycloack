<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type ChartDataset,
  type ScriptableContext,
  type TooltipItem,
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export interface HeroSeriesStats {
  intelligence: number | null
  strength: number | null
  speed: number | null
  durability: number | null
  power: number | null
  combat: number | null
}

export interface HeroSeries { id: number; name: string; color: string; stats: HeroSeriesStats }

const props = defineProps<{ series: HeroSeries[] }>()

const labels = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat']

function alpha(hex: string, a: number) {
  // hex like #10b981 -> rgba
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!m) return `rgba(255,255,255,${a})`
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const options = ref<ChartOptions<'radar'>>({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { stepSize: 20, showLabelBackdrop: false, color: '#94a3b8' },
      grid: { color: 'rgba(148,163,184,0.2)' },
      angleLines: { color: 'rgba(148,163,184,0.2)' },
      pointLabels: { color: '#cbd5e1', font: { size: 11 } },
    },
  },
  plugins: {
    legend: { labels: { color: '#e2e8f0' } },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'radar'>) => {
          const dataset = ctx.dataset as ChartDataset<'radar'> & { missingFlags?: boolean[] }
          const isMissing = dataset.missingFlags?.[ctx.dataIndex]
          const v = ctx.parsed.r ?? 0
          return `${ctx.dataset.label}: ${isMissing ? v + ' (sem dado)' : v}`
        },
      },
    },
  },
})

const data = computed<ChartData<'radar'>>(() => {
  const datasets = props.series.map((s) => {
    const raw = [
      s.stats.intelligence,
      s.stats.strength,
      s.stats.speed,
      s.stats.durability,
      s.stats.power,
      s.stats.combat,
    ]
    const missingFlags = raw.map((v) => v === null || Number.isNaN(v))
    const values = raw.map((v) => (v == null || Number.isNaN(v) ? 0 : Math.max(0, Math.min(100, Math.trunc(v)))))
    const fillColor = alpha(s.color, 0.25)
    const borderColor = alpha(s.color, 0.9)
    const ds: ChartDataset<'radar'> & { missingFlags?: boolean[] } = {
      label: s.name,
      data: values,
      backgroundColor: fillColor,
      borderColor,
      borderWidth: 2,
      pointBackgroundColor: borderColor,
      pointBorderColor: borderColor,
      pointHoverBackgroundColor: borderColor,
      pointHoverBorderColor: borderColor,
      pointRadius: 3,
      // estilo tracejado para pontos sem dado (via scriptable option)
      segment: {
        borderDash: (ctx: ScriptableContext<'radar'>) => {
          const i = ctx.p1DataIndex
          return missingFlags[i] ? [6, 4] : undefined
        },
      },
      // adiciona flags para usar no tooltip
      missingFlags,
    }
    return ds
  })
  return { labels, datasets }
})

// re-render quando a série mudar (para Chart.js detectar mudanças profundas)
watch(
  () => props.series,
  () => {
    // noop: o computed data já reagirá
  },
  { deep: true }
)
</script>

<template>
  <div class="w-full h-80 sm:h-96">
    <Radar :data="data" :options="options" />
  </div>
</template>

<style scoped></style>
