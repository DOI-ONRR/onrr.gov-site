<script setup>
import getMenuByLabel from '@/graphql/queries/collections/menus/getMenuByLabel.gql'
import landingPageProduction from '@/graphql/queries/pages/revenue-data/landingPageProduction.gql'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const route = useRoute()

const { data: menuData } = await useAsyncQuery(getMenuByLabel, {
  menuLabel: 'Revenue Data',
})

const { data } = await useAsyncQuery(landingPageProduction)

const production = computed(() => {
  const totals = data.value?.production_totals || []
  const periods = Object.fromEntries((data.value?.period || []).map(p => [p.id, p]))
  const commodities = Object.fromEntries((data.value?.commodity || []).map(c => [c.id, c]))
  const locations = Object.fromEntries((data.value?.location || []).map(l => [l.id, l]))

  return totals.map(row => {
    const period = periods[row.group.period] || {}
    const commodity = commodities[row.group.commodity] || {}
    const location = locations[row.group.location] || {}

    return {
      source: location.source,
      product: commodity.product,
      total_volume: row.sum.volume,
      month_long: period.month_long,
      month_short: period.month_short,
      period_date: period.period_date,
      calendar_year: period.calendar_year,
      fiscal_year: period.fiscal_year,
      fiscal_month: period.fiscal_month,
    }
  }).sort((a, b) => a.fiscal_year - b.fiscal_year || a.fiscal_month - b.fiscal_month)
})

const selectedFrequency = ref('Yearly')
const selectedProduct = ref('Oil (bbl)')

const now = new Date()
const mostRecentCalendarYear = now.getFullYear() - 1
const mostRecentFiscalYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1

const periodOptions = computed(() => {
  if (selectedFrequency.value === 'Yearly') {
    return ['Fiscal Year', 'Calendar Year']
  }
  return [
    'Most Recent 12 Months',
    `Fiscal Year ${mostRecentFiscalYear}`,
    `Calendar Year ${mostRecentCalendarYear}`,
  ]
})

const selectedPeriod = ref('Fiscal Year')

watch(selectedFrequency, () => {
  selectedPeriod.value = periodOptions.value[0]
})

const chartEl = ref(null)
const hoveredFiscalYear = ref(null)

const chartData = computed(() => {
  const isMonthly = selectedFrequency.value === 'Monthly'
  const isCalendarYear = selectedPeriod.value === 'Calendar Year'
  const filtered = production.value.filter(row => row.product === selectedProduct.value)

  if (isMonthly) {
    const isFiscalYear = selectedPeriod.value.startsWith('Fiscal Year')
    const isCalYear = selectedPeriod.value.startsWith('Calendar Year')

    let monthRows
    if (isFiscalYear) {
      const fy = parseInt(selectedPeriod.value.replace('Fiscal Year ', ''))
      monthRows = filtered.filter(row => row.fiscal_year === fy)
    } else if (isCalYear) {
      const cy = parseInt(selectedPeriod.value.replace('Calendar Year ', ''))
      monthRows = filtered.filter(row => row.calendar_year === cy)
    } else {
      // Most Recent 12 Months
      const periodDates = [...new Set(filtered.map(r => r.period_date).filter(Boolean))].sort()
      const recent12 = periodDates.slice(-12)
      monthRows = filtered.filter(row => recent12.includes(row.period_date))
    }

    const grouped = {}
    const sources = new Set()
    for (const row of monthRows) {
      const key = row.period_date
      if (!key) continue
      const source = row.source || 'Unknown'
      sources.add(source)
      if (!grouped[key]) grouped[key] = { month_short: row.month_short }
      if (!grouped[key][source]) grouped[key][source] = 0
      grouped[key][source] += Number(row.total_volume || 0)
    }

    const keys = Object.keys(grouped).sort()
    return {
      categories: keys.map(k => grouped[k].month_short),
      xAxisTitle: 'Month',
      series: ['Native American', 'Federal offshore', 'Federal onshore']
        .filter(source => sources.has(source))
        .map(source => ({
          name: source,
          data: keys.map(k => grouped[k]?.[source] || 0),
        })),
    }
  }

  // Yearly
  const yearField = isCalendarYear ? 'calendar_year' : 'fiscal_year'
  const grouped = {}
  const sources = new Set()
  for (const row of filtered) {
    const year = row[yearField]
    const source = row.source || 'Unknown'
    if (!year) continue
    sources.add(source)
    if (!grouped[year]) grouped[year] = {}
    grouped[year][source] = (grouped[year][source] || 0) + Number(row.total_volume || 0)
  }
  const years = Object.keys(grouped).sort().slice(-11)
  const prefix = isCalendarYear ? 'CY' : 'FY'
  return {
    categories: years.map(y => `${prefix} ${y}`),
    xAxisTitle: isCalendarYear ? 'Calendar Year' : 'Fiscal Year',
    series: ['Native American', 'Federal offshore', 'Federal onshore']
      .filter(source => sources.has(source))
      .map(source => ({
        name: source,
        data: years.map(y => grouped[y]?.[source] || 0),
      })),
  }
})

