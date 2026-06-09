<script setup>
const { apiUrl } = useRuntimeConfig().public

const { data: revenueData } = await useAsyncData(
  () => $fetch(`${apiUrl}/fy-summary/revenue`)
)

const fiscalYear = computed(() => revenueData.value?.data?.fiscal_year)
const maxFiscalMonth = computed(() => revenueData.value?.data?.max_fiscal_month)
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

const currentRevenue = computed(() => Number(revenueData.value?.data?.current?.revenue || 0))
const previousRevenue = computed(() => Number(revenueData.value?.data?.previous?.revenue || 0))

const pctChange = computed(() => {
  if (!previousRevenue.value) return null
  return ((currentRevenue.value - previousRevenue.value) / previousRevenue.value) * 100
})

function formatAmount(val) {
  if (val >= 1e12) return '$' + (val / 1e12).toFixed(1) + ' trillion'
  if (val >= 1e9) return '$' + (val / 1e9).toFixed(1) + ' billion'
  if (val >= 1e6) return '$' + (val / 1e6).toFixed(1) + ' million'
  if (val >= 1e3) return '$' + (val / 1e3).toFixed(1) + ' thousand'
  return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 })
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
      <h4 class="usa-card__heading text-center font-ui-lg">Revenue</h4>
    </div>
    <div class="usa-card__body">
      <p class="text-center font-ui-md">{{ fyLabel }}</p>
      <p class="margin-y-1 text-bold text-center">{{ formatAmount(currentRevenue) }}</p>
      <p v-if="pctChange !== null" class="text-center">
        {{ formatPct(pctChange) }} from FY{{ String(previousFy).slice(-2) }}
      </p>
    </div>
  </div>
</template>
