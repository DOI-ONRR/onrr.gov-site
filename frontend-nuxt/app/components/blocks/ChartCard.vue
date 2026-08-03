<!--
  ChartCard — renders a `chart_cards` page block as a Highcharts chart and/or table.

  SCOPE (test template): only the `collection` data source is implemented, per the
  current effort. `static` and `endpoint` sources render an informational notice
  instead of a chart.

  DATA MODEL (collection source): the schema has no dedicated "breakout" field on
  chart_cards, and each `chart_series` carries a `data_field`, so we resolve it as:

    X axis      = distinct values of `group_by_field`
    aggregate   = `aggregate_function` over a measure field, via Directus's REST
                  aggregation API on `source_collection`, filtered by `filter`
    series      = one per `chart_series.data_field` (the measure it aggregates);
                  `aggregate_field` is the fallback measure when no series define one

  Optionally, if `group_by_field` names TWO comma-separated fields, we treat the
  second as a value-breakout: X = field[0] values, one series per distinct field[1]
  value, styled/labelled by the matching `chart_series` (matched on name, then
  data_field). This covers long-format collections like `revenue` (period, commodity,
  amount) where each commodity should become its own series.

  `highcharts_config` (JSON) is deep-merged over the built options as an escape hatch.
-->
<script setup>
const props = defineProps({
  block: { type: Object, required: true },
})

const { apiUrl } = useRuntimeConfig().public
const { resolveImages } = useCmsContent()
const card = computed(() => props.block)

// USWDS grid width for the card container (1–12; `grid-col-12` = full width).
const gridColumns = computed(() => {
  const n = parseInt(card.value.grid_columns, 10)
  return Number.isFinite(n) ? Math.min(12, Math.max(1, n)) : 12
})

// Reserve the chart's vertical space before Highcharts mounts (client-side), so the
// container doesn't collapse and shift the layout. Mirrors the `height` field passed
// to Highcharts; falls back to Highcharts' own default (400px) when height is unset.
const chartMinHeight = computed(() => `${card.value.height || 400}px`)

const isCollection = computed(() => (card.value.data_source_type || 'collection') === 'collection')
const isEndpoint = computed(() => card.value.data_source_type === 'endpoint')
const isSupported = computed(() => isCollection.value || isEndpoint.value)

// Endpoint URL: an absolute URL passes through; a relative path resolves against
// the CMS API base (so `/charts/disbursement/summary` → `${apiUrl}/charts/...`).
const endpointUrl = computed(() => {
  const u = card.value.endpoint_url
  if (!u) return null
  return /^https?:\/\//i.test(u) ? u : `${apiUrl}${u.startsWith('/') ? '' : '/'}${u}`
})

// --- series (visible, sorted) -------------------------------------------------
const seriesDefs = computed(() =>
  (card.value.series || [])
    .filter((s) => s && s.visible !== false)
    .slice()
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
)

// --- aggregation parameters ---------------------------------------------------
const fn = computed(() => card.value.aggregate_function || 'sum')