function buildChart() {
  if (!chartEl.value || !Highcharts) return
  const { categories, series, xAxisTitle } = chartData.value
  Highcharts.chart(chartEl.value, {
    chart: {
      type: 'column',
      events: {
        load() {
          const container = this.container
          container.addEventListener('mouseleave', () => {
            hoveredFiscalYear.value = null
          })
        },
      },
    },
    title: { text: null },
    xAxis: { categories, title: { text: xAxisTitle } },
    yAxis: { title: { text: 'Volume' } },
    plotOptions: {
      column: {
        stacking: 'normal',
        point: {
          events: {
            mouseOver() {
              const category = categories[this.index]
              const year = parseInt(category.replace(/\D+/g, ''))
              if (year) hoveredFiscalYear.value = year
            },
          },
        },
      },
    },
    colors: ['#0D4D81', '#1C97BC', '#265E37', '#71915C', '#A8DEE8', '#143F1E', '#2A294E', '#7A8AAA'],
    series,
  })
}

let Highcharts = null

onMounted(async () => {
  Highcharts = (await import('highcharts')).default
  buildChart()
})

watch(chartData, () => buildChart())

const sourceOrder = ['Native American', 'Federal offshore', 'Federal onshore']

const comparisonTable = computed(() => {
  const filtered = production.value.filter(row => row.product === selectedProduct.value)

  if (selectedFrequency.value !== 'Yearly' || selectedPeriod.value !== 'Fiscal Year') {
    return null
  }

  // Find the two most recent fiscal years in the data
  const fiscalYears = [...new Set(filtered.map(r => r.fiscal_year).filter(Boolean))].sort()
  const fy1 = hoveredFiscalYear.value && fiscalYears.includes(hoveredFiscalYear.value)
    ? hoveredFiscalYear.value
    : fiscalYears.at(-1)
  const fy1Index = fiscalYears.indexOf(fy1)
  const fy2 = fy1Index > 0 ? fiscalYears[fy1Index - 1] : null
  if (!fy1 || !fy2) return null

  // Determine which fiscal months exist in the selected FY
  const fy1Months = [...new Set(filtered.filter(r => r.fiscal_year === fy1).map(r => r.fiscal_month))].sort((a, b) => a - b)
  const isPartial = fy1Months.length < 12

  // Get month_short for the last available fiscal month
  const lastMonthRow = filtered.find(r => r.fiscal_year === fy1 && r.fiscal_month === fy1Months.at(-1))
  const firstMonthRow = filtered.find(r => r.fiscal_year === fy1 && r.fiscal_month === fy1Months[0])
  const soFarLabel = isPartial
    ? ` so far (${firstMonthRow?.month_short} - ${lastMonthRow?.month_short})`
    : ''

  const period1Label = `FY ${fy1}${soFarLabel}`
  const period2Label = `FY ${fy2}${soFarLabel}`

  // Sum volumes by source, only for the available fiscal months
  function sumBySource(fy) {
    const totals = {}
    for (const row of filtered) {
      if (row.fiscal_year !== fy) continue
      if (isPartial && !fy1Months.includes(row.fiscal_month)) continue
      const source = row.source || 'Unknown'
      totals[source] = (totals[source] || 0) + Number(row.total_volume || 0)
    }
    return totals
  }

  const fy1Totals = sumBySource(fy1)
  const fy2Totals = sumBySource(fy2)

  function pctChange(v1, v2) {
    if (!v2) return null
    return ((v1 - v2) / v2) * 100
  }

  const rows = sourceOrder
    .filter(source => fy1Totals[source] !== undefined || fy2Totals[source] !== undefined)
    .map(source => ({
      source,
      period1: fy1Totals[source] || 0,
      period2: fy2Totals[source] || 0,
      pctChange: pctChange(fy1Totals[source] || 0, fy2Totals[source] || 0),
    }))

  const totalP1 = rows.reduce((sum, r) => sum + r.period1, 0)
  const totalP2 = rows.reduce((sum, r) => sum + r.period2, 0)

  return {
    period1Label,
    period2Label,
    rows,
    summary: {
      source: 'Total',
      period1: totalP1,
      period2: totalP2,
      pctChange: pctChange(totalP1, totalP2),
    },
  }
})

function formatVolume(val) {
  return val?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'
}

function formatPct(val) {
  if (val === null || val === undefined) return '—'
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}

const sidenavLinks = computed(() => {
  const menu = menuData.value?.menus?.[0]
  if (!menu) return []
  const links = []
  if (menu.link_to_page) links.push(menu.link_to_page)
  menu.menu_children?.forEach((child) => {
    if (child.pages_id) links.push(child.pages_id)
  })
  return links
})
</script>

