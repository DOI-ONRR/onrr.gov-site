<script setup>
/*
  RevenuePreview — the "Preview and filter" panel for the Revenue dataset. One page, one
  component, all three period grains selectable in-page via the Period filter (Monthly /
  Calendar Year / Fiscal Year):

    Monthly       — grouped table (Commodity -> month detail rows) with collapsible groups.
    Calendar Year — flat table (Commodity | one column per year).
    Fiscal Year   —   "

  The range is always a From/To year (Monthly just adds month detail within it). Filters:
  Period, Year From/To, Land type, Revenue type, State/Offshore Region, Commodity. Revenue is
  single-unit (dollars), so groups rank by total revenue and the reactive chart is a normal
  multi-series currency chart (top N commodities) rather than production's small multiples.

  Aggregation is server-side via `/charts/revenue/pivot?period=…`.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
})
const { apiUrl } = useRuntimeConfig().public

// Base grain from export_filter just sets the Period default; the user switches in-page.
const basePeriodType = computed(() => {
  const t = props.dataset?.export_filter?.period?.type
  const val = typeof t === 'object' && t ? t._eq : t
  return val === 'Fiscal Year' ? 'Fiscal Year' : val === 'Calendar Year' ? 'Calendar Year' : 'Monthly'
})
const PERIOD_OPTIONS = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Calendar Year', label: 'Calendar year' },
  { value: 'Fiscal Year', label: 'Fiscal year' },
]

// URL query <-> filters (deep-linkable, two-way): read filter values from the query on load and
// reflect changes back into it. Param names match the pivot endpoint. Shared helpers +
// write-back sync live in the useQueryFilters composable (the standard for dataset previews).
const route = useRoute()

const selectedPeriod = ref(PERIOD_FROM_PARAM[queryStr(route.query.period)] || basePeriodType.value)
const periodType = computed(() => selectedPeriod.value)
const isMonthly = computed(() => periodType.value === 'Monthly')
const periodParam = computed(() =>
  periodType.value === 'Fiscal Year' ? 'fiscal-year' : periodType.value === 'Calendar Year' ? 'calendar-year' : 'monthly',
)
// Number of commodity series on the chart (top N by total revenue).
const CHART_TOP_N = 6

// Annual grains (Calendar/Fiscal Year) offer an optional secondary "Break out by" column,
// like yearly production: Commodity becomes a collapsible band with one sub-row per breakout
// value. Monthly already shows month detail, so the breakout is hidden there.
const isAnnual = computed(() => !isMonthly.value)
const BREAKOUT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'land_type', label: 'Land Type' },
  { value: 'state', label: 'State' },
  { value: 'county', label: 'County' },
  { value: 'revenue_type', label: 'Revenue Type' },
  { value: 'mineral_lease_type', label: 'Mineral Lease Type' },
  { value: 'product', label: 'Product' },
]
// Seed the breakout from the URL when it names a known option (applies on annual grains).
const breakout = ref(BREAKOUT_OPTIONS.some((o) => o.value && o.value === queryStr(route.query.breakout)) ? queryStr(route.query.breakout) : '')
const breakoutColLabel = computed(() => BREAKOUT_OPTIONS.find((o) => o.value === breakout.value)?.label || '')
const hasBreakout = computed(() => isAnnual.value && !!breakout.value)
// The table is grouped (collapsible band + detail rows) for monthly, or an annual grain with
// a breakout; otherwise it's a flat one-row-per-commodity table.
const grouped = computed(() => isMonthly.value || hasBreakout.value)

// Revenue is dollars.
function currency(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// --- filter options (re-fetched when the Period switches) ---------------------
const { data: options } = await useAsyncData(
  `rev-pivot-options-${periodParam.value}`,
  () => $fetch(`${apiUrl}/charts/revenue/pivot/options`, { query: { period: periodParam.value } }),
  { watch: [periodParam] },
)
const yearOptions = computed(() => options.value?.years || [])
const landTypeOptions = computed(() => options.value?.landTypes || [])
const revenueTypeOptions = computed(() => options.value?.revenueTypes || [])
const regionOptions = computed(() => options.value?.regions || [])
const productOptions = computed(() => options.value?.products || [])

// --- filter state (seeded to full range / all-selected once options load) -----
const filters = reactive({ fromYear: '', toYear: '', landTypes: [], revenueTypes: [], regions: [], products: [] })

const landAllSelected = computed(() => landTypeOptions.value.length > 0 && filters.landTypes.length === landTypeOptions.value.length)
const revenueAllSelected = computed(() => revenueTypeOptions.value.length > 0 && filters.revenueTypes.length === revenueTypeOptions.value.length)
const regionAllSelected = computed(() => regionOptions.value.length > 0 && filters.regions.length === regionOptions.value.length)
const productAllSelected = computed(() => productOptions.value.length > 0 && filters.products.length === productOptions.value.length)

const summarize = (all, arr, allLabel) => {
  if (all) return allLabel
  if (arr.length === 0) return 'None selected'
  if (arr.length === 1) return arr[0]
  return `${arr.length} selected`
}
const landSummary = computed(() => summarize(landAllSelected.value, filters.landTypes, 'All land types'))
const revenueSummary = computed(() => summarize(revenueAllSelected.value, filters.revenueTypes, 'All revenue types'))
const regionSummary = computed(() => summarize(regionAllSelected.value, filters.regions, 'All regions'))
const productSummary = computed(() => summarize(productAllSelected.value, filters.products, 'All commodities'))

function seedFilters() {
  filters.fromYear = yearOptions.value[0] ?? ''
  filters.toYear = yearOptions.value[yearOptions.value.length - 1] ?? ''
  filters.landTypes = [...landTypeOptions.value]
  filters.revenueTypes = [...revenueTypeOptions.value]
  filters.regions = [...regionOptions.value]
  filters.products = [...productOptions.value]
}

// Override the seeded defaults with any valid values from the URL query. Values are validated
// against the loaded option lists / year range; unknown params or all-invalid selections fall
// back to the default (so a stale/bad link degrades gracefully rather than showing nothing).
function applyQueryToFilters() {
  const q = route.query
  const yrs = yearOptions.value
  const fy = Number(queryStr(q.fromYear))
  if (q.fromYear != null && yrs.includes(fy)) filters.fromYear = fy
  const ty = Number(queryStr(q.toYear))
  if (q.toYear != null && yrs.includes(ty)) filters.toYear = ty
  const applyMulti = (param, optionList, target) => {
    const req = queryList(q[param])
    if (!req) return
    const sel = optionList.filter((o) => req.includes(o))
    if (sel.length) filters[target] = sel
  }
  applyMulti('landTypes', landTypeOptions.value, 'landTypes')
  applyMulti('revenueTypes', revenueTypeOptions.value, 'revenueTypes')
  applyMulti('regions', regionOptions.value, 'regions')
  applyMulti('products', productOptions.value, 'products')
}

const ready = ref(false)
watchEffect(() => {
  if (ready.value || !options.value) return
  seedFilters()
  applyQueryToFilters()
  ready.value = true
})

// Clamp the year range into the new list when the Period switches.
watch(yearOptions, (ys) => {
  if (!ys.length) return
  if (filters.fromYear && !ys.includes(filters.fromYear)) filters.fromYear = ys[0]
  if (filters.toYear && !ys.includes(filters.toYear)) filters.toYear = ys[ys.length - 1]
})

// --- multi-select dropdowns ---------------------------------------------------
const landOpen = ref(false)
const revenueOpen = ref(false)
const regionOpen = ref(false)
const productOpen = ref(false)
const landRef = ref(null)
const revenueRef = ref(null)
const regionRef = ref(null)
const productRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleLand(v) { filters.landTypes = toggleIn(filters.landTypes, v) }
function toggleRevenue(v) { filters.revenueTypes = toggleIn(filters.revenueTypes, v) }
function toggleRegion(v) { filters.regions = toggleIn(filters.regions, v) }
function toggleProduct(v) { filters.products = toggleIn(filters.products, v) }
function toggleAllLand() { filters.landTypes = landAllSelected.value ? [] : [...landTypeOptions.value] }
function toggleAllRevenue() { filters.revenueTypes = revenueAllSelected.value ? [] : [...revenueTypeOptions.value] }
function toggleAllRegions() { filters.regions = regionAllSelected.value ? [] : [...regionOptions.value] }
function toggleAllProducts() { filters.products = productAllSelected.value ? [] : [...productOptions.value] }
function handleClickOutside(e) {
  if (landRef.value && !landRef.value.contains(e.target)) landOpen.value = false
  if (revenueRef.value && !revenueRef.value.contains(e.target)) revenueOpen.value = false
  if (regionRef.value && !regionRef.value.contains(e.target)) regionOpen.value = false
  if (productRef.value && !productRef.value.contains(e.target)) productOpen.value = false
}

// Sticky headers + the widest commodity name for the group-column width.
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

// Collapse/expand commodity groups (monthly grouped table only).
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
  !filters.landTypes.length || !filters.revenueTypes.length || !filters.regions.length || !filters.products.length,
)
const filterQuery = computed(() => {
  const query = { period: periodParam.value }
  const ys = yearOptions.value
  if (filters.fromYear && filters.fromYear !== ys[0]) query.fromYear = String(filters.fromYear)
  if (filters.toYear && filters.toYear !== ys[ys.length - 1]) query.toYear = String(filters.toYear)
  if (!selectionEmpty.value) {
    if (filters.landTypes.length < landTypeOptions.value.length) query.landTypes = filters.landTypes.join(',')
    if (filters.revenueTypes.length < revenueTypeOptions.value.length) query.revenueTypes = filters.revenueTypes.join(',')
    if (filters.regions.length < regionOptions.value.length) query.regions = filters.regions.join(',')
    if (filters.products.length < productOptions.value.length) query.products = filters.products.join(',')
  }
  if (hasBreakout.value) query.breakout = breakout.value
  return { query, empty: selectionEmpty.value }
})

// Reflect the active filters into the URL once seeded (filterQuery already omits defaults, so a
// default view yields a clean URL). Same endpoint param names both directions.
useUrlFilterSync(() => filterQuery.value.query, ready, ['period', 'fromYear', 'toYear', 'landTypes', 'revenueTypes', 'regions', 'products', 'breakout'])

// --- pivot data ---------------------------------------------------------------
const { data: pivot, pending } = await useAsyncData(
  `rev-pivot-${periodParam.value}`,
  async () => {
    if (!ready.value) return null
    const { query, empty } = filterQuery.value
    if (empty) return { groupBy: 'product', periodType: periodType.value, years: [], groups: [], grandTotal: 0, recordCount: 0 }
    return $fetch(`${apiUrl}/charts/revenue/pivot`, { query })
  },
  { watch: [() => JSON.stringify(filters), ready, breakout, periodParam], dedupe: 'cancel' },
)

const years = computed(() => pivot.value?.years || [])
const groups = computed(() => pivot.value?.groups || [])
watch(pivot, () => nextTick(measureDimCol))

// --- sorting ------------------------------------------------------------------
// Client-side sort of the commodity groups (the pivot returns them all, unpaginated). The
// Commodity header sorts by name; each year header by that year's value. Default (sortKey
// null) keeps the endpoint's total-revenue-desc ranking with no active arrow. In grouped
// views (monthly, breakout) this reorders the commodity bands; their detail rows (months /
// breakout values) keep their natural order. The chart is unaffected — it ranks by total.
const sortKey = ref(null) // null | 'commodity' | <year:number>
const sortDir = ref('desc')
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'commodity' ? 'asc' : 'desc' // text A→Z, values high→low on first click
  }
}
const sortState = (key) => (sortKey.value === key ? sortDir.value : null) // 'asc' | 'desc' | null
const ariaSort = (key) => (sortKey.value === key ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none')
const sortIcon = (key) => {
  const s = sortState(key)
  return s === 'asc' ? 'arrow_drop_up' : s === 'desc' ? 'arrow_drop_down' : 'unfold_more'
}
const sortedGroups = computed(() => {
  const gs = groups.value
  if (!sortKey.value) return gs
  const dir = sortDir.value === 'asc' ? 1 : -1
  const key = sortKey.value
  const copy = [...gs]
  if (key === 'commodity') copy.sort((a, b) => dir * String(a.key).localeCompare(String(b.key)))
  else copy.sort((a, b) => dir * ((a.byYear[key] || 0) - (b.byYear[key] || 0)))
  return copy
})
// Drop a year sort that no longer exists after a Period switch (its column is gone).
watch(years, (ys) => {
  if (typeof sortKey.value === 'number' && !ys.includes(sortKey.value)) {
    sortKey.value = null
    sortDir.value = 'desc'
  }
})

// Publish a coherent pivot payload for the reactive chart — a multi-series currency chart of
// the top N commodities by total revenue (single unit, so no small multiples).
const chartPayload = computed(() => {
  const p = pivot.value
  if (!ready.value || !p) return null
  return {
    empty: !p.groups?.length,
    periodType: periodType.value,
    valueFormat: 'currency',
    groupBy: 'product',
    groupByLabel: 'Commodity',
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

// --- CSV: Commodity [| Month] | one column per year ---------------------------
function downloadCsv() {
  const p = pivot.value
  if (!p?.groups?.length) return
  const rows = []
  if (isMonthly.value) {
    rows.push(['Commodity', 'Month', ...p.years.map(String)])
    for (const g of p.groups) {
      rows.push([g.key, 'All months', ...p.years.map((y) => g.byYear[y] ?? '')])
      for (const m of g.months || []) rows.push([g.key, m.monthName, ...p.years.map((y) => m.byYear[y] ?? '')])
    }
  } else if (hasBreakout.value) {
    rows.push(['Commodity', breakoutColLabel.value, ...p.years.map(String)])
    for (const g of p.groups) {
      rows.push([g.key, 'All', ...p.years.map((y) => g.byYear[y] ?? '')])
      for (const row of g.rows || []) rows.push([g.key, row.key, ...p.years.map((y) => row.byYear[y] ?? '')])
    }
  } else {
    rows.push(['Commodity', ...p.years.map(String)])
    for (const g of p.groups) rows.push([g.key, ...p.years.map((y) => g.byYear[y] ?? '')])
  }
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `${periodParam.value}-revenue.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Publish the current filtered selection to the Download section's "filtered selection" card.
const datasetExport = inject('datasetPreviewExport', null)
if (datasetExport) {
  const exportHref = computed(() => {
    if (selectionEmpty.value) return null
    const q = new URLSearchParams()
    const { query } = filterQuery.value
    // The raw-records export has no breakout concept — it's the flat record set.
    for (const [k, v] of Object.entries(query)) if (k !== 'breakout') q.set(k, v)
    const qs = q.toString()
    return `${apiUrl}/charts/revenue/export${qs ? `?${qs}` : ''}`
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

// Publish the current period as the full-dataset export filter (Download section, card 1).
const datasetExportFilter = inject('datasetExportFilter', null)
if (datasetExportFilter) {
  watchEffect(() => { datasetExportFilter.value = { period: { type: { _eq: periodType.value } } } })
  onUnmounted(() => { datasetExportFilter.value = null })
}
</script>

<template>
  <div class="margin-bottom-4">
    <!-- Filter bar -->
    <div class="filter-bar padding-2 margin-bottom-2">
      <div class="filter-bar__fields">
        <!-- Period -->
        <div class="field">
          <label class="usa-label margin-top-0" for="r-period">Period</label>
          <select id="r-period" v-model="selectedPeriod" class="usa-select">
            <option v-for="o in PERIOD_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>

        <!-- Year range -->
        <div class="field">
          <label class="usa-label margin-top-0" for="r-from-year">From</label>
          <select id="r-from-year" v-model="filters.fromYear" class="usa-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="field">
          <label class="usa-label margin-top-0" for="r-to-year">To</label>
          <select id="r-to-year" v-model="filters.toYear" class="usa-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Land type -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="r-land">Land type</label>
          <div ref="landRef" class="multi-select">
            <button id="r-land" type="button" class="usa-select multi-select__trigger" :aria-expanded="landOpen" @click="landOpen = !landOpen">
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

        <!-- Revenue type -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="r-revtype">Revenue type</label>
          <div ref="revenueRef" class="multi-select">
            <button id="r-revtype" type="button" class="usa-select multi-select__trigger" :aria-expanded="revenueOpen" @click="revenueOpen = !revenueOpen">
              <span :class="{ 'multi-select__placeholder': revenueAllSelected }">{{ revenueSummary }}</span>
            </button>
            <ul v-show="revenueOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li role="option" :aria-selected="revenueAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': revenueAllSelected }" @click="toggleAllRevenue">
                <input type="checkbox" :checked="revenueAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
              </li>
              <li v-for="v in revenueTypeOptions" :key="v" role="option" :aria-selected="filters.revenueTypes.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.revenueTypes.includes(v) }" @click="toggleRevenue(v)">
                <input type="checkbox" :checked="filters.revenueTypes.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
              </li>
            </ul>
          </div>
        </div>

        <!-- State / Offshore Region -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="r-region">State/Offshore Region</label>
          <div ref="regionRef" class="multi-select">
            <button id="r-region" type="button" class="usa-select multi-select__trigger" :aria-expanded="regionOpen" @click="regionOpen = !regionOpen">
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

        <!-- Commodity -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="r-product">Commodity</label>
          <div ref="productRef" class="multi-select">
            <button id="r-product" type="button" class="usa-select multi-select__trigger" :aria-expanded="productOpen" @click="productOpen = !productOpen">
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

    <!-- Toolbar: breakout + collapse control (left), record count + CSV (right) -->
    <div class="table-toolbar" :class="{ 'table-toolbar--breakout': isAnnual }">
      <div class="table-toolbar__group">
        <!-- Break-out control (annual grains): adds a grouping column after Commodity -->
        <div v-if="isAnnual" class="breakout-control">
          <label class="usa-label margin-top-0" for="r-breakout">Break out by</label>
          <select id="r-breakout" v-model="breakout" class="usa-select breakout-select">
            <option v-for="o in BREAKOUT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>
        <button v-if="grouped" type="button" class="usa-button usa-button--outline" :disabled="!groups.length" @click="toggleAll">
          {{ allCollapsed ? 'Expand all' : 'Collapse all' }}
        </button>
      </div>
      <p class="results-line margin-0" aria-live="polite">
        <template v-if="pending">Loading…</template>
        <template v-else>
          <strong>{{ (pivot?.recordCount || 0).toLocaleString() }}</strong> records ·
          <strong>{{ groups.length }}</strong> commodit{{ groups.length === 1 ? 'y' : 'ies' }}
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
      :class="{ 'pivot--flat': isAnnual && !hasBreakout }"
      :style="{ '--thead-h': `${theadH}px`, '--dim-w': dimW ? `${dimW}px` : undefined }"
    >
      <table class="usa-table usa-table--compact width-full margin-bottom-0 margin-top-0">
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col padding-y-105" :aria-sort="ariaSort('commodity')">
              <button type="button" class="sort-btn" @click="setSort('commodity')">
                <span>Commodity</span>
                <svg class="usa-icon sort-icon" :class="{ 'sort-icon--active': sortState('commodity') }" aria-hidden="true" role="img">
                  <use :href="`/uswds/img/sprite.svg#${sortIcon('commodity')}`" />
                </svg>
              </button>
            </th>
            <th v-if="isMonthly" scope="col" class="month-col">Month</th>
            <th v-else-if="hasBreakout" scope="col" class="breakout-col">{{ breakoutColLabel }}</th>
            <th v-for="y in years" :key="y" scope="col" class="text-right" :aria-sort="ariaSort(y)">
              <button type="button" class="sort-btn sort-btn--right" @click="setSort(y)">
                <span>{{ y }}</span>
                <svg class="usa-icon sort-icon" :class="{ 'sort-icon--active': sortState(y) }" aria-hidden="true" role="img">
                  <use :href="`/uswds/img/sprite.svg#${sortIcon(y)}`" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !groups.length">
            <td :colspan="years.length + (grouped ? 2 : 1)">No records match the current filters.</td>
          </tr>

          <!-- Monthly: grouped by commodity -> collapsible month rows -> subtotal -->
          <template v-if="isMonthly">
            <template v-for="g in sortedGroups" :key="g.key">
              <tr class="group-row">
                <th scope="colgroup" :colspan="years.length + 2" class="group-head">
                  <button type="button" class="group-toggle" :aria-expanded="!collapsed.has(g.key)" @click="toggle(g.key)">
                    <span aria-hidden="true" class="caret">{{ collapsed.has(g.key) ? '▸' : '▾' }}</span>
                    <span class="group-name">{{ g.key }}</span>
                  </button>
                </th>
              </tr>
              <template v-if="!collapsed.has(g.key)">
                <tr v-for="(m, mi) in g.months" :key="`${g.key}-${m.month}`" class="detail-row" :class="{ 'row-alt': mi % 2 === 1 }">
                  <td class="dim-cell"></td>
                  <td class="breakout-cell">{{ m.monthName }}</td>
                  <td v-for="y in years" :key="y" class="text-right">{{ m.byYear[y] ? currency(m.byYear[y]) : '—' }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td class="dim-cell"></td>
                  <th scope="row" class="breakout-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                  <td v-for="y in years" :key="y" class="text-right">{{ currency(g.byYear[y]) }}</td>
                </tr>
              </template>
            </template>
          </template>

          <!-- Annual + breakout: grouped by commodity -> collapsible breakout rows -> subtotal -->
          <template v-else-if="hasBreakout">
            <template v-for="g in sortedGroups" :key="g.key">
              <tr class="group-row">
                <th scope="colgroup" :colspan="years.length + 2" class="group-head">
                  <button type="button" class="group-toggle" :aria-expanded="!collapsed.has(g.key)" @click="toggle(g.key)">
                    <span aria-hidden="true" class="caret">{{ collapsed.has(g.key) ? '▸' : '▾' }}</span>
                    <span class="group-name">{{ g.key }}</span>
                  </button>
                </th>
              </tr>
              <template v-if="!collapsed.has(g.key)">
                <tr v-for="(row, ri) in g.rows" :key="`${g.key}-${row.key}`" class="detail-row" :class="{ 'row-alt': ri % 2 === 1 }">
                  <td class="dim-cell"></td>
                  <td class="breakout-cell">{{ row.key }}</td>
                  <td v-for="y in years" :key="y" class="text-right">{{ row.byYear[y] ? currency(row.byYear[y]) : '—' }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td class="dim-cell"></td>
                  <th scope="row" class="breakout-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                  <td v-for="y in years" :key="y" class="text-right">{{ currency(g.byYear[y]) }}</td>
                </tr>
              </template>
            </template>
          </template>

          <!-- Annual (Calendar/Fiscal Year), no breakout: flat, one row per commodity -->
          <template v-else>
            <tr v-for="(g, gi) in sortedGroups" :key="g.key" class="prod-row" :class="{ 'row-alt': gi % 2 === 1 }">
              <th scope="row" class="dim-cell prod-name">{{ g.key }}</th>
              <td v-for="y in years" :key="y" class="text-right">{{ g.byYear[y] ? currency(g.byYear[y]) : '—' }}</td>
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
.field--wide { flex: 2 1 13rem; }
.field--action { flex: 0 0 auto; display: flex; align-items: flex-end; }

.multi-select__option--all { font-weight: 700; border-bottom: 1px solid #dfe1e2; }

// Break-out control (in the toolbar's left cluster): the "Break out by" label sits ABOVE the
// dropdown, but the dropdown itself stays vertically centered on the row with the Collapse
// button and results line — the label is taken out of flow (absolute) so it doesn't push the
// select down. The toolbar reserves top room for the floating label via .table-toolbar--breakout.
.breakout-control {
  position: relative;
  display: flex;
  align-items: center;
  .usa-label {
    position: absolute;
    left: 0;
    bottom: calc(100% + 0.15rem);
    margin: 0;
    font-size: 0.82rem;
    line-height: 1;
    white-space: nowrap;
  }
  .breakout-select { width: auto; min-width: 10rem; max-width: 16rem; margin-top: 0; }
}

.table-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; margin-bottom: 0.5rem; }
// Room above the row for the floating "Break out by" label (only when the breakout is shown).
.table-toolbar--breakout { padding-top: 1.25rem; }
.table-toolbar__group { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; }
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
.month-col,
.breakout-col { width: 1%; white-space: nowrap; }

// Sortable column headers: the whole header is a button with a trailing caret. The active
// column shows arrow_drop_up/arrow_drop_down; other sortable columns show a muted unfold_more
// to signal they're clickable.
.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  width: 100%;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: inherit;

  &:hover .sort-icon { color: $onrr-violet; }
  &:focus-visible { outline: 2px solid $onrr-violet; outline-offset: 2px; }
}
.sort-btn--right { justify-content: flex-end; }
.sort-icon {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  color: #a9aeb1; // muted (inactive / unfold_more)
}
.sort-icon--active { color: $onrr-violet; }

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

.pivot .detail-row td { font-size: 0.95rem; }
.pivot .breakout-cell { white-space: nowrap; color: #565c65; }
.pivot .detail-row > th,
.pivot .detail-row > td { background: #fff; }
.pivot .detail-row.row-alt > th,
.pivot .detail-row.row-alt > td { background: #f5f5f5; }
.pivot .subtotal-row > th,
.pivot .subtotal-row > td {
  background: #fff;
  font-weight: 700;
  border-top: 1px solid #dfe1e2;
}
.pivot .subtotal-label { font-weight: 700; }

// --- Annual flat table --------------------------------------------------------
.pivot--flat table {
  border-collapse: separate;
  border-spacing: 0;
}
.pivot--flat .dim-col,
.pivot--flat .dim-cell {
  min-width: 15rem;
  max-width: 22rem;
  position: sticky;
  left: 0;
}
.pivot--flat .dim-col { z-index: 3; }
.pivot--flat .prod-row .dim-cell {
  z-index: 1;
  text-align: left;
  font-weight: 400;
  white-space: normal;
  color: #1b1b1b;
}
.pivot--flat .prod-row > th,
.pivot--flat .prod-row > td { background: #fff; }
.pivot--flat .prod-row.row-alt > th,
.pivot--flat .prod-row.row-alt > td { background: #f5f5f5; }

.text-right { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