const groupByFields = computed(() =>
  String(card.value.group_by_field || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
)

// Measure fields the aggregate should compute. Prefer per-series data_field(s);
// fall back to the card's aggregate_field; for count with neither, use '*'.
const measureFields = computed(() => {
  const fromSeries = [...new Set(seriesDefs.value.map((s) => s.data_field).filter(Boolean))]
  if (fromSeries.length) return fromSeries
  if (card.value.aggregate_field) return [card.value.aggregate_field]
  return fn.value === 'count' ? ['*'] : []
})

// Endpoint series measures: each series reads this property straight off the row.
const seriesMeasures = computed(() =>
  [...new Set(seriesDefs.value.map((s) => s.data_field).filter(Boolean))]
)

const isPivot = computed(() => groupByFields.value.length >= 2)

const canQuery = computed(() => {
  if (isCollection.value) {
    return (
      !!card.value.source_collection &&
      groupByFields.value.length > 0 &&
      measureFields.value.length > 0
    )
  }
  if (isEndpoint.value) {
    return !!endpointUrl.value && !!card.value.x_axis_field && seriesMeasures.value.length > 0
  }
  return false
})

// --- fetch aggregated rows from Directus REST ---------------------------------
const { data: rows, error, pending } = await useAsyncData(
  `chart-card-${card.value.id}`,
  async () => {
    if (!canQuery.value) return []
    if (isEndpoint.value) {
      // Endpoints return either a bare array or a Directus-style `{ data: [...] }`.
      const res = await $fetch(endpointUrl.value)
      return Array.isArray(res) ? res : res?.data ?? []
    }
    const query = {
      aggregate: JSON.stringify({ [fn.value]: measureFields.value }),
      groupBy: JSON.stringify(groupByFields.value),
      sort: groupByFields.value[0],
      limit: -1,
    }
    if (card.value.filter) query.filter = JSON.stringify(card.value.filter)
    const res = await $fetch(`${apiUrl}/items/${card.value.source_collection}`, { query })
    return res?.data ?? []
  }
)

// Read an aggregate value out of a Directus aggregate row. Field aggregates nest
// under the function name (`{ sum: { amount: n } }`); count of `*` comes back as a
// scalar (`{ count: n }`).
function aggValue(row, measure) {
  const bucket = row?.[fn.value]
  const raw = bucket != null && typeof bucket === 'object' ? bucket[measure] ?? bucket['*'] : bucket
  const num = Number(raw)
  return Number.isFinite(num) ? num : 0
}

function distinct(values) {
  return [...new Set(values)]
}

// --- transform rows → { categories, series } ---------------------------------

// Style/label lookup for a series identity (breakout value or measure field).
function matchDef(identity) {
  return (
    seriesDefs.value.find((s) => s.name === identity) ||
    seriesDefs.value.find((s) => s.data_field === identity) ||
    null
  )
}

function buildSeries(identity, points) {
  const def = matchDef(identity)
  const type = def?.type && def.type !== 'inherit' ? def.type : card.value.chart_type || 'bar'
  const fallbackName = identity === '*' ? card.value.title || 'Count' : identity
  return {
    name: def?.name || fallbackName,
    data: points,
    type,
    color: def?.color || undefined,
    yAxis: def?.y_axis === 'secondary' ? 1 : 0,
    stack: def?.stack_group || undefined,
    dashStyle: def?.dash_style || undefined,
    marker: def?.marker_enabled != null ? { enabled: def.marker_enabled } : undefined,
    _format: def?.value_format,
    _prefix: def?.prefix,
    _suffix: def?.suffix,
  }
}

// Format an x-axis category label via the optional `x_axis_format` (same vocab as
// takeaway formats, e.g. `month_year`). Unset → the raw value, unchanged. The raw
// value is kept for row lookups; only the displayed label is formatted.
function formatCategory(value) {
  return card.value.x_axis_format ? formatVar(value, card.value.x_axis_format) : value
}

// Collection source: Directus aggregate rows (values nested under the function name).
function collectionChartData(data) {
  const [xField, breakoutField] = groupByFields.value
  const rawCategories = distinct(data.map((r) => r[xField]))
  const categories = rawCategories.map(formatCategory)

  if (isPivot.value) {
    // X = xField, one series per distinct breakoutField value.
    const measure = measureFields.value[0]
    const breakouts = distinct(data.map((r) => r[breakoutField]))
    const cell = {}
    for (const r of data) cell[`${r[xField]}||${r[breakoutField]}`] = aggValue(r, measure)
    return {
      categories,
      series: breakouts.map((bo) => buildSeries(bo, rawCategories.map((c) => cell[`${c}||${bo}`] ?? 0))),
    }
  }

  // Single group field: one series per measure field.
  const byX = {}
  for (const r of data) byX[r[xField]] = r
  return {
    categories,
    series: measureFields.value.map((measure) =>
      buildSeries(measure, rawCategories.map((c) => aggValue(byX[c], measure)))
    ),
  }
}

// Endpoint source: flat rows keyed by `x_axis_field`; each series reads its
// `data_field` straight off the row (one row per category).
function endpointChartData(data) {
  const key = card.value.x_axis_field
  const rawCategories = distinct(data.map((r) => r[key]))
  const byX = {}
  for (const r of data) byX[r[key]] = r
  return {
    categories: rawCategories.map(formatCategory),
    series: seriesMeasures.value.map((measure) =>
      buildSeries(
        measure,
        rawCategories.map((c) => {
          const v = Number(byX[c]?.[measure])
          return Number.isFinite(v) ? v : 0
        })
      )
    ),
  }
}

const chartData = computed(() => {
  const data = rows.value || []
  if (!data.length) return { categories: [], series: [] }
  return isEndpoint.value ? endpointChartData(data) : collectionChartData(data)
})

// --- value formatting ---------------------------------------------------------
function formatValue(val, series) {
  if (val == null) return '—'
  const fmt = series?._format
  const prefix = series?._prefix || (fmt === 'currency' ? '$' : '')
  const suffix = series?._suffix || (fmt === 'percent' ? '%' : '')
  const n = Number(val)
  if (!Number.isFinite(n)) return String(val)
  const body = fmt === 'currency'
    ? n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return `${prefix}${body}${suffix}`
}

// --- Highcharts options -------------------------------------------------------
const legendPos = computed(() => {
  const p = card.value.legend_position || 'bottom'
  if (p === 'top') return { align: 'center', verticalAlign: 'top', layout: 'horizontal' }
  if (p === 'left') return { align: 'left', verticalAlign: 'middle', layout: 'vertical' }
  if (p === 'right') return { align: 'right', verticalAlign: 'middle', layout: 'vertical' }
  return { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' }
})

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

// Deep-merge source over target (arrays replaced, not concatenated).
function deepMerge(target, source) {
  if (!isPlainObject(source)) return source
  const out = isPlainObject(target) ? { ...target } : {}
  for (const key of Object.keys(source)) {
    out[key] = isPlainObject(source[key]) ? deepMerge(out[key], source[key]) : source[key]
  }
  return out
}

const chartOptions = computed(() => {
  const { categories, series } = chartData.value
  const stacking = card.value.stacking && card.value.stacking !== 'none' ? card.value.stacking : undefined

  // series name → its value formatting, so the tooltip can format each point with
  // that series' configured format (e.g. currency, 0 decimals).
  const seriesFmt = Object.fromEntries(
    series.map((s) => [s.name, { _format: s._format, _prefix: s._prefix, _suffix: s._suffix }])
  )

  // Build `chart` without ever setting a key to `undefined`: Highcharts' merge
  // treats an explicit `undefined` as a value and clobbers its own defaults (e.g.
  // `zooming: undefined` wipes the default zooming object → crash in setZoomOptions).
  const chart = {
    type: card.value.chart_type || 'bar',
    height: card.value.height || null,
  }
  if (card.value.enable_zoom) chart.zooming = { type: 'xy' }

  // Only set tickInterval when a positive integer is configured; otherwise leave it
  // off so Highcharts auto-spaces ticks (never set it to null/undefined — that
  // clobbers the default, same as the zooming case above).
  const xAxis = {
    categories,
    title: { text: card.value.x_axis_label || null },
    lineColor: "#dfe1e2", tickColor: "#dfe1e2",
    labels: { style: { color: "#565c65", fontSize: "11px" } }
  }
  const tickInterval = parseInt(card.value.tick_interval, 10)
  if (Number.isFinite(tickInterval) && tickInterval > 0) xAxis.tickInterval = tickInterval

  // Primary value axis (rendered horizontally on a bar chart). Only set
  // tickInterval when a positive number is configured, so Highcharts auto-spaces
  // otherwise (never null/undefined — that clobbers the default).
  const yAxisPrimary = {
    title: { text: card.value.y_axis_label || null },
    min: card.value.y_axis_min ?? null,
    max: card.value.y_axis_max ?? null,
    gridLineColor: "#eef0f1",
    labels: { formatter() { return formatVar(this.value, 'currency_compact'); }, style: { color: "#565c65", fontSize: "11px" } }
  }
  const yTick = Number(card.value.y_tick_interval)
  if (Number.isFinite(yTick) && yTick > 0) yAxisPrimary.tickInterval = yTick

  const options = {
    chart,
    title: { text: null },
    credits: { enabled: false },
    xAxis,
    yAxis: [
      yAxisPrimary,
      {
        title: { text: card.value.y_axis_secondary_label || null },
        opposite: true,
      },
    ],
    legend: { enabled: card.value.show_legend !== false, ...legendPos.value },
    tooltip: {
      enabled: card.value.show_tooltip !== false,
      // Bold category header (x label); each line "SeriesName: value" formatted with
      // the series' own value_format (currency → dollar sign, 0 decimals).
      headerFormat: '<b>{point.key}</b><br/>',
      pointFormatter() {
        return `${this.series.name}: ${formatValue(this.y, seriesFmt[this.series.name])}`
      },
    },
    plotOptions: {
      series: {
        stacking,
        dataLabels: { enabled: card.value.show_data_labels === true },
      },
    },
    exporting: { enabled: card.value.enable_export === true },
    series: series.map(({ _format, _prefix, _suffix, ...s }) => s),
  }

  // Only set colors when a palette exists — never `undefined` (see note above).
  if (Array.isArray(card.value.color_palette) && card.value.color_palette.length) {
    options.colors = card.value.color_palette
  }

  // Responsive Y ticks: a fixed tickInterval overrides Highcharts' pixel-based auto
  // calc, so on small screens the value-axis labels don't thin out. Below 600px,
  // relax the Y (value) axis back to auto ticks; Highcharts restores the fixed
  // interval above the breakpoint.
  if (Number.isFinite(yTick) && yTick > 0) {
    options.responsive = {
      rules: [{ condition: { maxWidth: 600 }, chartOptions: { yAxis: [{ tickInterval: null }] } }]
    }
  }

  return isPlainObject(card.value.highcharts_config)
    ? deepMerge(options, card.value.highcharts_config)
    : options
})

// --- render mode --------------------------------------------------------------
const renderMode = computed(() => card.value.render_mode || 'chart')
const showChart = computed(() => renderMode.value !== 'table')
const showTable = computed(() => renderMode.value !== 'chart')
const hasData = computed(() => chartData.value.series.length > 0 && chartData.value.categories.length > 0)

// --- takeaway interpolation ---------------------------------------------------
// `takeaway` is a template string with `{token}` placeholders. Each token is
// defined in `takeaway_variables` (a JSON repeater: { token, field, aggregate,
// format }) and resolved against the fetched rows. Runs during SSR (rows come
// from useAsyncData), so the sentence renders server-side too.

function fmtDate(value, opts) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  // UTC so a date-only value like 2025-12-01 isn't shifted a day by local offset.
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
}

function formatVar(value, format) {
  if (value == null) return ''
  const n = Number(value)
  switch (format) {
    case 'currency': return Number.isFinite(n) ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(value)
    case 'currency_compact': return Number.isFinite(n) ? '$' + n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 }) : String(value)
    case 'percent': return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%' : String(value)
    case 'number': return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(value)
    case 'month_year': return fmtDate(value, { month: 'short', year: 'numeric' })
    case 'date': return fmtDate(value, { year: 'numeric', month: 'short', day: 'numeric' })
    default: return String(value)
  }
}

