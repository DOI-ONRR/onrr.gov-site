<script setup>
/*
  ProductionPreview — the "Preview and filter" panel for every Production dataset. One
  component serves both a monthly and a yearly page; the base grain comes from the dataset's
  export_filter (period.type), like DisbursementPreview:

    Monthly — From/To month, Land type, Product; grouped table (Product -> month detail
              rows) with collapsible groups; chart = small multiples per product.
    Yearly  — a Period filter (Fiscal year / Calendar year) + From/To year, Land class,
              Land category, State/Offshore Region, Product; flat table (Product | one
              column per year); chart = small multiples of the TOP N products by breadth of
              reporting. An export_filter of Fiscal Year or Calendar Year just sets the
              Period default; the user switches between them in-page.

  The yearly grain also offers an optional "Break out by" (Land Category / State / County):
  when set, the flat table becomes grouped — Product turns into a collapsible band with one
  sub-row per breakout value (plus a product subtotal), like the monthly month rows.

  Aggregation is server-side via `/charts/production/pivot?period=…`.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
})
const { apiUrl } = useRuntimeConfig().public

// The dataset's export_filter sets the base grain (e.g. { period: { type: { _eq: 'Fiscal
// Year' } } }). Monthly is fixed; a yearly (annual) page lets the user switch between Fiscal
// Year and Calendar Year with the Period filter, defaulting to whatever export_filter names.
const basePeriodType = computed(() => {
  const t = props.dataset?.export_filter?.period?.type
  const val = typeof t === 'object' && t ? t._eq : t
  return val === 'Fiscal Year' ? 'Fiscal Year' : val === 'Calendar Year' ? 'Calendar Year' : 'Monthly'
})
const isMonthly = computed(() => basePeriodType.value === 'Monthly')
const isAnnual = computed(() => !isMonthly.value)

const PERIOD_OPTIONS = [
  { value: 'Fiscal Year', label: 'Fiscal year' },
  { value: 'Calendar Year', label: 'Calendar year' },
]
const selectedPeriod = ref(basePeriodType.value === 'Calendar Year' ? 'Calendar Year' : 'Fiscal Year')
const periodType = computed(() => (isMonthly.value ? 'Monthly' : selectedPeriod.value))
const periodParam = computed(() =>
  periodType.value === 'Fiscal Year' ? 'fiscal-year' : periodType.value === 'Calendar Year' ? 'calendar-year' : 'monthly',
)
const CHART_TOP_N = 5

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function monthLabel(d) {
  if (!d) return '—'
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(dt.getTime()) ? d : `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}
// The Period filter names the grain (FY vs CY), so the year dropdowns show the bare year.
const yearOptionLabel = (y) => String(y)
// Volumes are counts (bbl/mcf/ton/…), not currency — plain grouped integers.
function volume(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// --- optional secondary breakout (annual only) --------------------------------
const BREAKOUT_OPTIONS = [
  { value: '', label: 'No breakout' },
  { value: 'land_category', label: 'Land Category' },
  { value: 'state', label: 'State' },
  { value: 'county', label: 'County' },
]
const breakout = ref('')
const breakoutColLabel = computed(() => BREAKOUT_OPTIONS.find((o) => o.value === breakout.value)?.label || '')
const hasBreakout = computed(() => isAnnual.value && !!breakout.value)
// The table is grouped (collapsible band + detail rows) for monthly, or for an annual grain
// with a breakout; otherwise it's a flat one-row-per-product table.
const grouped = computed(() => isMonthly.value || hasBreakout.value)

// --- filter options (loaded once for this grain) ------------------------------
const { data: options } = await useAsyncData(
  `prod-pivot-options-${periodParam.value}`,
  () => $fetch(`${apiUrl}/charts/production/pivot/options`, { query: { period: periodParam.value } }),
  { watch: [periodParam] }, // re-fetch the option lists when the Period switches
)
const monthOptions = computed(() => options.value?.months || [])
const yearOptions = computed(() => options.value?.years || [])
const landTypeOptions = computed(() => options.value?.landTypes || [])
const landClassOptions = computed(() => options.value?.landClasses || [])
const landCategoryOptions = computed(() => options.value?.landCategories || [])
const regionOptions = computed(() => options.value?.regions || [])
const productOptions = computed(() => options.value?.products || [])

// --- filter state (seeded to full range / all-selected once options load) -----
const filters = reactive({ from: '', to: '', fromYear: '', toYear: '', landTypes: [], landClasses: [], landCategories: [], regions: [], products: [] })

const landAllSelected = computed(() => landTypeOptions.value.length > 0 && filters.landTypes.length === landTypeOptions.value.length)
const landClassAllSelected = computed(() => landClassOptions.value.length > 0 && filters.landClasses.length === landClassOptions.value.length)
const landCategoryAllSelected = computed(() => landCategoryOptions.value.length > 0 && filters.landCategories.length === landCategoryOptions.value.length)
const regionAllSelected = computed(() => regionOptions.value.length > 0 && filters.regions.length === regionOptions.value.length)
const productAllSelected = computed(() => productOptions.value.length > 0 && filters.products.length === productOptions.value.length)

const summarize = (all, arr, allLabel) => {
  if (all) return allLabel
  if (arr.length === 0) return 'None selected'
  if (arr.length === 1) return arr[0]
  return `${arr.length} selected`
}
const landSummary = computed(() => summarize(landAllSelected.value, filters.landTypes, 'All land types'))
const landClassSummary = computed(() => summarize(landClassAllSelected.value, filters.landClasses, 'All land classes'))
const landCategorySummary = computed(() => summarize(landCategoryAllSelected.value, filters.landCategories, 'All land categories'))
const regionSummary = computed(() => summarize(regionAllSelected.value, filters.regions, 'All regions'))
const productSummary = computed(() => summarize(productAllSelected.value, filters.products, 'All products'))

function seedFilters() {
  if (isMonthly.value) {
    filters.from = monthOptions.value[0] || ''
    filters.to = monthOptions.value[monthOptions.value.length - 1] || ''
    filters.landTypes = [...landTypeOptions.value]
  } else {
    filters.fromYear = yearOptions.value[0] ?? ''
    filters.toYear = yearOptions.value[yearOptions.value.length - 1] ?? ''
    filters.landClasses = [...landClassOptions.value]
    filters.landCategories = [...landCategoryOptions.value]
  }
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
const landClassOpen = ref(false)
const landCategoryOpen = ref(false)
const regionOpen = ref(false)
const productOpen = ref(false)
const landRef = ref(null)
const landClassRef = ref(null)
const landCategoryRef = ref(null)
const regionRef = ref(null)
const productRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleLand(v) { filters.landTypes = toggleIn(filters.landTypes, v) }
function toggleLandClass(v) { filters.landClasses = toggleIn(filters.landClasses, v) }
function toggleLandCategory(v) { filters.landCategories = toggleIn(filters.landCategories, v) }
function toggleRegion(v) { filters.regions = toggleIn(filters.regions, v) }
function toggleProduct(v) { filters.products = toggleIn(filters.products, v) }
function toggleAllLand() { filters.landTypes = landAllSelected.value ? [] : [...landTypeOptions.value] }
function toggleAllLandClasses() { filters.landClasses = landClassAllSelected.value ? [] : [...landClassOptions.value] }
function toggleAllLandCategories() { filters.landCategories = landCategoryAllSelected.value ? [] : [...landCategoryOptions.value] }
function toggleAllRegions() { filters.regions = regionAllSelected.value ? [] : [...regionOptions.value] }
function toggleAllProducts() { filters.products = productAllSelected.value ? [] : [...productOptions.value] }
function handleClickOutside(e) {
  if (landRef.value && !landRef.value.contains(e.target)) landOpen.value = false
  if (landClassRef.value && !landClassRef.value.contains(e.target)) landClassOpen.value = false
  if (landCategoryRef.value && !landCategoryRef.value.contains(e.target)) landCategoryOpen.value = false
  if (regionRef.value && !regionRef.value.contains(e.target)) regionOpen.value = false
  if (productRef.value && !productRef.value.contains(e.target)) productOpen.value = false
}

// Sticky group headers pin beneath the sticky thead; measure the thead height for the
// --thead-h offset, and (grouped tables) the widest product name for the band-column width.
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

// Collapse/expand product groups (grouped tables only).
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
const selectionEmpty = computed(() => {
  if (!filters.products.length) return true
  if (isMonthly.value) return !filters.landTypes.length
  return !filters.landClasses.length || !filters.landCategories.length || !filters.regions.length
})
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
    if (isMonthly.value) {
      if (filters.landTypes.length < landTypeOptions.value.length) query.landTypes = filters.landTypes.join(',')
    } else {
      if (filters.landClasses.length < landClassOptions.value.length) query.landClasses = filters.landClasses.join(',')
      if (filters.landCategories.length < landCategoryOptions.value.length) query.landCategories = filters.landCategories.join(',')
      if (filters.regions.length < regionOptions.value.length) query.regions = filters.regions.join(',')
    }
    if (filters.products.length < productOptions.value.length) query.products = filters.products.join(',')
  }
  if (hasBreakout.value) query.breakout = breakout.value
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
  { watch: [() => JSON.stringify(filters), ready, breakout, periodParam], dedupe: 'cancel' },
)

// When the Period (FY/CY) switches, the available years can differ — clamp the current
// range into the new list so the From/To selects never point at a missing year.
watch(yearOptions, (ys) => {
  if (!ys.length || isMonthly.value) return
  if (filters.fromYear && !ys.includes(filters.fromYear)) filters.fromYear = ys[0]
  if (filters.toYear && !ys.includes(filters.toYear)) filters.toYear = ys[ys.length - 1]
})

const years = computed(() => pivot.value?.years || [])
const groups = computed(() => pivot.value?.groups || [])
watch(pivot, () => nextTick(measureDimCol))

// Publish a coherent pivot payload for the reactive chart — small multiples of the top N
// products by breadth of reporting (the endpoint returns groups ranked by record count, so
// the top N is unit-independent rather than dominated by large-magnitude units). The chart
// always uses product-level totals (g.byYear), so a table breakout doesn't change it.
const chartPayload = computed(() => {
  const p = pivot.value
  if (!ready.value || !p) return null
  return {
    empty: !p.groups?.length,
    periodType: periodType.value,
    layout: 'small-multiples',
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

// --- CSV ----------------------------------------------------------------------
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
  } else if (hasBreakout.value) {
    rows.push(['Product', breakoutColLabel.value, ...p.years.map(String)])
    for (const g of p.groups) {
      rows.push([g.key, 'All', ...p.years.map((y) => g.byYear[y] ?? '')])
      for (const row of g.rows || []) rows.push([g.key, row.key, ...p.years.map((y) => row.byYear[y] ?? '')])
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
    for (const [k, v] of Object.entries(query)) if (k !== 'breakout') q.set(k, v)
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
        <!-- Period: Fiscal vs Calendar year (annual grains only) -->
        <div v-if="isAnnual" class="field">
          <label class="usa-label margin-top-0" for="p-period">Period</label>
          <select id="p-period" v-model="selectedPeriod" class="usa-select">
            <option v-for="o in PERIOD_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>

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

        <!-- Monthly: single Land type multi-select -->
        <div v-if="isMonthly" class="field field--wide">
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

        <!-- Annual: Land class + Land category multi-selects -->
        <template v-else>
          <div class="field field--wide">
            <label class="usa-label margin-top-0" for="p-land-class">Land class</label>
            <div ref="landClassRef" class="multi-select">
              <button id="p-land-class" type="button" class="usa-select multi-select__trigger" :aria-expanded="landClassOpen" @click="landClassOpen = !landClassOpen">
                <span :class="{ 'multi-select__placeholder': landClassAllSelected }">{{ landClassSummary }}</span>
              </button>
              <ul v-show="landClassOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
                <li role="option" :aria-selected="landClassAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': landClassAllSelected }" @click="toggleAllLandClasses">
                  <input type="checkbox" :checked="landClassAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
                </li>
                <li v-for="v in landClassOptions" :key="v" role="option" :aria-selected="filters.landClasses.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.landClasses.includes(v) }" @click="toggleLandClass(v)">
                  <input type="checkbox" :checked="filters.landClasses.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
                </li>
              </ul>
            </div>
          </div>
          <div class="field field--wide">
            <label class="usa-label margin-top-0" for="p-land-category">Land category</label>
            <div ref="landCategoryRef" class="multi-select">
              <button id="p-land-category" type="button" class="usa-select multi-select__trigger" :aria-expanded="landCategoryOpen" @click="landCategoryOpen = !landCategoryOpen">
                <span :class="{ 'multi-select__placeholder': landCategoryAllSelected }">{{ landCategorySummary }}</span>
              </button>
              <ul v-show="landCategoryOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
                <li role="option" :aria-selected="landCategoryAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': landCategoryAllSelected }" @click="toggleAllLandCategories">
                  <input type="checkbox" :checked="landCategoryAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
                </li>
                <li v-for="v in landCategoryOptions" :key="v" role="option" :aria-selected="filters.landCategories.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.landCategories.includes(v) }" @click="toggleLandCategory(v)">
                  <input type="checkbox" :checked="filters.landCategories.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
                </li>
              </ul>
            </div>
          </div>
        </template>

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

    <!-- Break-out control (annual grains): adds a grouping column after Product -->
    <div v-if="isAnnual" class="breakout-control margin-bottom-2">
      <label class="usa-label margin-top-0" for="p-breakout">Break out by</label>
      <select id="p-breakout" v-model="breakout" class="usa-select breakout-select">
        <option v-for="o in BREAKOUT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </div>

    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="table-toolbar__group">
        <button v-if="grouped" type="button" class="usa-button usa-button--outline" :disabled="!groups.length" @click="toggleAll">
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
      :class="{ 'pivot--flat': isAnnual && !hasBreakout }"
      :style="{ '--thead-h': `${theadH}px`, '--dim-w': dimW ? `${dimW}px` : undefined }"
    >
      <table class="usa-table usa-table--compact width-full margin-bottom-0 margin-top-0">
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col">Product</th>
            <th v-if="isMonthly" scope="col" class="month-col">Month</th>
            <th v-else-if="hasBreakout" scope="col" class="breakout-col">{{ breakoutColLabel }}</th>
            <th v-for="y in years" :key="y" scope="col" class="text-right">{{ y }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !groups.length">
            <td :colspan="years.length + (grouped ? 2 : 1)">No records match the current filters.</td>
          </tr>

          <!-- Monthly: grouped by product -> collapsible month rows -> subtotal -->
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
                <tr v-for="(m, mi) in g.months" :key="`${g.key}-${m.month}`" class="detail-row" :class="{ 'row-alt': mi % 2 === 1 }">
                  <td class="dim-cell"></td>
                  <td class="breakout-cell">{{ m.monthName }}</td>
                  <td v-for="y in years" :key="y" class="text-right">{{ m.byYear[y] ? volume(m.byYear[y]) : '—' }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td class="dim-cell"></td>
                  <th scope="row" class="breakout-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                  <td v-for="y in years" :key="y" class="text-right">{{ volume(g.byYear[y]) }}</td>
                </tr>
              </template>
            </template>
          </template>

          <!-- Annual + breakout: grouped by product -> collapsible breakout rows -> subtotal -->
          <template v-else-if="hasBreakout">
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
                <tr v-for="(row, ri) in g.rows" :key="`${g.key}-${row.key}`" class="detail-row" :class="{ 'row-alt': ri % 2 === 1 }">
                  <td class="dim-cell"></td>
                  <td class="breakout-cell">{{ row.key }}</td>
                  <td v-for="y in years" :key="y" class="text-right">{{ row.byYear[y] ? volume(row.byYear[y]) : '—' }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td class="dim-cell"></td>
                  <th scope="row" class="breakout-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                  <td v-for="y in years" :key="y" class="text-right">{{ volume(g.byYear[y]) }}</td>
                </tr>
              </template>
            </template>
          </template>

          <!-- Annual, no breakout: flat, one row per product -->
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
.field--wide { flex: 2 1 13rem; }
.field--action { flex: 0 0 auto; display: flex; align-items: flex-end; }

.multi-select__option--all { font-weight: 700; border-bottom: 1px solid #dfe1e2; }

// Break-out control: left-aligned single select below the filter bar.
.breakout-control {
  .usa-label { font-size: 0.82rem; margin-bottom: 0.25rem; }
  .breakout-select { width: auto; min-width: 12rem; max-width: 16rem; margin-top: 0; }
}

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
.month-col,
.breakout-col { width: 1%; white-space: nowrap; }

// --- Grouped table (monthly, or annual with a breakout) -----------------------
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
// White/gray zebra on the detail rows, keyed off the row index within its group.
.pivot .detail-row > th,
.pivot .detail-row > td { background: #fff; }
.pivot .detail-row.row-alt > th,
.pivot .detail-row.row-alt > td { background: #f5f5f5; }
// Group subtotal: white, bold, ruled off — matches the disbursement tables.
.pivot .subtotal-row > th,
.pivot .subtotal-row > td {
  background: #fff;
  font-weight: 700;
  border-top: 1px solid #dfe1e2;
}
.pivot .subtotal-label { font-weight: 700; }

// --- Annual flat table (no breakout) ------------------------------------------
// Use the separated border model for this table only. Product names wrap here, and in
// border-collapse mode a wrapped (taller) cell drops its bottom border (a Chromium quirk);
// separated borders paint per-cell and stay put. Scoped to `.pivot--flat` so the monthly
// and disbursement tables keep border-collapse (their sticky-header seam fix depends on it).
.pivot--flat table {
  border-collapse: separate;
  border-spacing: 0;
}

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
