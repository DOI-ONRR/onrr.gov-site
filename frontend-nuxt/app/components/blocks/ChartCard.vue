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
const chartMinHeight = computed(() => {
  // Small multiples stack one ~150px pane per series, so the reserved height grows
  // with the number of products in the current selection.
  if (smallMultiples.value) {
    const n = Math.max(1, pivotPayload.value?.groups?.length || 1)
    return `${Math.max(card.value.height || 400, n * 182)}px`
  }
  return `${card.value.height || 400}px`
})

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

// Filter reactivity: when this card opts in (reacts_to_filters) AND a dataset preview on
// the page publishes its pivot result, the chart renders THAT data — a visual twin of the
// preview table, following its group-by dimension and filters — instead of its own
// endpoint fetch. The static chart_series config only supplies curated colors/labels for
// the recipient dimension; every other dimension's series are derived from the data.
const previewChart = inject('datasetPreviewChart', null)
const reactsToFilters = computed(() => !!card.value.reacts_to_filters && !!previewChart)
const pivotPayload = computed(() => (reactsToFilters.value ? previewChart.value : null))
const pivotDriven = computed(() => !!pivotPayload.value)
// Small-multiples layout: one self-scaled panel per series (product), stacked
// vertically. Opted into by the preview payload (`layout: 'small-multiples'`) —
// used for production, where products carry different units and so can't share a
// single value axis. Everything else keeps the default single-axis chart.
const smallMultiples = computed(() => pivotDriven.value && pivotPayload.value?.layout === 'small-multiples')

// High-cardinality dimensions (state, commodity) collapse to the top N groups by total
// plus an "Other" bucket — but only when the dimension is fully selected. A partial
// selection shows exactly the chosen groups.
const TOP_N = 8
const PIVOT_PALETTE = ['#005EA2', '#c05600', '#8168b3', '#008817', '#00a6d2', '#ab7000', '#71767a', '#e52207', '#5c1349', '#0f6460']
// Stable, curated colors for the fixed recipient groups (keyed by the group label the
// pivot returns) so a partial recipient selection never recolors the remaining groups.
// Other dimensions are dynamic, so they fall back to the positional palette.
const RECIPIENT_COLORS = {
  'State & local': '#005EA2',
  'U.S. Treasury': '#c05600',
  'Native American': '#8168b3',
  'Reclamation Fund': '#008817',
  'Land and Water Conservation Fund': '#00a6d2',
  'Historic Preservation Fund': '#ab7000',
  'Other funds': '#71767a',
}
const OTHER_COLOR = '#71767a'

