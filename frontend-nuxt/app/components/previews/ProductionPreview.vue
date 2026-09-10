<script setup>
/*
  ProductionPreview — the "Preview and filter" panel for every Production dataset. One
  component serves all three period grains; the grain comes from the dataset's export_filter
  (period.type), exactly like DisbursementPreview:

    Monthly       — From/To month, Land type, Product; grouped table (Product -> month
                    detail rows) with collapsible groups; chart = small multiples per product.
    Fiscal Year   — From/To fiscal year, Land type, State/Offshore Region, Product; flat table
    Calendar Year   (Product | one column per year); chart = small multiples of the TOP N
                    products by total volume.

  The annual grains add a State/Offshore Region filter and carry ~60 products (the annual
  data covers all minerals, not just oil/gas/coal), so the chart is capped to the top N.
  Units differ per product, so there are never cross-product totals.

  Aggregation is server-side via `/charts/production/pivot?period=…`.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
})
const { apiUrl } = useRuntimeConfig().public

// Grain from export_filter (e.g. { period: { type: { _eq: 'Fiscal Year' } } }).
const periodType = computed(() => {
  const t = props.dataset?.export_filter?.period?.type
  const val = typeof t === 'object' && t ? t._eq : t
  return val === 'Fiscal Year' ? 'Fiscal Year' : val === 'Calendar Year' ? 'Calendar Year' : 'Monthly'
})
const isMonthly = computed(() => periodType.value === 'Monthly')
const isAnnual = computed(() => !isMonthly.value)
const periodParam = computed(() =>
  periodType.value === 'Fiscal Year' ? 'fiscal-year' : periodType.value === 'Calendar Year' ? 'calendar-year' : 'monthly',
)
// Number of product panes on the small-multiples chart (monthly has 3 products, so it just
// shows them all; the annual grains have ~60, so this is a real top-N).
const CHART_TOP_N = 5

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function monthLabel(d) {
  if (!d) return '—'
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(dt.getTime()) ? d : `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}
const yearOptionLabel = (y) => (periodType.value === 'Fiscal Year' ? `FY ${y}` : String(y))
// Volumes are counts (bbl/mcf/ton/…), not currency — plain grouped integers.
function volume(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// --- filter options (loaded once for this grain) ------------------------------
const { data: options } = await useAsyncData(`prod-pivot-options-${periodParam.value}`, () =>
  $fetch(`${apiUrl}/charts/production/pivot/options`, { query: { period: periodParam.value } }),
)
const monthOptions = computed(() => options.value?.months || [])
const yearOptions = computed(() => options.value?.years || [])
const landTypeOptions = computed(() => options.value?.landTypes || [])
const regionOptions = computed(() => options.value?.regions || [])
const productOptions = computed(() => options.value?.products || [])

// --- filter state (seeded to full range / all-selected once options load) -----
const filters = reactive({ from: '', to: '', fromYear: '', toYear: '', landTypes: [], regions: [], products: [] })

const landAllSelected = computed(() => landTypeOptions.value.length > 0 && filters.landTypes.length === landTypeOptions.value.length)
const regionAllSelected = computed(() => regionOptions.value.length > 0 && filters.regions.length === regionOptions.value.length)
const productAllSelected = computed(() => productOptions.value.length > 0 && filters.products.length === productOptions.value.length)

const summarize = (all, arr, allLabel) => {
  if (all) return allLabel
  if (arr.length === 0) return 'None selected'
  if (arr.length === 1) return arr[0]
  return `${arr.length} selected`
}
const landSummary = computed(() => summarize(landAllSelected.value, filters.landTypes, 'All land types'))
const regionSummary = computed(() => summarize(regionAllSelected.value, filters.regions, 'All regions'))
const productSummary = computed(() => summarize(productAllSelected.value, filters.products, 'All products'))

function seedFilters() {
  if (isMonthly.value) {
    filters.from = monthOptions.value[0] || ''
    filters.to = monthOptions.value[monthOptions.value.length - 1] || ''
  } else {
    filters.fromYear = yearOptions.value[0] ?? ''
    filters.toYear = yearOptions.value[yearOptions.value.length - 1] ?? ''
  }
  filters.landTypes = [...landTypeOptions.value]
  filters.regions = [...regionOptions.value]
  filters.products = [...productOptions.value]
}

const ready = ref(false)
watchEffect(() => {
  if (ready.value || !options.value) return
  seedFilters()
  ready.value = true
})

// --- multi-select dropdowns ---------------------------------------------------
const landOpen = ref(false)
const regionOpen = ref(false)
const productOpen = ref(false)
const landRef = ref(null)
const regionRef = ref(null)
const productRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleLand(v) { filters.landTypes = toggleIn(filters.landTypes, v) }
function toggleRegion(v) { filters.regions = toggleIn(filters.regions, v) }
function toggleProduct(v) { filters.products = toggleIn(filters.products, v) }
function toggleAllLand() { filters.landTypes = landAllSelected.value ? [] : [...landTypeOptions.value] }
function toggleAllRegions() { filters.regions = regionAllSelected.value ? [] : [...regionOptions.value] }
function toggleAllProducts() { filters.products = productAllSelected.value ? [] : [...productOptions.value] }
function handleClickOutside(e) {
  if (landRef.value && !landRef.value.contains(e.target)) landOpen.value = false
  if (regionRef.value && !regionRef.value.contains(e.target)) regionOpen.value = false
  if (productRef.value && !productRef.value.contains(e.target)) productOpen.value = false
}

// Sticky group headers pin beneath the sticky thead; measure the thead height for the
// --thead-h offset, and (monthly only) the widest product name for the group-column width.
const wrapRef = ref(null)
const theadRef = ref(null)
const theadH = ref(0)
let theadObserver = null
const dimW = ref(0)
function measureDimCol() {
  const spans = wrapRef.value?.querySelectorAll('.group-name')
  if (!spans?.length) { dimW.value = 0; return }
  let max = 0
  for (const s of spans) max = Math.max(max, s.offsetWidth)
  dimW.value = max ? Math.ceil(max + 44) : 0
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (theadRef.value) {
    const measure = () => { theadH.value = theadRef.value?.offsetHeight || 0 }
    measure()
    theadObserver = new ResizeObserver(measure)
    theadObserver.observe(theadRef.value)
  }
  measureDimCol()
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  theadObserver?.disconnect()
})

// Collapse/expand product groups (monthly grouped table only).
const collapsed = ref(new Set())
function toggle(key) {
  const s = new Set(collapsed.value)
  s.has(key) ? s.delete(key) : s.add(key)
  collapsed.value = s
}
const allCollapsed = computed(() => groups.value.length > 0 && groups.value.every((g) => collapsed.value.has(g.key)))
function toggleAll() {
  collapsed.value = allCollapsed.value ? new Set() : new Set(groups.value.map((g) => g.key))
}

// --- filter query -------------------------------------------------------------
const selectionEmpty = computed(() =>
  !filters.landTypes.length || !filters.products.length || (isAnnual.value && !filters.regions.length),
)
const filterQuery = computed(() => {
  const query = { period: periodParam.value }
  if (isMonthly.value) {
    const m = monthOptions.value
    if (filters.from && filters.from !== m[0]) query.from = String(filters.from).slice(0, 10)
    if (filters.to && filters.to !== m[m.length - 1]) query.to = String(filters.to).slice(0, 10)
  } else {
    const ys = yearOptions.value
    if (filters.fromYear && filters.fromYear !== ys[0]) query.fromYear = String(filters.fromYear)
    if (filters.toYear && filters.toYear !== ys[ys.length - 1]) query.toYear = String(filters.toYear)
  }
  if (!selectionEmpty.value) {
    if (filters.landTypes.length < landTypeOptions.value.length) query.landTypes = filters.landTypes.join(',')
    if (isAnnual.value && filters.regions.length < regionOptions.value.length) query.regions = filters.regions.join(',')
    if (filters.products.length < productOptions.value.length) query.products = filters.products.join(',')
  }
  return { query, empty: selectionEmpty.value }
})

// --- pivot data ---------------------------------------------------------------
const { data: pivot, pending } = await useAsyncData(
  `prod-pivot-${periodParam.value}`,
  async () => {
    if (!ready.value) return null
    const { query, empty } = filterQuery.value
    if (empty) return { groupBy: 'product', periodType: periodType.value, years: [], groups: [], grandTotal: 0, recordCount: 0 }
    return $fetch(`${apiUrl}/charts/production/pivot`, { query })
  },
  { watch: [() => JSON.stringify(filters), ready], dedupe: 'cancel' },
)

const years = computed(() => pivot.value?.years || [])
const groups = computed(() => pivot.value?.groups || [])
watch(pivot, () => nextTick(measureDimCol))

// Publish a coherent pivot payload for the reactive chart — small multiples of the top N
// products by breadth of reporting (the endpoint returns groups ranked by record count, so
// the top N is unit-independent rather than dominated by large-magnitude units).
const chartPayload = computed(() => {
  const p = pivot.value
  if (!ready.value || !p) return null
  return {
    empty: !p.groups?.length,
    periodType: periodType.value,
    layout: 'small-multiples', // one self-scaled panel per product (mixed units)
    valueFormat: 'number',
    groupBy: 'product',
    groupByLabel: 'Product',
    years: p.years || [],
    groups: (p.groups || []).slice(0, CHART_TOP_N),
  }
})
const previewChart = inject('datasetPreviewChart', null)
if (previewChart) {
  watchEffect(() => { previewChart.value = chartPayload.value })
}

function clearFilters() {
  seedFilters()
}

// --- CSV: Product [| Month] | one column per year --------------------------------
function downloadCsv() {
  const p = pivot.value
  if (!p?.groups?.length) return
  const rows = []
  if (isMonthly.value) {
    rows.push(['Product', 'Month', ...p.years.map(String)])
    for (const g of p.groups) {
      rows.push([g.key, 'All months', ...p.years.map((y) => g.byYear[y] ?? '')])
      for (const m of g.months || []) rows.push([g.key, m.monthName, ...p.years.map((y) => m.byYear[y] ?? '')])
    }
  } else {
    rows.push(['Product', ...p.years.map(String)])
    for (const g of p.groups) rows.push([g.key, ...p.years.map((y) => g.byYear[y] ?? '')])
  }
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `${periodParam.value}-production.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Publish the current filtered selection to the dataset Download section's "Your filtered
// selection" card. The href points at /charts/production/export — the raw records.
const datasetExport = inject('datasetPreviewExport', null)
if (datasetExport) {
  const exportHref = computed(() => {
    if (selectionEmpty.value) return null
    const q = new URLSearchParams()
    const { query } = filterQuery.value
    for (const [k, v] of Object.entries(query)) q.set(k, v)
    const qs = q.toString()
    return `${apiUrl}/charts/production/export${qs ? `?${qs}` : ''}`
  })
  watchEffect(() => {
    const n = pivot.value?.recordCount ?? 0
    datasetExport.value = {
      ready: !!(pivot.value && groups.value.length) && !!exportHref.value,
      recordCount: n,
      note: `${n.toLocaleString()} records in current selection`,
      href: exportHref.value,
    }
  })
  onUnmounted(() => { datasetExport.value = null })
}
</script>

<template>
  <div class="margin-bottom-4">
    <!-- Filter bar -->
    <div class="filter-bar padding-2 margin-bottom-2">
      <div class="filter-bar__fields">
        <!-- Range: month selects (monthly) or year selects (annual) -->
        <template v-if="isMonthly">
          <div class="field">
            <label class="usa-label margin-top-0" for="p-from">From</label>
            <select id="p-from" v-model="filters.from" class="usa-select">
              <option v-for="m in monthOptions" :key="m" :value="m">{{ monthLabel(m) }}</option>
            </select>
          </div>
          <div class="field">
            <label class="usa-label margin-top-0" for="p-to">To</label>
            <select id="p-to" v-model="filters.to" class="usa-select">
              <option v-for="m in monthOptions" :key="m" :value="m">{{ monthLabel(m) }}</option>
            </select>
          </div>
        </template>
        <template v-else>
          <div class="field">
            <label class="usa-label margin-top-0" for="p-from-year">From year</label>
            <select id="p-from-year" v-model="filters.fromYear" class="usa-select">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ yearOptionLabel(y) }}</option>
            </select>
          </div>
          <div class="field">
            <label class="usa-label margin-top-0" for="p-to-year">To year</label>
            <select id="p-to-year" v-model="filters.toYear" class="usa-select">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ yearOptionLabel(y) }}</option>
            </select>
          </div>
        </template>

        <!-- Land type multi-select -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="p-land">Land type</label>
          <div ref="landRef" class="multi-select">
            <button id="p-land" type="button" class="usa-select multi-select__trigger" :aria-expanded="landOpen" @click="landOpen = !landOpen">
              <span :class="{ 'multi-select__placeholder': landAllSelected }">{{ landSummary }}</span>
            </button>
            <ul v-show="landOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li role="option" :aria-selected="landAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': landAllSelected }" @click="toggleAllLand">
                <input type="checkbox" :checked="landAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
              </li>
              <li v-for="v in landTypeOptions" :key="v" role="option" :aria-selected="filters.landTypes.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.landTypes.includes(v) }" @click="toggleLand(v)">
                <input type="checkbox" :checked="filters.landTypes.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
              </li>
            </ul>
          </div>
        </div>

        <!-- State / Offshore Region multi-select (annual grains only) -->
        <div v-if="isAnnual" class="field field--wide">
          <label class="usa-label margin-top-0" for="p-region">State/Offshore Region</label>
          <div ref="regionRef" class="multi-select">
            <button id="p-region" type="button" class="usa-select multi-select__trigger" :aria-expanded="regionOpen" @click="regionOpen = !regionOpen">
              <span :class="{ 'multi-select__placeholder': regionAllSelected }">{{ regionSummary }}</span>
            </button>
            <ul v-show="regionOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li role="option" :aria-selected="regionAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': regionAllSelected }" @click="toggleAllRegions">
                <input type="checkbox" :checked="regionAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
              </li>
              <li v-for="v in regionOptions" :key="v" role="option" :aria-selected="filters.regions.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.regions.includes(v) }" @click="toggleRegion(v)">
                <input type="checkbox" :checked="filters.regions.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Product multi-select -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="p-product">Product</label>
          <div ref="productRef" class="multi-select">
            <button id="p-product" type="button" class="usa-select multi-select__trigger" :aria-expanded="productOpen" @click="productOpen = !productOpen">
              <span :class="{ 'multi-select__placeholder': productAllSelected }">{{ productSummary }}</span>
            </button>
            <ul v-show="productOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li role="option" :aria-selected="productAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': productAllSelected }" @click="toggleAllProducts">
                <input type="checkbox" :checked="productAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
              </li>
              <li v-for="v in productOptions" :key="v" role="option" :aria-selected="filters.products.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.products.includes(v) }" @click="toggleProduct(v)">
                <input type="checkbox" :checked="filters.products.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
              </li>
            </ul>
          </div>
        </div>

        <div class="field field--action">
          <button type="button" class="usa-button usa-button--unstyled" @click="clearFilters">Clear all filters</button>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="table-toolbar__group">
        <button v-if="isMonthly" type="button" class="usa-button usa-button--outline" :disabled="!groups.length" @click="toggleAll">
          {{ allCollapsed ? 'Expand all' : 'Collapse all' }}
        </button>
      </div>
      <p class="results-line margin-0" aria-live="polite">
        <template v-if="pending">Loading…</template>
        <template v-else>
          <strong>{{ (pivot?.recordCount || 0).toLocaleString() }}</strong> records ·
          <strong>{{ groups.length }}</strong> product{{ groups.length === 1 ? '' : 's' }}
          <button
            type="button"
            class="usa-button usa-button--unstyled margin-left-2"
            :disabled="!groups.length"
            @click="downloadCsv"
          >Download CSV</button>
        </template>
      </p>
    </div>

    <!-- Pivot table -->
    <div
      ref="wrapRef"
      class="data-table-wrap pivot margin-top-2"
      :class="{ 'pivot--flat': isAnnual }"
      :style="{ '--thead-h': `${theadH}px`, '--dim-w': dimW ? `${dimW}px` : undefined }"
    >
      <table class="usa-table usa-table--compact width-full margin-bottom-0 margin-top-0">
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col">Product</th>
            <th v-if="isMonthly" scope="col" class="month-col">Month</th>
            <th v-for="y in years" :key="y" scope="col" class="text-right">{{ y }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !groups.length">
            <td :colspan="years.length + (isMonthly ? 2 : 1)">No records match the current filters.</td>
          </tr>

          <!-- Monthly: grouped (product band -> collapsible month rows -> subtotal) -->
          <template v-if="isMonthly">
            <template v-for="g in groups" :key="g.key">
              <tr class="group-row">
                <th scope="colgroup" :colspan="years.length + 2" class="group-head">
                  <button type="button" class="group-toggle" :aria-expanded="!collapsed.has(g.key)" @click="toggle(g.key)">
                    <span aria-hidden="true" class="caret">{{ collapsed.has(g.key) ? '▸' : '▾' }}</span>
                    <span class="group-name">{{ g.key }}</span>
                  </button>
                </th>
              </tr>
              <template v-if="!collapsed.has(g.key)">
                <tr v-for="(m, mi) in g.months" :key="`${g.key}-${m.month}`" class="month-row" :class="{ 'row-alt': mi % 2 === 1 }">
                  <td class="dim-cell"></td>
                  <td class="month-cell">{{ m.monthName }}</td>
                  <td v-for="y in years" :key="y" class="text-right">{{ m.byYear[y] ? volume(m.byYear[y]) : '—' }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td class="dim-cell"></td>
                  <th scope="row" class="month-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                  <td v-for="y in years" :key="y" class="text-right">{{ volume(g.byYear[y]) }}</td>
                </tr>
              </template>
            </template>
          </template>

          <!-- Annual: flat, one row per product, one column per year -->
          <template v-else>
            <tr v-for="(g, gi) in groups" :key="g.key" class="prod-row" :class="{ 'row-alt': gi % 2 === 1 }">
              <th scope="row" class="dim-cell prod-name">{{ g.key }}</th>
              <td v-for="y in years" :key="y" class="text-right">{{ g.byYear[y] ? volume(g.byYear[y]) : '—' }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.filter-bar { background: #f0f0f0; border-radius: 4px; }
.filter-bar__fields { display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; align-items: flex-end; }
.field {
  flex: 1 1 10rem;
  min-width: 9rem;
  .usa-label { font-size: 0.82rem; margin-bottom: 0.25rem; }
  .usa-select { margin-top: 0; }
}
.field--wide { flex: 2 1 14rem; }
.field--action { flex: 0 0 auto; display: flex; align-items: flex-end; }

.multi-select__option--all { font-weight: 700; border-bottom: 1px solid #dfe1e2; }

.table-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; margin-bottom: 0.5rem; }
.table-toolbar__group { display: flex; align-items: center; gap: 0.5rem; }
.table-toolbar__group .usa-button { margin: 0; }
.results-line { font-size: 0.95rem; }

.data-table-wrap {
  max-height: 36rem;
  overflow: auto;
  contain: layout;
  border: 1px solid #dfe1e2;

  thead th {
    position: sticky;
    top: 0;
    background: #f0f0f0;
    z-index: 2;
    white-space: nowrap;
  }
}

.dim-col,
.dim-cell { min-width: var(--dim-w, 12rem); }
.dim-col { white-space: nowrap; }
.month-col { width: 1%; white-space: nowrap; }

// --- Monthly grouped table ----------------------------------------------------
.pivot .group-head {
  padding: 0;
  background: mix($onrr-violet, #fff, 12%);
  position: sticky;
  top: calc(var(--thead-h, 2.5rem) - 2px);
  z-index: 1;
}
.group-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.4rem 0.75rem;
  background: none;
  border: 0;
  cursor: pointer;
  font-weight: 700;
  text-align: left;
}
.group-toggle .caret { color: $onrr-violet; font-size: 0.9rem; }

.pivot .month-row td { font-size: 0.95rem; }
.pivot .month-cell { white-space: nowrap; color: #565c65; }
// White/gray zebra on the month rows, keyed off the row index within its group.
.pivot .month-row > th,
.pivot .month-row > td { background: #fff; }
.pivot .month-row.row-alt > th,
.pivot .month-row.row-alt > td { background: #f5f5f5; }
// Group subtotal: white, bold, ruled off — matches the disbursement tables.
.pivot .subtotal-row > th,
.pivot .subtotal-row > td {
  background: #fff;
  font-weight: 700;
  border-top: 1px solid #dfe1e2;
}
.pivot .subtotal-label { font-weight: 700; }

// --- Annual flat table --------------------------------------------------------
// Product column sticks to the left as well, so the (often long) product name stays
// visible while scrolling across the many fiscal/calendar-year columns.
.pivot--flat .dim-col,
.pivot--flat .dim-cell {
  min-width: 15rem;
  max-width: 22rem;
  position: sticky;
  left: 0;
}
.pivot--flat .dim-col { z-index: 3; } // top-left corner, above the other sticky headers
.pivot--flat .prod-row .dim-cell {
  z-index: 1;
  text-align: left;
  font-weight: 400;
  white-space: normal; // let long mineral names wrap rather than widen the column
  color: #1b1b1b;
}
.pivot--flat .prod-row > th,
.pivot--flat .prod-row > td { background: #fff; }
.pivot--flat .prod-row.row-alt > th,
.pivot--flat .prod-row.row-alt > td { background: #f5f5f5; }

.text-right { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