<template>
  <section class="grid-container usa-section margin-top-4">
    <div class="grid-row grid-gap">
      <div class="grid-col-2">
        <nav v-if="sidenavLinks.length" aria-label="Side navigation">
          <ul class="usa-sidenav">
            <li class="usa-sidenav__item" v-for="link in sidenavLinks" :key="link.title">
              <NuxtLink :to="link.url" :class="{ 'usa-current': link.url === route.path }">
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div class="grid-col-7">
        <nav class="usa-breadcrumb" aria-label="Breadcrumbs">
          <ol class="usa-breadcrumb__list">
            <li class="usa-breadcrumb__list-item">
              <NuxtLink to="/" class="usa-breadcrumb__link">Home</NuxtLink>
            </li>
            <li class="usa-breadcrumb__list-item usa-current" aria-current="page">
              <span>Revenue Data</span>
            </li>
          </ol>
        </nav>
        <h1>About natural resources revenue data</h1>
        <p class="line-height-body-4">Companies pay to produce energy and minerals on federal lands, Native American lands, and the Outer Continental Shelf. The payments these companies make include bonuses, rents, and royalties. The Office of Natural Resources Revenue (ONRR)  collects these payments and distributes them. The payments go to federal and local governments and Native Americans.</p>

        <TabGroup as="div" class="margin-top-4">
          <TabList class="tabs-block__list">
            <Tab v-slot="{ selected }" as="template">
              <button class="tabs-block__tab"
                :class="{ 'tabs-block__tab--selected': selected }">Production</button>
            </Tab>
            <Tab v-slot="{ selected }" as="template">
              <button class="tabs-block__tab"
                :class="{ 'tabs-block__tab--selected': selected }">Revenue</button>
            </Tab>
            <Tab v-slot="{ selected }" as="template">
              <button class="tabs-block__tab"
                :class="{ 'tabs-block__tab--selected': selected }">Disbursements</button>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <h3>Production</h3>
              <p>The volume of natural resources produced on property owned by the federal government and Native Americans.</p>
              <div class="display-flex flex-row flex-align-end">
                <div class="margin-right-2">
                  <label class="usa-label usa-sr-only">Frequency</label>
                  <ul class="usa-button-group usa-button-group--segmented margin-top-05">
                    <li class="usa-button-group__item">
                      <button type="button" class="usa-button"
                        :class="{ 'usa-button--outline': selectedFrequency !== 'Yearly' }"
                        @click="selectedFrequency = 'Yearly'">Yearly</button>
                    </li>
                    <li class="usa-button-group__item">
                      <button type="button" class="usa-button"
                        :class="{ 'usa-button--outline': selectedFrequency !== 'Monthly' }"
                        @click="selectedFrequency = 'Monthly'">Monthly</button>
                    </li>
                  </ul>
                </div>
                <div class="padding-bottom-05 margin-right-2 flex-1">
                  <label class="usa-label margin-top-05" for="period-select">Period</label>
                  <select class="usa-select" name="period-select" id="period-select" v-model="selectedPeriod">
                    <option v-for="option in periodOptions" :key="option">{{ option }}</option>
                  </select>
                </div>
                <div class="padding-bottom-05 flex-1">
                  <label class="usa-label margin-top-05" for="product-select">Product</label>
                  <select class="usa-select" name="product-select" id="product-select" v-model="selectedProduct">
                    <option>Oil (bbl)</option>
                    <option>Gas (mcf)</option>
                    <option>Coal (tons)</option>
                  </select>
                </div>
              </div>
              <div ref="chartEl" class="margin-top-6"></div>
              <h4>Comparison</h4>
              <p class="line-height-body-4">Compares data for the selected fiscal year to the previous fiscal year. For the current fiscal year, we compare the months for which we have data with the same months in the previous fiscal year. To select a year, click or hover over a bar in the graph. Your selection changes the content displayed in the table.</p>
              <table v-if="comparisonTable" class="usa-table usa-table--borderless width-full margin-top-4">
                <thead>
                  <tr>
                    <th scope="col">Source</th>
                    <th scope="col" class="text-right">{{ comparisonTable.period1Label }}</th>
                    <th scope="col" class="text-right">{{ comparisonTable.period2Label }}</th>
                    <th scope="col" class="text-right">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in comparisonTable.rows" :key="row.source">
                    <td>{{ row.source }}</td>
                    <td class="text-right">{{ formatVolume(row.period1) }}</td>
                    <td class="text-right">{{ formatVolume(row.period2) }}</td>
                    <td class="text-right">{{ formatPct(row.pctChange) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="text-bold">
                    <td>{{ comparisonTable.summary.source }}</td>
                    <td class="text-right">{{ formatVolume(comparisonTable.summary.period1) }}</td>
                    <td class="text-right">{{ formatVolume(comparisonTable.summary.period2) }}</td>
                    <td class="text-right">{{ formatPct(comparisonTable.summary.pctChange) }}</td>
                  </tr>
                </tfoot>
              </table>
            </TabPanel>
            <TabPanel>
              <h3>Revenue</h3>
              <p>The amount of money collected from natural resources on property owned by the federal government and Native Americans.</p>
            </TabPanel>
            <TabPanel>
              <h3>Disbursements</h3>
              <p>The amount of money paid to federal and local governments and Native Americans.</p>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <div class="grid-col-3">
        <h2>What's New</h2>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.usa-sidenav .usa-current::before {
  background-color: $color-medium-green !important;
}
</style>
