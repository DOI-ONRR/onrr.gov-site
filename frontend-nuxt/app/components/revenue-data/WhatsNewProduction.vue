<script setup>
const { apiUrl } = useRuntimeConfig().public

const { data: productionData } = await useAsyncData(
  () => $fetch(`${apiUrl}/fy-summary/production`)
)

const commodities = ['Oil', 'Gas', 'Coal']

const fiscalYear = computed(() => productionData.value?.data?.fiscal_year)
const maxFiscalMonth = computed(() => productionData.value?.data?.max_fiscal_month)
const previousFy = computed(() => fiscalYear.value ? fiscalYear.value - 1 : null)

const fiscalMonthNames = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

const fyLabel = computed(() => {
  const fy = fiscalYear.value
  const month = maxFiscalMonth.value
  if (!fy) return ''
  if (month === 12) return `FY ${fy}`
  if (month === 1) return `FY ${fy} so far`
  return `FY ${fy} so far (Oct - ${fiscalMonthNames[month - 1]})`
})

const lines = computed(() => {
  const current = productionData.value?.data?.current || []
  const previous = productionData.value?.data?.previous || []

  return commodities.map(name => {
    const curr = current.find(r => r.commodity === name)
    const prev = previous.find(r => r.commodity === name)
    const currVol = Number(curr?.volume || 0)
    const prevVol = Number(prev?.volume || 0)
    const pctChange = prevVol ? ((currVol - prevVol) / prevVol) * 100 : null

    return {
      commodity: name,
      volume: currVol,
      unit_abbr: curr?.unit_abbr || '',
      pctChange,
    }
  })
})

function formatVolume(val) {
  if (val >= 1e12) return (val / 1e12).toFixed(1) + ' trillion'
  if (val >= 1e9) return (val / 1e9).toFixed(1) + ' billion'
  if (val >= 1e6) return (val / 1e6).toFixed(1) + ' million'
  if (val >= 1e3) return (val / 1e3).toFixed(1) + ' thousand'
  return val.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPct(val) {
  if (val === null) return ''
  const arrow = val >= 0 ? '\u2191' : '\u2193'
  return `${arrow} ${Math.abs(val).toFixed(1)}%`
}
</script>

<template>
  <div v-if="fiscalYear" class="usa-card__container margin-bottom-2">
    <div class="usa-card__header">
      <h4 class="usa-card__heading text-center font-ui-lg">Production</h4>
    </div>
    <div class="usa-card__body">
      <p class="text-center font-ui-md">{{ fyLabel }}</p>
      <p v-for="line in lines" :key="line.commodity" class="margin-y-1">
        {{ line.commodity }}: {{ formatVolume(line.volume) }} {{ line.unit_abbr }}
        <span v-if="line.pctChange !== null">
          {{ formatPct(line.pctChange) }} from FY{{ String(previousFy).slice(-2) }}
        </span>
      </p>
    </div>
  </div>
</template>