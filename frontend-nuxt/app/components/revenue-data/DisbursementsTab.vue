<script setup>
const { apiUrl } = useRuntimeConfig().public

const selectedFrequency = ref('Yearly')
const selectedBreakout = ref('Source')

const breakoutParam = computed(() => {
  const map = { 'Source': 'source', 'Recipient': 'recipient' }
  return map[selectedBreakout.value]
})

const { data: disbursementData } = await useAsyncData(
  () => $fetch(`${apiUrl}/disbursement-summary`, { query: { breakout: breakoutParam.value } }),
  { watch: [breakoutParam] }
)

const disbursements = computed(() => {
  const rows = disbursementData.value?.data || []
  return rows.map(row => ({
    breakout_value: row.breakout_value,
    total_amount: Number(row.total_amount),
    month_long: row.month_long,
    month_short: row.month_short,
    period_date: row.period_date,
    calendar_year: row.calendar_year,
    fiscal_year: row.fiscal_year,
    fiscal_month: row.fiscal_month,
  })).sort((a, b) => a.fiscal_year - b.fiscal_year || a.fiscal_month - b.fiscal_month)
})

const breakoutConfig = {
  'Source': ['Native American', 'Federal offshore', 'Federal onshore'],
  'Recipient': ['U.S. Treasury', 'State and local governments', 'Reclamation Fund', 'Native American tribes and individuals', 'Land and Water Conservation Fund', 'Historic Preservation Fund', 'Other funds'],
}

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
  const breakoutOrder = breakoutConfig[selectedBreakout.value]

  if (isMonthly) {
    const isFiscalYear = selectedPeriod.value.startsWith('Fiscal Year')
    const isCalYear = selectedPeriod.value.startsWith('Calendar Year')

    let monthRows
    if (isFiscalYear) {
      const fy = parseInt(selectedPeriod.value.replace('Fiscal Year ', ''))
      monthRows = disbursements.value.filter(row => row.fiscal_year === fy)
    } else if (isCalYear) {
      const cy = parseInt(selectedPeriod.value.replace('Calendar Year ', ''))
      monthRows = disbursements.value.filter(row => row.calendar_year === cy)
    } else {
      const periodDates = [...new Set(disbursements.value.map(r => r.period_date).filter(Boolean))].sort()
      const recent12 = periodDates.slice(-12)
      monthRows = disbursements.value.filter(row => recent12.includes(row.period_date))
    }

    const grouped = {}
    const breakouts = new Set()
    for (const row of monthRows) {
      const key = row.period_date
      if (!key) continue
      const breakout = row.breakout_value || 'Unknown'
      breakouts.add(breakout)
      if (!grouped[key]) grouped[key] = { month_short: row.month_short }
      if (!grouped[key][breakout]) grouped[key][breakout] = 0
      grouped[key][breakout] += Number(row.total_amount || 0)
    }

    const keys = Object.keys(grouped).sort()
    return {
      categories: keys.map(k => grouped[k].month_short),
      xAxisTitle: 'Month',
      series: breakoutOrder
        .filter(b => breakouts.has(b))
        .map(b => ({
          name: b,
          data: keys.map(k => grouped[k]?.[b] || 0),
        })),
    }
  }

  // Yearly
  const yearField = isCalendarYear ? 'calendar_year' : 'fiscal_year'
  const grouped = {}
  const breakouts = new Set()
  for (const row of disbursements.value) {
    const year = row[yearField]
    const breakout = row.breakout_value || 'Unknown'
    if (!year) continue
    breakouts.add(breakout)
    if (!grouped[year]) grouped[year] = {}
    grouped[year][breakout] = (grouped[year][breakout] || 0) + Number(row.total_amount || 0)
  }
  const years = Object.keys(grouped).sort().slice(-11)
  const prefix = isCalendarYear ? 'CY' : 'FY'
  return {
    categories: years.map(y => `${prefix} ${y}`),
    xAxisTitle: isCalendarYear ? 'Calendar Year' : 'Fiscal Year',
    series: breakoutOrder
      .filter(b => breakouts.has(b))
      .map(b => ({
        name: b,
        data: years.map(y => grouped[y]?.[b] || 0),
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
    yAxis: { title: { text: 'Disbursements ($)' } },
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

const comparisonTable = computed(() => {
  if (selectedFrequency.value !== 'Yearly' || selectedPeriod.value !== 'Fiscal Year') {
    return null
  }

  const breakoutOrder = breakoutConfig[selectedBreakout.value]

  const fiscalYears = [...new Set(disbursements.value.map(r => r.fiscal_year).filter(Boolean))].sort()
  const fy1 = hoveredFiscalYear.value && fiscalYears.includes(hoveredFiscalYear.value)
    ? hoveredFiscalYear.value
    : fiscalYears.at(-1)
  const fy1Index = fiscalYears.indexOf(fy1)
  const fy2 = fy1Index > 0 ? fiscalYears[fy1Index - 1] : null
  if (!fy1 || !fy2) return null

  const fy1Months = [...new Set(disbursements.value.filter(r => r.fiscal_year === fy1).map(r => r.fiscal_month))].sort((a, b) => a - b)
  const isPartial = fy1Months.length < 12

  const lastMonthRow = disbursements.value.find(r => r.fiscal_year === fy1 && r.fiscal_month === fy1Months.at(-1))
  const firstMonthRow = disbursements.value.find(r => r.fiscal_year === fy1 && r.fiscal_month === fy1Months[0])
  const soFarLabel = isPartial
    ? ` so far (${firstMonthRow?.month_short} - ${lastMonthRow?.month_short})`
    : ''

  const period1Label = `FY ${fy1}${soFarLabel}`
  const period2Label = `FY ${fy2}${soFarLabel}`

  function sumByBreakout(fy) {
    const totals = {}
    for (const row of disbursements.value) {
      if (row.fiscal_year !== fy) continue
      if (isPartial && !fy1Months.includes(row.fiscal_month)) continue
      const key = row.breakout_value || 'Unknown'
      totals[key] = (totals[key] || 0) + Number(row.total_amount || 0)
    }
    return totals
  }

  const fy1Totals = sumByBreakout(fy1)
  const fy2Totals = sumByBreakout(fy2)

  function pctChange(v1, v2) {
    if (!v2) return null
    return ((v1 - v2) / v2) * 100
  }

  const rows = breakoutOrder
    .filter(key => fy1Totals[key] !== undefined || fy2Totals[key] !== undefined)
    .map(key => ({
      label: key,
      period1: fy1Totals[key] || 0,
      period2: fy2Totals[key] || 0,
      pctChange: pctChange(fy1Totals[key] || 0, fy2Totals[key] || 0),
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

function formatAmount(val) {
  if (val === null || val === undefined) return '—'
  return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPct(val) {
  if (val === null || val === undefined) return '—'
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}
</script>

<template>
  <h3>Disbursements</h3>
  <p>The amount of money paid to federal and local governments and Native Americans.</p>
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
      <label class="usa-label margin-top-05" for="disbursement-period-select">Period</label>
      <select class="usa-select" name="disbursement-period-select" id="disbursement-period-select" v-model="selectedPeriod" :disabled="selectedFrequency === 'Yearly'">
        <option v-for="option in periodOptions" :key="option">{{ option }}</option>
      </select>
    </div>
    <div class="padding-bottom-05 flex-1">
      <label class="usa-label margin-top-05" for="disbursement-breakout-select">Breakout</label>
      <select class="usa-select" name="disbursement-breakout-select" id="disbursement-breakout-select" v-model="selectedBreakout">
        <option>Source</option>
        <option>Recipient</option>
      </select>
    </div>
  </div>
  <div ref="chartEl" class="margin-top-6"></div>
  <h4>Comparison</h4>
  <p class="line-height-body-4">Compares data for the selected fiscal year to the previous fiscal year. For the current fiscal year, we compare the months for which we have data with the same months in the previous fiscal year. To select a year, click or hover over a bar in the graph. Your selection changes the content displayed in the table.</p>
  <table v-if="comparisonTable" class="usa-table usa-table--borderless width-full margin-top-4">
    <thead>
      <tr>
        <th scope="col">{{ selectedBreakout }}</th>
        <th scope="col" class="text-right">{{ comparisonTable.period1Label }}</th>
        <th scope="col" class="text-right">{{ comparisonTable.period2Label }}</th>
        <th scope="col" class="text-right">% Change</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in comparisonTable.rows" :key="row.label">
        <td>{{ row.label }}</td>
        <td class="text-right">{{ formatAmount(row.period1) }}</td>
        <td class="text-right">{{ formatAmount(row.period2) }}</td>
        <td class="text-right">{{ formatPct(row.pctChange) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="text-bold">
        <td>{{ comparisonTable.summary.source }}</td>
        <td class="text-right">{{ formatAmount(comparisonTable.summary.period1) }}</td>
        <td class="text-right">{{ formatAmount(comparisonTable.summary.period2) }}</td>
        <td class="text-right">{{ formatPct(comparisonTable.summary.pctChange) }}</td>
      </tr>
    </tfoot>
  </table>
</template>