function aggregateVar(data, v) {
  if (v.aggregate === 'count') return data.length
  if (v.aggregate === 'first') return data[0]?.[v.field]
  if (v.aggregate === 'last') return data[data.length - 1]?.[v.field]
  // second-to-last row's value (e.g. previous year)
  if (v.aggregate === 'previous') return data[data.length - 2]?.[v.field]
  // change between the last and previous rows: signed (`delta`), magnitude
  // (`abs_delta`), or a direction word (`direction` → up/down/unchanged).
  if (v.aggregate === 'delta' || v.aggregate === 'abs_delta' || v.aggregate === 'direction') {
    const last = Number(data[data.length - 1]?.[v.field])
    const prev = Number(data[data.length - 2]?.[v.field])
    if (!Number.isFinite(last) || !Number.isFinite(prev)) return null
    if (v.aggregate === 'direction') return last > prev ? 'up' : last < prev ? 'down' : 'unchanged'
    return v.aggregate === 'abs_delta' ? Math.abs(last - prev) : last - prev
  }
  const nums = data.map((r) => Number(r[v.field])).filter(Number.isFinite)
  if (!nums.length) return null
  switch (v.aggregate) {
    case 'sum': return nums.reduce((a, b) => a + b, 0)
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length
    case 'min': return Math.min(...nums)
    case 'max': return Math.max(...nums)
    default: return null
  }
}

