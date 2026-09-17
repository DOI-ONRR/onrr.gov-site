<script setup>
/*
  MiniLineChart — a small, reactive Highcharts line chart driven entirely by props (no CMS
  chart_card). Used by dataset previews that render charts inline next to their filters, so the
  charts update as the props (filtered data) change. Client-side only; Highcharts is lazy-loaded.
*/
const props = defineProps({
  categories: { type: Array, default: () => [] }, // x-axis labels (e.g. calendar years)
  series: { type: Array, default: () => [] }, // [{ name, data: number[], color? }]
  valueFormat: { type: String, default: 'number' }, // 'number' | 'currency'
  height: { type: Number, default: 220 },
  showLegend: { type: Boolean, default: false },
  colors: { type: Array, default: () => ['#005ea2', '#e66f0e', '#00a91c', '#8168b3', '#e52207'] },
})

const el = ref(null)
let Highcharts = null
let chart = null

const isCurrency = computed(() => props.valueFormat === 'currency')

// Full value (tooltip): $1,234,567 or 1,234,567.
function fullValue(v) {
  if (v == null || !Number.isFinite(Number(v))) return '—'
  const n = Number(v)
  return isCurrency.value
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// Compact value (axis): $1.2B / 340M / 12K.
function compactValue(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return ''
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  const pfx = isCurrency.value ? '$' : ''
  const scale = abs >= 1e9 ? [1e9, 'B'] : abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'K'] : [1, '']
  const val = abs / scale[0]
  const str = val >= 100 || scale[1] === '' ? Math.round(val).toString() : val.toFixed(1).replace(/\.0$/, '')
  return `${sign}${pfx}${str}${scale[1]}`
}

function options() {
  const fv = fullValue
  const cv = compactValue
  return {
    chart: { type: 'line', height: props.height, spacingTop: 8, spacingBottom: 6, style: { fontFamily: 'inherit' } },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: props.showLegend },
    colors: props.colors,
    xAxis: { categories: props.categories.map(String), tickmarkPlacement: 'on', tickLength: 4, labels: { style: { fontSize: '0.7rem' } } },
    yAxis: { title: { text: null }, labels: { formatter() { return cv(this.value) }, style: { fontSize: '0.7rem' } } },
    tooltip: {
      shared: props.showLegend,
      formatter() {
        if (this.points) {
          return `<b>${this.x}</b><br/>` + this.points.map((p) => `${p.series.name}: <b>${fv(p.y)}</b>`).join('<br/>')
        }
        return `<b>${this.x}</b><br/>${this.series.name}: <b>${fv(this.y)}</b>`
      },
    },
    plotOptions: { line: { marker: { enabled: false, symbol: 'circle', radius: 3 }, lineWidth: 2, connectNulls: false } },
    series: props.series.map((s) => ({ name: s.name, data: s.data, color: s.color })),
  }
}

async function render() {
  if (!el.value || !props.series.length) return
  if (!Highcharts) Highcharts = (await import('highcharts')).default
  if (chart) chart.destroy()
  chart = Highcharts.chart(el.value, options())
}

onMounted(render)
watch(() => [props.categories, props.series, props.height], render, { deep: true })
onUnmounted(() => { if (chart) { chart.destroy(); chart = null } })
</script>

<template>
  <div ref="el" :style="{ minHeight: `${height}px` }" />
</template>
