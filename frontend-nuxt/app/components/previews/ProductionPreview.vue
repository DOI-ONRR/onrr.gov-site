<script setup>
/*
  ProductionPreview — the "Preview and filter" panel for the Monthly Production dataset.
  Unlike the disbursement preview there's no group-by dimension: rows are always grouped by
  product, the measure is production volume, and the units differ per product (bbl / mcf /
  tons) so there are no cross-product totals. A month range + land-type and product
  multi-selects drive a pivot table (Product | Month | one column per year) with a sticky
  product header, and publish the same pivot payload the reactive ChartCard renders.

  Aggregation is server-side via `/charts/production/pivot`.
*/
const { apiUrl } = useRuntimeConfig().public

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function monthLabel(d) {
  if (!d) return '—'
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(dt.getTime()) ? d : `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}
// Volumes are counts (bbl/mcf/tons), not currency — plain grouped integers.
function volume(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// --- filter options (loaded once) ---------------------------------------------
const { data: options } = await useAsyncData('prod-pivot-options', () =>
  $fetch(`${apiUrl}/charts/production/pivot/options`),
)
const landTypeOptions = computed(() => options.value?.landTypes || [])
const productOptions = computed(() => options.value?.products || [])

// --- filter state (multi-selects seeded to all-selected once options load) ----
const filters = reactive({ from: '', to: '', landTypes: [], products: [] })

const landAllSelected = computed(() => landTypeOptions.value.length > 0 && filters.landTypes.length === landTypeOptions.value.length)
const productAllSelected = computed(() => productOptions.value.length > 0 && filters.products.length === productOptions.value.length)
const landSummary = computed(() => {
  const n = filters.landTypes.length
  if (landAllSelected.value) return 'All land types'
  if (n === 0) return 'None selected'
  if (n === 1) return filters.landTypes[0]
  return `${n} selected`
})
const productSummary = computed(() => {
  const n = filters.products.length
  if (productAllSelected.value) return 'All products'
  if (n === 0) return 'None selected'
  if (n === 1) return filters.products[0]
  return `${n} selected`
})

const ready = ref(false)
watchEffect(() => {
  if (ready.value || !options.value) return
  filters.from = options.value.months?.[0] || ''
  filters.to = options.value.months?.[options.value.months.length - 1] || ''
  filters.landTypes = [...landTypeOptions.value]
  filters.products = [...productOptions.value]
  ready.value = true
})

// --- multi-select dropdowns ---------------------------------------------------
const landOpen = ref(false)
const productOpen = ref(false)
const landRef = ref(null)
const productRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleLand(v) { filters.landTypes = toggleIn(filters.landTypes, v) }
function toggleProduct(v) { filters.products = toggleIn(filters.products, v) }
function toggleAllLand() { filters.landTypes = landAllSelected.value ? [] : [...landTypeOptions.value] }
function toggleAllProducts() { filters.products = productAllSelected.value ? [] : [...productOptions.value] }
function handleClickOutside(e) {
  if (landRef.value && !landRef.value.contains(e.target)) landOpen.value = false
  if (productRef.value && !productRef.value.contains(e.target)) productOpen.value = false
}

// Sticky group headers pin beneath the sticky thead; measure the thead height for the
// --thead-h offset, and the widest product name for the reserved product-column width.
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

// Collapse/expand product groups.
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
const filterQuery = computed(() => {
  const query = {}
  const months = options.value?.months || []
  const fullFrom = months[0]
  const fullTo = months[months.length - 1]
  if (filters.from && filters.from !== fullFrom) query.from = String(filters.from).slice(0, 10)
  if (filters.to && filters.to !== fullTo) query.to = String(filters.to).slice(0, 10)
  const empty = !filters.landTypes.length || !filters.products.length
  if (!empty) {
    if (filters.landTypes.length < landTypeOptions.value.length) query.landTypes = filters.landTypes.join(',')
    if (filters.products.length < productOptions.value.length) query.products = filters.products.join(',')
  }
  return { query, empty }
})

// --- pivot data ---------------------------------------------------------------
const { data: pivot, pending } = await useAsyncData(
  'prod-pivot',
  async () => {
    if (!ready.value) return null
    const { query, empty } = filterQuery.value
    if (empty) return { groupBy: 'product', periodType: 'Monthly', years: [], groups: [], grandTotal: 0, recordCount: 0 }
    return $fetch(`${apiUrl}/charts/production/pivot`, { query })
  },
  { watch: [() => JSON.stringify(filters), ready], dedupe: 'cancel' },
)

const years = computed(() => pivot.value?.years || [])
const groups = computed(() => pivot.value?.groups || [])
watch(pivot, () => nextTick(measureDimCol))

// Publish a coherent pivot payload (all from the same response) for the reactive chart.
const chartPayload = computed(() => {
  const p = pivot.value
  if (!ready.value || !p) return null
  return {
    empty: !p.groups?.length,
    periodType: 'Monthly',
    layout: 'small-multiples', // one self-scaled panel per product (mixed units)
    valueFormat: 'number', // volumes (bbl/mcf/tons), not currency
    groupBy: 'product',
    groupByLabel: 'Product',
    years: p.years || [],
    groups: p.groups || [],
  }
})
const previewChart = inject('datasetPreviewChart', null)
if (previewChart) {
  watchEffect(() => { previewChart.value = chartPayload.value })
}

function clearFilters() {
  filters.from = options.value?.months?.[0] || ''
  filters.to = options.value?.months?.[options.value.months.length - 1] || ''
  filters.landTypes = [...landTypeOptions.value]
  filters.products = [...productOptions.value]
}

// Download the current pivot as CSV — Product | Month | one column per year, one row per
// product ("All months" subtotal) then a row per month. No cross-product total (units differ).
function downloadCsv() {
  const p = pivot.value
  if (!p?.groups?.length) return
  const head = ['Product', 'Month', ...p.years.map(String)]
  const rows = [head]
  for (const g of p.groups) {
    rows.push([g.key, 'All months', ...p.years.map((y) => g.byYear[y] ?? '')])
    for (const m of g.months) rows.push([g.key, m.monthName, ...p.years.map((y) => m.byYear[y] ?? '')])
  }
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'monthly-production.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

// Publish the current filtered selection to the dataset Download section's "Your filtered
// selection" card (DatasetView provides the ref; DatasetDownloads renders it). The href
// points at /charts/production/export — the raw records matching the preview's filters.
const datasetExport = inject('datasetPreviewExport', null)
if (datasetExport) {
  const exportHref = computed(() => {
    if (!filters.landTypes.length || !filters.products.length) return null // nothing selected
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
        <div class="field">
          <label class="usa-label margin-top-0" for="p-from">From</label>
          <select id="p-from" v-model="filters.from" class="usa-select">
            <option v-for="m in options?.months" :key="m" :value="m">{{ monthLabel(m) }}</option>
          </select>
        </div>

        <div class="field">
          <label class="usa-label margin-top-0" for="p-to">To</label>
          <select id="p-to" v-model="filters.to" class="usa-select">
            <option v-for="m in options?.months" :key="m" :value="m">{{ monthLabel(m) }}</option>
          </select>
        </div>

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
        <button type="button" class="usa-button usa-button--outline" :disabled="!groups.length" @click="toggleAll">
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
    <div ref="wrapRef" class="data-table-wrap pivot margin-top-2" :style="{ '--thead-h': `${theadH}px`, '--dim-w': dimW ? `${dimW}px` : undefined }">
      <table class="usa-table usa-table--borderless width-full margin-bottom-0 margin-top-0">
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col">Product</th>
            <th scope="col" class="month-col">Month</th>
            <th v-for="y in years" :key="y" scope="col" class="text-right">{{ y }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !groups.length">
            <td :colspan="years.length + 2">No records match the current filters.</td>
          </tr>
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
.field--wide { flex: 2 1 15rem; }
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

.pivot .group-head {
  padding: 0;
  background: mix($onrr-violet, #fff, 12%);
  position: sticky;
  top: calc(var(--thead-h, 2.5rem) - 1px);
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

// White/gray zebra on the month rows, keyed off the row's index within its group
// (`.row-alt`) so it stays consistent when a group is missing months.
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
</style>