const takeawayVars = computed(() => {
  const map = {}
  const data = rows.value || []
  for (const v of card.value.takeaway_variables || []) {
    if (!v?.token) continue
    map[v.token] = formatVar(aggregateVar(data, v), v.format)
  }
  return map
})

// Interpolate `{token}` placeholders; leave unknown tokens literal so typos show.
const renderedTakeaway = computed(() => {
  const t = card.value.takeaway
  if (!t) return ''
  const vars = takeawayVars.value
  return t.replace(/{([\w-]+)}/g, (m, tok) => (tok in vars ? vars[tok] : m))
})

const hasTakeawayTokens = computed(() => /{[\w-]+}/.test(card.value.takeaway || ''))
// Hide when tokens can't resolve (no data) so we never render a raw `{token}`.
const showTakeaway = computed(
  () => !!card.value.takeaway && (!hasTakeawayTokens.value || hasData.value)
)

// --- table rows ---------------------------------------------------------------
const tableModel = computed(() => {
  const { categories, series } = chartData.value
  const includeCategory = card.value.table_include_category !== false
  const rowsOut = categories.map((cat, i) => ({
    category: cat,
    values: series.map((s) => ({ value: s.data[i], series: s })),
  }))
  let totals = null
  if (card.value.table_show_totals) {
    totals = series.map((s) => ({
      value: s.data.reduce((sum, v) => sum + (Number(v) || 0), 0),
      series: s,
    }))
  }
  return { includeCategory, columns: series, rows: rowsOut, totals }
})

