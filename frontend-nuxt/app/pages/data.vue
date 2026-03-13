<template>
  <section class="grid-container usa-section margin-top-4">
    <div class="grid-row grid-gap">
      <div class="grid-col-9">
        <h1>Production Data</h1>
        <div class="grid-row grid-gap">
          <div class="grid-col-6">
            <label class="usa-label" for="period-select">Period</label>
            <select id="period-select" class="usa-select" v-model="selectedPeriod">
              <option value="">All</option>
              <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="grid-col-6">
            <label class="usa-label" for="product-select">Product</label>
            <select id="product-select" class="usa-select" v-model="selectedProduct">
              <option value="">All</option>
              <option v-for="p in products" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>
        <div class="grid-row margin-top-3">
          <div class="grid-col-12">
            <div ref="chartEl" style="height: 400px;"></div>
          </div>
        </div>
      </div>
      <div class="grid-col-3">
        <h3 class="margin-top-4">Download</h3>
        <ul class="usa-button-group usa-button-group--segmented">
          <li v-for="format in formats" :key="format" class="usa-button-group__item">
            <button type="button" class="usa-button" @click="exportData(format)">{{ format.toUpperCase() }}</button>
          </li>
        </ul>
        <p><a href="#" class="usa-link font-ui-2xs">Data dictionary</a></p>
      </div>
    </div>
  </section>
</template>

<script setup lang="js">
let Highcharts = null

const { apiUrl } = useRuntimeConfig().public

const chartEl = ref(null)
const selectedPeriod = ref('')
const selectedProduct = ref('')
const periods = ref([])
const products = ref([])
const allData = ref([])
const formats = ['json', 'csv', 'yaml', 'xml']
const fields = ['period.period_date', 'location.land_class', 'location.land_category', 'commodity.name', 'volume']

function download(content, filename) {
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildCsv(data) {
  const headers = ['Date', 'Land Class', 'Land Category', 'Commodity', 'Volume']
  const rows = data.map(item => [
    item.period?.period_date,
    item.location?.land_class,
    item.location?.land_category,
    item.commodity?.name,
    item.volume
  ].map(v => `"${v ?? ''}"`).join(','))

  return new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
}

function buildChart(data) {
  console.log('buildChart called', { chartEl: chartEl.value, Highcharts, dataLength: data?.length })
  if (!chartEl.value) { console.log('chartEl is null, returning'); return }

  const grouped = {}
  for (const item of data) {
    const name = item.commodity?.name ?? 'Unknown'
    const date = item.period?.period_date_year
    if (!date) continue
    const key = `${name}|${date}`
    if (!grouped[key]) grouped[key] = { name, date, volume: 0 }
    grouped[key].volume += Number(item.volume ?? 0)
  }

  const commodities = {}
  for (const { name, date, volume } of Object.values(grouped)) {
    if (!commodities[name]) commodities[name] = []
    commodities[name].push([new Date(date).getTime(), volume])
  }

  console.log('series count:', Object.keys(commodities).length, 'grouped count:', Object.keys(grouped).length)
  console.log('first item sample:', data?.[0])
  Highcharts.chart(chartEl.value, {
    chart: { type: 'line' },
    title: { text: 'Production Volume by Commodity' },
    xAxis: { type: 'datetime', title: { text: 'Fiscal Year' } },
    yAxis: { title: { text: 'Volume' } },
    series: Object.entries(commodities).map(([name, data]) => ({
      name,
      data: data.sort((a, b) => a[0] - b[0])
    }))
  })
}

const filteredData = computed(() => {
  return allData.value.filter(item => {
    if (selectedPeriod.value && item.period?.type !== selectedPeriod.value) return false
    if (selectedProduct.value && item.commodity?.product !== selectedProduct.value) return false
    return true
  })
})

watch(filteredData, (data) => buildChart(data))

onMounted(async () => {
  Highcharts = (await import('highcharts')).default

  const { data } = await $fetch(`${apiUrl}/items/production`, {
    query: {
      limit: -1,
      fields: 'year(period.period_date),period.type,commodity.name,commodity.product,volume',
      sort: 'period.period_date'
    }
  })

  const periodSet = new Set()
  const productSet = new Set()
  for (const item of data) {
    if (item.period?.type) periodSet.add(item.period.type)
    if (item.commodity?.product) productSet.add(item.commodity.product)
  }
  periods.value = [...periodSet].sort()
  products.value = [...productSet].sort()

  allData.value = data
  buildChart(data)
})

async function exportData(format) {
  if (format === 'csv') {
    const { data } = await $fetch(`${apiUrl}/items/production`, {
      query: { limit: -1, fields }
    })
    download(buildCsv(data), `production.${format}`)
  } else {
    const blob = await $fetch(`${apiUrl}/items/production`, {
      query: { limit: -1, fields, export: format },
      responseType: 'blob'
    })
    download(blob, `production.${format}`)
  }
}
</script>