const canQuery = computed(() => {
  // Pivot-driven charts get their data from the preview, not a query/series config.
  if (reactsToFilters.value) return true
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
    // Reactive charts get their data from the preview's published pivot, not a fetch.
    if (reactsToFilters.value) return []
    if (!canQuery.value) return []
    if (isEndpoint.value) {
      // Endpoints return either a bare array or a Directus-style `{ data: [...] }`.
      const res = await $fetch(endpointUrl.value)
      return Array.isArray(res) ? res : res?.data ?? []
    }
    const query = {
      aggregate: JSON.stringify({ [fn.value]: measureFields.value }),
      // groupBy is a comma-separated field list — Directus does NOT JSON-parse it,
      // so a JSON array like `["date"]` is read as a literal (missing) field name.
      groupBy: groupByFields.value.join(','),
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

// Format a "YYYY-MM" pivot period key as a "Mon YYYY" category label.
const PIVOT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function pivotPeriodLabel(period) {
  const [y, m] = period.split('-')
  return `${PIVOT_MONTHS[Number(m) - 1] || m} ${y}`
}

// Build one series for a pivot group. The pivot group key is the label. Recipient groups
// use the stable curated map; the "Other" bucket is grey; every other dimension value
// takes a positional palette color. No dependency on the chart_series config.
function buildPivotSeries(key, seriesData, groupBy, index) {
  const color =
    (groupBy === 'recipient' && RECIPIENT_COLORS[key]) ||
    (key === 'Other' ? OTHER_COLOR : PIVOT_PALETTE[index % PIVOT_PALETTE.length])
  return {
    name: key,
    data: seriesData,
    type: card.value.chart_type || 'column',
    color,
    stack: 'disbursements',
    _format: pivotValueFormat.value,
  }
}

// Value format for a pivot-driven chart: the preview declares it in the payload
// (currency for disbursement/revenue, number for production volumes). Default currency.
const pivotValueFormat = computed(() => pivotPayload.value?.valueFormat || 'currency')

// Transform the preview's pivot payload into a stacked series set — the chart as a visual
// twin of the table. Monthly: X = chronological months across all years present. Fiscal
// year: X = the fiscal years (annual, no month grain). One series per group (top-N +
// "Other" when the dimension is high-cardinality).
function pivotChartData(p) {
  if (!p || p.empty || !p.groups?.length) return { categories: [], series: [] }
  const isFy = p.periodType === 'Fiscal Year'

  let periods, categories, valAt
  if (isFy) {
    periods = (p.years || []).map(String)
    categories = periods
    valAt = (g, year) => Number(g.byYear?.[year]) || 0
  } else {
    const periodSet = new Set()
    for (const g of p.groups) for (const m of g.months || []) for (const y of Object.keys(m.byYear || {})) {
      periodSet.add(`${y}-${String(m.month).padStart(2, '0')}`)
    }
    periods = [...periodSet].sort()
    categories = periods.map(pivotPeriodLabel)
    valAt = (g, period) => {
      const [y, mm] = period.split('-')
      const m = (g.months || []).find((x) => x.month === Number(mm))
      return m ? Number(m.byYear[y]) || 0 : 0
    }
  }

  // Cap the number of series for readability: show up to TOP_N groups individually, and
  // once more than that would display (whether the dimension is fully or partially
  // selected), keep the top TOP_N by total and roll the rest into "Other".
  let displayGroups = p.groups
  if (p.groups.length > TOP_N) {
    const sorted = [...p.groups].sort((a, b) => (b.total || 0) - (a.total || 0))
    displayGroups = [...sorted.slice(0, TOP_N), { key: 'Other', _rest: sorted.slice(TOP_N) }]
  }

  return {
    categories,
    series: displayGroups.map((g, i) =>
      buildPivotSeries(
        g.key,
        periods.map((period) => (g._rest ? g._rest.reduce((s, rg) => s + valAt(rg, period), 0) : valAt(g, period))),
        p.groupBy,
        i
      )
    ),
  }
}

const chartData = computed(() => {
  if (pivotDriven.value) return pivotChartData(pivotPayload.value)
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
  // Format the magnitude, then put any minus sign *before* the prefix so a
  // negative currency reads "-$393" rather than "$-393".
  const body = Math.abs(n).toLocaleString('en-US', {
    maximumFractionDigits: fmt === 'currency' ? 0 : 2,
  })
  return `${n < 0 ? '-' : ''}${prefix}${body}${suffix}`
}

// --- Highcharts options -------------------------------------------------------
const legendPos = computed(() => {
  const p = card.value.legend_position || 'bottom'
  if (p === 'top') return { align: 'center', verticalAlign: 'top', layout: 'horizontal' }
  if (p === 'top-left') return { align: 'left', verticalAlign: 'top', layout: 'horizontal' }
  if (p === 'top-right') return { align: 'right', verticalAlign: 'top', layout: 'horizontal' }
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
    // Transparent canvas so the chart shows the card wrapper's background through
    // (default white, or `background_color`) — one uniform card color. The 'framed'
    // variant is the exception: a gray mat (.chart-card--framed) around a WHITE chart,
    // so its canvas is opaque white instead of transparent.
    backgroundColor: card.value.variant === 'framed' ? '#ffffff' : 'transparent',
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
    labels: { formatter() { return formatVar(this.value, pivotDriven.value ? `${pivotValueFormat.value}_compact` : 'currency_compact'); }, style: { color: "#565c65", fontSize: "11px" } }
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

  // Small multiples: replace the single value axis with one pane per series, each
  // auto-scaled to its own data (mixed units), stacked top-to-bottom. Each series
  // draws in its own pane; the shared x-axis renders once at the bottom. Legend is
  // redundant here (each pane is labelled by its axis title), so it's dropped.
  if (smallMultiples.value && series.length) {
    const n = series.length
    const gap = 14 // % vertical space between panes — room above each product label
    const paneH = (100 - gap * (n - 1)) / n
    options.yAxis = series.map((s, i) => ({
      title: {
        text: s.name,
        rotation: 0,
        align: 'high',
        textAlign: 'left',
        x: -10, // pull left ~spacingLeft so the label sits flush with the card title
        y: -18, // lift the label well off the plot so there's clear padding below it
        // Float the pane label over the plot: without this, Highcharts reserves a wide
        // left gutter for the horizontal title, pushing every pane far to the right.
        reserveSpace: false,
        style: { color: '#565c65', fontSize: '11px', fontWeight: '600' },
      },
      top: `${i * (paneH + gap)}%`,
      height: `${paneH}%`,
      offset: 0,
      min: 0,
      gridLineColor: '#eef0f1',
      labels: {
        formatter() { return formatVar(this.value, `${pivotValueFormat.value}_compact`) },
        style: { color: '#565c65', fontSize: '10px' },
      },
    }))
    options.series = options.series.map((s, i) => ({ ...s, yAxis: i }))
    options.legend = { enabled: false }
    // Taller per-pane allotment (and spacingTop for the first title) so the wider
    // inter-pane gaps don't eat into each pane's plot area.
    options.chart = { ...chart, height: Math.max(card.value.height || 400, n * 182), spacingTop: 28 }
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
// When pivot-driven, reflect the active group-by in the title (the CMS title names a fixed
// dimension, which is wrong once the chart follows the preview's group-by).
const displayTitle = computed(() => {
  const p = pivotPayload.value
  if (pivotDriven.value && p?.groupByLabel && card.value.title) {
    // Keep the card title's subject ("Disbursements" / "Production"), swap the grain +
    // dimension to match the live group-by.
    const subject = card.value.title.split(/\s+by\s+/i)[0]
    const grain = p.periodType === 'Fiscal Year' ? 'fiscal year' : 'month'
    return `${subject} by ${grain} and ${p.groupByLabel.toLowerCase()}`
  }
  return card.value.title
})

const renderMode = computed(() => card.value.render_mode || 'chart')
const showChart = computed(() => renderMode.value !== 'table')
const showTable = computed(() => renderMode.value !== 'chart')

// The data table is an accessible alternative to the chart, collapsed by default
// in a USWDS accordion (Vue-managed toggle, matching ExpansionPanelBlock).
const tableOpen = ref(false)
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
  // Minus sign before the "$" so negatives read "-$2B", not "$-2B".
  const sign = Number.isFinite(n) && n < 0 ? '-' : ''
  const abs = Math.abs(n)
  switch (format) {
    case 'currency': return Number.isFinite(n) ? sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(value)
    case 'currency_compact': return Number.isFinite(n) ? sign + '$' + abs.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 }) : String(value)
    case 'percent': return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%' : String(value)
    case 'number': return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(value)
    case 'number_compact': return Number.isFinite(n) ? sign + abs.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 }) : String(value)
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

  // Totals can run down each series column (a footer row) and/or across each row
  // (a "Total" column). Direction: column (default, back-compatible) | row | both.
  const wantTotals = !!card.value.table_show_totals
  const direction = card.value.table_totals_direction || 'column'
  const showColumnTotals = wantTotals && (direction === 'column' || direction === 'both')
  const showRowTotals = wantTotals && (direction === 'row' || direction === 'both')
  // Row/grand totals sum across series; a table's series are normally one measure,
  // so format those aggregates with the first series' format.
  const totalSeries = series[0] || null
  const sum = (nums) => nums.reduce((acc, v) => acc + (Number(v) || 0), 0)

  const rows = categories.map((cat, i) => {
    const values = series.map((s) => ({ value: s.data[i], series: s }))
    const row = { category: cat, values }
    if (showRowTotals) row.total = { value: sum(values.map((c) => c.value)), series: totalSeries }
    return row
  })

  let columnTotals = null
  let grandTotal = null
  if (showColumnTotals) {
    columnTotals = series.map((s) => ({ value: sum(s.data), series: s }))
    if (showRowTotals) grandTotal = { value: sum(columnTotals.map((c) => c.value)), series: totalSeries }
  }

  return { includeCategory, columns: series, rows, columnTotals, grandTotal, showColumnTotals, showRowTotals }
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

// The chart <div> lives behind v-if="hasData"; a filter that yields no rows unmounts it
// and orphans the Highcharts instance. Reconcile against the *current* element: update it
// in place only when the instance is still attached to the live chartEl, otherwise (re)build.
function syncChart() {
  if (!showChart.value || !hasData.value || !chartEl.value) return
  if (chartInstance && chartInstance.renderTo === chartEl.value) {
    chartInstance.update(chartOptions.value, true, true)
  } else {
    if (chartInstance) chartInstance.destroy()
    chartInstance = null
    buildChart()
  }
}

onMounted(syncChart)
// Rebuild/update when the options change AND when the container remounts (hasData flip).
watch([chartOptions, hasData], () => nextTick(syncChart))
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<template>
  <section
    class="chart-card"
    :class="[`grid-col-${gridColumns}`, { 'chart-card--framed': card.variant === 'framed' }]"
    :style="card.variant !== 'framed' && card.background_color ? { backgroundColor: card.background_color } : null"
  >
    <h3 v-if="displayTitle && !card.hide_title" class="margin-bottom-1 margin-top-0 font-heading-md">{{ displayTitle }}</h3>
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

        <div v-if="showTable" class="usa-accordion usa-accordion--bordered margin-top-2">
          <h4 class="usa-accordion__heading">
            <button
              type="button"
              class="usa-accordion__button"
              :aria-expanded="tableOpen"
              :aria-controls="`chart-table-${card.id}`"
              @click="tableOpen = !tableOpen"
            >
              View this chart as a table
            </button>
          </h4>
          <div
            :id="`chart-table-${card.id}`"
            class="usa-accordion__content"
            :hidden="!tableOpen"
          >
            <div class="data-table-wrap">
              <table class="usa-table width-full margin-top-0">
                <thead>
                  <tr>
                    <th v-if="tableModel.includeCategory" scope="col">
                      {{ card.table_category_label || card.x_axis_label || 'Category' }}
                    </th>
                    <th v-for="col in tableModel.columns" :key="col.name" scope="col" class="text-right">
                      {{ col.name }}
                    </th>
                    <th v-if="tableModel.showRowTotals" scope="col" class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in tableModel.rows" :key="row.category">
                    <th v-if="tableModel.includeCategory" scope="row">{{ row.category }}</th>
                    <td v-for="(cell, i) in row.values" :key="i" class="text-right">
                      {{ formatValue(cell.value, cell.series) }}
                    </td>
                    <td v-if="tableModel.showRowTotals" class="text-right text-bold">
                      {{ formatValue(row.total.value, row.total.series) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="tableModel.showColumnTotals">
                  <tr class="text-bold">
                    <th v-if="tableModel.includeCategory" scope="row">Total</th>
                    <td v-for="(cell, i) in tableModel.columnTotals" :key="i" class="text-right">
                      {{ formatValue(cell.value, cell.series) }}
                    </td>
                    <td v-if="tableModel.showRowTotals" class="text-right">
                      {{ formatValue(tableModel.grandTotal.value, tableModel.grandTotal.series) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
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
// 'framed' variant: a gray mat around a white chart (the mockup's .chart-wrap). The
// card fill is gray; the chart canvas is forced opaque white in the Highcharts config.
.chart-card--framed {
  background: #f9fafb;
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

.data-table-wrap {
  max-height: 20rem;
  overflow: auto;

  table {
    margin: 0;
  }

  thead th {
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 2;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background: #e6e6e6;
    }
  }

  td.amt,
  th.amt {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}
</style>
