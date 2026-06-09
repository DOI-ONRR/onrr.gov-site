<template>
  <section class="grid-container usa-section margin-top-4">
    <div class="grid-row grid-gap">
      <div class="grid-col-9">
        <h1>Production Data</h1>
        <div class="grid-row grid-gap">
          <div class="grid-col">
            <label class="usa-label" for="period-select">Period</label>
            <ul class="usa-button-group usa-button-group--segmented">
              <li v-for="period in periodOptions" :key="period" class="usa-button-group__item">
                <button
                  type="button"
                  class="usa-button"
                  :class="{ 'usa-button--outline': selectedPeriod !== period }"
                  @click="selectedPeriod = period"
                >{{ period }}</button>
              </li>
            </ul>
          </div>
          <div class="grid-col">
            <label class="usa-label" for="product-select">Product</label>
            <select id="product-select" class="usa-select" v-model="selectedProduct">
              <option value="">All</option>
              <option v-for="p in products" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>
        <div class="grid-row margin-top-3">
          <div class="grid-col-12">
            <div ref="chartEl"></div>
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
const periodOptions = ['Monthly', 'Calendar Year', 'Fiscal Year']
const selectedPeriod = ref('Monthly')
const selectedProduct = ref('')
const allData = ref([])
const formats = ['json', 'csv', 'xlsx']
const fields = ['period.period_date', 'location.land_class', 'location.land_category', 'commodity.name', 'volume']

function download(content, filename) {
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function flattenRows(data) {
  return data.map(item => ({
    'Date': item.period?.period_date,
    'Land Class': item.location?.land_class,
    'Land Category': item.location?.land_category,
    'Commodity': item.commodity?.name,
    'Volume': item.volume
  }))
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
  if (!chartEl.value) return

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

  Highcharts.chart(chartEl.value, {
    colors: ['#0D4D81', '#1C97BC', '#265E37', '#71915C', '#A8DEE8', '#143F1E', '#2A294E', '#7A8AAA'],
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
      filter: {
        "period": {
          "period_date": {
            "_gte": "2021-01-01"
          }
        }
      },
      sort: 'period.period_date'
    }
  })

  allData.value = data
  buildChart(data)
})

async function exportData(format) {
  if (format === 'csv' || format === 'xlsx') {
    const { data } = await $fetch(`${apiUrl}/items/production`, {
      query: { limit: -1, fields }
    })
    if (format === 'xlsx') {
      const XLSX = await import('xlsx')
      const ws = XLSX.utils.json_to_sheet(flattenRows(data))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Production')
      XLSX.writeFile(wb, 'production.xlsx')
    } else {
      download(buildCsv(data), 'production.csv')
    }
  } else {
    const blob = await $fetch(`${apiUrl}/items/production`, {
      query: { limit: -1, fields, export: format },
      responseType: 'blob'
    })
    download(blob, `production.${format}`)
  }
}
</script>