// --- Highcharts (client only) -------------------------------------------------
const chartEl = ref(null)
let Highcharts = null
let chartInstance = null

async function buildChart() {
  if (!chartEl.value || !showChart.value || !hasData.value) return
  if (!Highcharts) {
    Highcharts = (await import('highcharts')).default
    if (card.value.enable_export) {
      try {
        await import('highcharts/modules/exporting')
      } catch (e) {
        // Exporting module unavailable — chart still renders without the menu.
      }
    }
  }
  chartInstance = Highcharts.chart(chartEl.value, chartOptions.value)
}

onMounted(buildChart)
watch(chartOptions, () => {
  if (chartInstance) chartInstance.update(chartOptions.value, true, true)
  else buildChart()
})
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<template>
  <section class="chart-card" :class="`grid-col-${gridColumns}`">
    <h3 v-if="card.title" class="margin-bottom-1 margin-top-0 font-heading-md">{{ card.title }}</h3>
    <p v-if="showTakeaway" class="chart-card__takeaway">
      {{ renderedTakeaway }}
    </p>

    <!-- Unsupported data source (static is not implemented in this template) -->
    <div v-if="!isSupported" class="usa-alert usa-alert--info usa-alert--slim">
      <div class="usa-alert__body">
        <p class="usa-alert__text">
          This template renders the <strong>collection</strong> and <strong>endpoint</strong>
          data sources. Source type <strong>{{ card.data_source_type }}</strong> is not yet
          implemented.
        </p>
      </div>
    </div>

    <template v-else>
      <div v-if="error" class="usa-alert usa-alert--error usa-alert--slim">
        <div class="usa-alert__body">
          <p class="usa-alert__text">Failed to load chart data: {{ error.message }}</p>
        </div>
      </div>
      <div v-else-if="!canQuery" class="usa-alert usa-alert--warning usa-alert--slim">
        <div class="usa-alert__body">
          <p v-if="isEndpoint" class="usa-alert__text">
            Incomplete configuration — needs an <code>endpoint_url</code>, an
            <code>x_axis_field</code>, and at least one series with a <code>data_field</code>.
          </p>
          <p v-else class="usa-alert__text">
            Incomplete configuration — needs a source collection, a group-by field, and a
            measure (series <code>data_field</code> or card <code>aggregate_field</code>).
          </p>
        </div>
      </div>
      <p v-else-if="pending" class="text-italic">Loading chart…</p>
      <div v-else-if="!hasData" class="usa-alert usa-alert--info usa-alert--slim">
        <div class="usa-alert__body">
          <p class="usa-alert__text">The query returned no rows to chart.</p>
        </div>
      </div>

      <template v-else>
        <div v-show="showChart" ref="chartEl" class="chart-card__chart" :style="{ minHeight: chartMinHeight }"></div>

        <table
          v-if="showTable"
          class="usa-table usa-table--borderless width-full margin-top-2"
        >
          <thead>
            <tr>
              <th v-if="tableModel.includeCategory" scope="col">
                {{ card.x_axis_label || 'Category' }}
              </th>
              <th v-for="col in tableModel.columns" :key="col.name" scope="col" class="text-right">
                {{ col.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableModel.rows" :key="row.category">
              <th v-if="tableModel.includeCategory" scope="row">{{ row.category }}</th>
              <td v-for="(cell, i) in row.values" :key="i" class="text-right">
                {{ formatValue(cell.value, cell.series) }}
              </td>
            </tr>
          </tbody>
          <tfoot v-if="tableModel.totals">
            <tr class="text-bold">
              <th v-if="tableModel.includeCategory" scope="row">Total</th>
              <td v-for="(cell, i) in tableModel.totals" :key="i" class="text-right">
                {{ formatValue(cell.value, cell.series) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </template>
    </template>

    <!-- `source` is a WYSIWYG field → render as HTML. A <div> (not <p>) so block
         markup from the editor is valid; a leading <p> is forced inline so it flows
         after the "Source:" label. -->
    <div v-if="card.source" class="chart-card__source font-body-2xs text-base margin-top-1">
      <span v-html="resolveImages(card.source)"></span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;
.chart-card {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #fff;
  @include u-padding(3);
}
.chart-card__takeaway {
  font-size: 0.95rem;
  max-width: 60ch;
  @include u-margin-top(0);
}
/* WYSIWYG `source` typically wraps in <p>; keep it inline after the label. */
.chart-card__source :deep(p) {
  display: inline;
  margin: 0;
  font-size: 0.8rem;
}
</style>
