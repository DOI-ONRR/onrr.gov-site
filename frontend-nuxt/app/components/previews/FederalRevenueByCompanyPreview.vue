<script setup>
/*
  FederalRevenueByCompanyPreview — the "Preview and filter" panel for the Federal Revenue by
  Company dataset. Calendar-year data only. Like RevenuePreview it spreads one measure
  (SUM(revenue), dollars) across year COLUMNS, but the row dimension is the COMPANY
  (corporate_name), one row per company with a column per calendar year in the selected range.

  Filters: Calendar-year From/To, Search Companies (a searchable multi-select on corporate_name;
  empty = all companies, selecting narrows), Commodity, Revenue Type. An optional "Break out by"
  (Commodity / Revenue Type) turns each company into a collapsible band with one sub-row per value.

  With no company selected the table shows the top 50 companies by total revenue (the endpoint
  caps and flags `truncated`); searching narrows to specific companies. The chart above the
  heading is a top-6-companies revenue time series. Aggregation is server-side via
  `/charts/federal-revenue-by-company/pivot`; deep-linkable via the URL query.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
})
const { apiUrl } = useRuntimeConfig().public

const route = useRoute()

const BREAKOUT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'revenue_type', label: 'Revenue Type' },
]
const breakout = ref(BREAKOUT_OPTIONS.some((o) => o.value && o.value === queryStr(route.query.breakout)) ? queryStr(route.query.breakout) : '')
const hasBreakout = computed(() => !!breakout.value)
// The breakout the CURRENT DATA is grouped by — render off this (not the live control) so the
// breakout layout only appears once its rows have loaded, never as empty bands.
const dataBreakout = computed(() => pivot.value?.breakout || '')
const breakoutColLabel = computed(() => BREAKOUT_OPTIONS.find((o) => o.value === dataBreakout.value)?.label || '')
const grouped = computed(() => !!dataBreakout.value)

// Revenue is dollars.
function currency(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// --- filter options (loaded once) ---------------------------------------------
const { data: options } = await useAsyncData('frbc-pivot-options', () =>
  $fetch(`${apiUrl}/charts/federal-revenue-by-company/pivot/options`),
)
const yearOptions = computed(() => options.value?.years || [])
const companyOptions = computed(() => options.value?.companies || [])
const commodityOptions = computed(() => options.value?.commodities || [])
const revenueTypeOptions = computed(() => options.value?.revenueTypes || [])

// --- filter state -------------------------------------------------------------
// companies defaults to [] meaning "all companies" (server shows the top 50); commodities and
// revenue types default to all-selected (empty = a deliberately empty selection -> no records).
const filters = reactive({ fromYear: '', toYear: '', companies: [], commodities: [], revenueTypes: [] })

const commodityAllSelected = computed(() => commodityOptions.value.length > 0 && filters.commodities.length === commodityOptions.value.length)
const revenueAllSelected = computed(() => revenueTypeOptions.value.length > 0 && filters.revenueTypes.length === revenueTypeOptions.value.length)

const summarize = (all, arr, allLabel) => {
  if (all) return allLabel
  if (arr.length === 0) return 'None selected'
  if (arr.length === 1) return arr[0]
  return `${arr.length} selected`
}
const commoditySummary = computed(() => summarize(commodityAllSelected.value, filters.commodities, 'All commodities'))
const revenueSummary = computed(() => summarize(revenueAllSelected.value, filters.revenueTypes, 'All revenue types'))
// Companies: empty = all; otherwise the count (never "None selected", since empty is valid here).
const companySummary = computed(() =>
  filters.companies.length === 0 ? 'All companies' : filters.companies.length === 1 ? filters.companies[0] : `${filters.companies.length} selected`,
)

function seedFilters() {
  filters.fromYear = yearOptions.value[0] ?? ''
  filters.toYear = yearOptions.value[yearOptions.value.length - 1] ?? ''
  filters.companies = []
  filters.commodities = [...commodityOptions.value]
  filters.revenueTypes = [...revenueTypeOptions.value]
}

// Override the seeded defaults with any valid values from the URL query; unknown/all-invalid
// values keep the default so a stale link degrades gracefully.
function applyQueryToFilters() {
  const q = route.query
  const yrs = yearOptions.value
  const fy = Number(queryStr(q.fromYear))
  if (q.fromYear != null && yrs.includes(fy)) filters.fromYear = fy
  const ty = Number(queryStr(q.toYear))
  if (q.toYear != null && yrs.includes(ty)) filters.toYear = ty
  const applyMulti = (param, optionList, target) => {
    const req = queryList(q[param])
    if (!req || !req.length) return
    const sel = optionList.filter((o) => req.includes(o))
    if (sel.length) filters[target] = sel
  }
  applyMulti('companies', companyOptions.value, 'companies')
  applyMulti('commodities', commodityOptions.value, 'commodities')
  applyMulti('revenueTypes', revenueTypeOptions.value, 'revenueTypes')
}

const ready = ref(false)
watchEffect(() => {
  if (ready.value || !options.value) return
  seedFilters()
  applyQueryToFilters()
  ready.value = true
})

// --- multi-select dropdowns ---------------------------------------------------
const companyOpen = ref(false)
const commodityOpen = ref(false)
const revenueOpen = ref(false)
const companyRef = ref(null)
const commodityRef = ref(null)
const revenueRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleCompany(v) { filters.companies = toggleIn(filters.companies, v) }
function toggleCommodity(v) { filters.commodities = toggleIn(filters.commodities, v) }
function toggleRevenue(v) { filters.revenueTypes = toggleIn(filters.revenueTypes, v) }
function toggleAllCommodities() { filters.commodities = commodityAllSelected.value ? [] : [...commodityOptions.value] }
function toggleAllRevenue() { filters.revenueTypes = revenueAllSelected.value ? [] : [...revenueTypeOptions.value] }
function clearCompanies() { filters.companies = [] }
function handleClickOutside(e) {
  if (companyRef.value && !companyRef.value.contains(e.target)) companyOpen.value = false
  if (commodityRef.value && !commodityRef.value.contains(e.target)) commodityOpen.value = false
  if (revenueRef.value && !revenueRef.value.contains(e.target)) revenueOpen.value = false
}

// Searchable company list: filter by the typed term and cap the rendered matches (the option
// list can be very long). Selected companies always show at the top so they can be unchecked
// even when the search box is empty.
const companySearch = ref('')
const COMPANY_RENDER_CAP = 100
const companyMatches = computed(() => {
  const term = companySearch.value.trim().toLowerCase()
  const selected = new Set(filters.companies)
  const all = companyOptions.value
  const matches = term ? all.filter((c) => c.toLowerCase().includes(term)) : all
  // Selected first (stable), then the rest, then cap.
  const head = matches.filter((c) => selected.has(c))
  const tail = matches.filter((c) => !selected.has(c))
  const ordered = [...head, ...tail]
  return { list: ordered.slice(0, COMPANY_RENDER_CAP), more: Math.max(0, ordered.length - COMPANY_RENDER_CAP) }
})

// Sticky headers + the widest band name for the group-column width; the flat first column is a
// sticky, separately-composited layer, so its violet borders can paint a hair out of step with
// each row on the first paint (hydration + web fonts settling). Swapping the tbody forces a clean
// repaint — bump `tbodyKey` once fonts settle (see onMounted) so it lines up on load without a
// breakout toggle.
const wrapRef = ref(null)
const theadRef = ref(null)
const theadH = ref(0)
let theadObserver = null
const dimW = ref(0)
const tbodyKey = ref(0)
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
  if (import.meta.client && document.fonts?.ready) {
    document.fonts.ready.then(() => { tbodyKey.value++; nextTick(measureDimCol) })
  }
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  theadObserver?.disconnect()
})

// Collapse/expand company bands (breakout only). Reset when the breakout dimension changes.
const collapsed = ref(new Set())
watch(breakout, () => { collapsed.value = new Set() })
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
// Commodity/Revenue-Type all-deselected = an empty selection (no records). Companies empty is
// valid (all companies), so it doesn't count toward "empty".
const selectionEmpty = computed(() => !filters.commodities.length || !filters.revenueTypes.length)
const filterQuery = computed(() => {
  const query = {}
  const ys = yearOptions.value
  if (filters.fromYear && filters.fromYear !== ys[0]) query.fromYear = String(filters.fromYear)
  if (filters.toYear && filters.toYear !== ys[ys.length - 1]) query.toYear = String(filters.toYear)
  if (filters.companies.length) query.companies = filters.companies.join(',')
  if (!selectionEmpty.value) {
    if (filters.commodities.length < commodityOptions.value.length) query.commodities = filters.commodities.join(',')
    if (filters.revenueTypes.length < revenueTypeOptions.value.length) query.revenueTypes = filters.revenueTypes.join(',')
  }
  if (hasBreakout.value) query.breakout = breakout.value
  return { query, empty: selectionEmpty.value }
})

useUrlFilterSync(() => filterQuery.value.query, ready, ['fromYear', 'toYear', 'companies', 'commodities', 'revenueTypes', 'breakout'])

// --- pivot data ---------------------------------------------------------------
const emptyPivot = () => ({ groupBy: 'company', breakout: null, years: [], groups: [], totalsByYear: {}, truncated: false, shownCompanies: 0, totalCompanies: 0, recordCount: 0 })
const { data: pivot, pending } = await useAsyncData(
  'frbc-pivot',
  async () => {
    if (!ready.value) return null
    const { query, empty } = filterQuery.value
    if (empty) return emptyPivot()
    return $fetch(`${apiUrl}/charts/federal-revenue-by-company/pivot`, { query })
  },
  { watch: [() => JSON.stringify(filters), ready, breakout], dedupe: 'cancel' },
)

const years = computed(() => pivot.value?.years || [])
const groups = computed(() => pivot.value?.groups || [])
const totalsByYear = computed(() => pivot.value?.totalsByYear || {})
const truncated = computed(() => !!pivot.value?.truncated)
watch(pivot, () => nextTick(measureDimCol))

// --- chart (reactive to the same filters) -------------------------------------
// Published to the dataset's reactive ChartCard (reacts_to_filters) via the datasetPreviewChart
// inject — the same pattern as the revenue / production / disbursement previews. A multi-series
// currency line chart of the top N companies by total revenue, X = calendar year. Derived
// straight from the pivot groups (already ranked by total), so there's no separate fetch; the
// breakout is a table-only control and doesn't affect the top-level company series.
const CHART_TOP_N = 6
const chartPayload = computed(() => {
  const p = pivot.value
  if (!ready.value || !p) return null
  return {
    empty: !p.groups?.length,
    periodType: 'Calendar Year',
    valueFormat: 'currency',
    groupBy: 'company',
    groupByLabel: 'Company',
    years: p.years || [],
    groups: (p.groups || []).slice(0, CHART_TOP_N),
  }
})
const previewChart = inject('datasetPreviewChart', null)
if (previewChart) {
  watchEffect(() => { previewChart.value = chartPayload.value })
}

// --- sorting ------------------------------------------------------------------
// Client-side sort of the company rows. The Company header sorts by name; each year header by
// that year's value. Default (sortKey null) keeps the endpoint's total-revenue-desc ranking.
const sortKey = ref(null) // null | 'company' | <year:number>
const sortDir = ref('desc')
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'company' ? 'asc' : 'desc'
  }
}
const sortState = (key) => (sortKey.value === key ? sortDir.value : null)
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
  if (key === 'company') copy.sort((a, b) => dir * String(a.key).localeCompare(String(b.key)))
  else copy.sort((a, b) => dir * ((a.byYear[key] || 0) - (b.byYear[key] || 0)))
  return copy
})
watch(years, (ys) => {
  if (typeof sortKey.value === 'number' && !ys.includes(sortKey.value)) {
    sortKey.value = null
    sortDir.value = 'desc'
  }
})

function clearFilters() {
  seedFilters()
  companySearch.value = ''
}

// --- CSV: Company [| breakout] | one column per year --------------------------
function downloadCsv() {
  const p = pivot.value
  if (!p?.groups?.length) return
  const rows = []
  if (dataBreakout.value) {
    rows.push(['Company', breakoutColLabel.value, ...p.years.map(String)])
    for (const g of p.groups) {
      rows.push([g.key, 'All', ...p.years.map((y) => g.byYear[y] ?? '')])
      for (const row of g.rows || []) rows.push([g.key, row.key, ...p.years.map((y) => row.byYear[y] ?? '')])
    }
  } else {
    rows.push(['Company', ...p.years.map(String)])
    for (const g of p.groups) rows.push([g.key, ...p.years.map((y) => g.byYear[y] ?? '')])
  }
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'federal-revenue-by-company.csv'
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
    for (const [k, v] of Object.entries(query)) if (k !== 'breakout') q.set(k, v)
    const qs = q.toString()
    return `${apiUrl}/charts/federal-revenue-by-company/export${qs ? `?${qs}` : ''}`
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

const colspanEmpty = computed(() => years.value.length + (grouped.value ? 2 : 1))
</script>

<template>
  <div class="margin-bottom-4">
    <!-- Filter bar -->
    <div class="filter-bar padding-2 margin-bottom-2">
      <div class="filter-bar__fields">
        <!-- Calendar-year range -->
        <div class="field">
          <label class="usa-label margin-top-0" for="frbc-from">From</label>
          <select id="frbc-from" v-model.number="filters.fromYear" class="usa-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="field">
          <label class="usa-label margin-top-0" for="frbc-to">To</label>
          <select id="frbc-to" v-model.number="filters.toYear" class="usa-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Search Companies (searchable multi-select) -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="frbc-company">Search companies</label>
          <div ref="companyRef" class="multi-select">
            <button id="frbc-company" type="button" class="usa-select multi-select__trigger" :aria-expanded="companyOpen" @click="companyOpen = !companyOpen">
              <span :class="{ 'multi-select__placeholder': filters.companies.length === 0 }">{{ companySummary }}</span>
            </button>
            <div v-show="companyOpen" class="multi-select__dropdown multi-select__dropdown--search">
              <div class="multi-select__search">
                <input v-model="companySearch" type="text" class="usa-input" placeholder="Type to search companies…" aria-label="Search companies">
                <button v-if="filters.companies.length" type="button" class="usa-button usa-button--unstyled multi-select__clear" @click="clearCompanies">Clear</button>
              </div>
              <ul class="multi-select__list" role="listbox" aria-multiselectable="true">
                <li v-if="!companyMatches.list.length" class="multi-select__empty">No matching companies</li>
                <li v-for="v in companyMatches.list" :key="v" role="option" :aria-selected="filters.companies.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.companies.includes(v) }" @click="toggleCompany(v)">
                  <input type="checkbox" :checked="filters.companies.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
                </li>
                <li v-if="companyMatches.more" class="multi-select__more">+{{ companyMatches.more.toLocaleString() }} more — refine your search</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Commodity -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="frbc-commodity">Commodity</label>
          <div ref="commodityRef" class="multi-select">
            <button id="frbc-commodity" type="button" class="usa-select multi-select__trigger" :aria-expanded="commodityOpen" @click="commodityOpen = !commodityOpen">
              <span :class="{ 'multi-select__placeholder': commodityAllSelected }">{{ commoditySummary }}</span>
            </button>
            <ul v-show="commodityOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li role="option" :aria-selected="commodityAllSelected" class="multi-select__option multi-select__option--all" :class="{ 'multi-select__option--selected': commodityAllSelected }" @click="toggleAllCommodities">
                <input type="checkbox" :checked="commodityAllSelected" tabindex="-1" class="multi-select__checkbox"> Select all
              </li>
              <li v-for="v in commodityOptions" :key="v" role="option" :aria-selected="filters.commodities.includes(v)" class="multi-select__option" :class="{ 'multi-select__option--selected': filters.commodities.includes(v) }" @click="toggleCommodity(v)">
                <input type="checkbox" :checked="filters.commodities.includes(v)" tabindex="-1" class="multi-select__checkbox"> {{ v }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Revenue Type -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="frbc-revtype">Revenue type</label>
          <div ref="revenueRef" class="multi-select">
            <button id="frbc-revtype" type="button" class="usa-select multi-select__trigger" :aria-expanded="revenueOpen" @click="revenueOpen = !revenueOpen">
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

        <div class="field field--action">
          <button type="button" class="usa-button usa-button--unstyled" @click="clearFilters">Clear all filters</button>
        </div>
      </div>
    </div>

    <!-- Toolbar: breakout + collapse control (left), record count + CSV (right) -->
    <div class="table-toolbar table-toolbar--breakout">
      <div class="table-toolbar__group">
        <div class="breakout-control">
          <label class="usa-label margin-top-0" for="frbc-breakout">Break out by</label>
          <select id="frbc-breakout" v-model="breakout" class="usa-select breakout-select">
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
          <strong>{{ groups.length }}</strong> compan{{ groups.length === 1 ? 'y' : 'ies' }}
          <button type="button" class="usa-button usa-button--unstyled margin-left-2" :disabled="!groups.length" @click="downloadCsv">Download CSV</button>
        </template>
      </p>
    </div>

    <!-- Top-companies note when the table is capped -->
    <p v-if="truncated && !pending" class="truncation-note margin-top-0 margin-bottom-1">
      Showing the top {{ groups.length }} companies by total revenue of {{ (pivot?.totalCompanies || 0).toLocaleString() }}. Search for a company above to find others.
    </p>

    <!-- Table: Company [| breakout] | one column per year -->
    <div
      ref="wrapRef"
      class="data-table-wrap pivot margin-top-2"
      :class="{ 'pivot--flat': !grouped }"
      :style="{ '--thead-h': `${theadH}px`, '--dim-w': dimW ? `${dimW}px` : undefined }"
    >
      <table class="usa-table usa-table--compact width-full margin-bottom-0 margin-top-0">
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col padding-y-105" :aria-sort="ariaSort('company')">
              <button type="button" class="sort-btn" @click="setSort('company')">
                <span>Company</span>
                <svg class="usa-icon sort-icon" :class="{ 'sort-icon--active': sortState('company') }" aria-hidden="true" role="img">
                  <use :href="`/uswds/img/sprite.svg#${sortIcon('company')}`" />
                </svg>
              </button>
            </th>
            <th v-if="grouped" scope="col" class="breakout-col">{{ breakoutColLabel }}</th>
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
        <tbody :key="tbodyKey">
          <tr v-if="!pending && !groups.length">
            <td :colspan="colspanEmpty">No records match the current filters.</td>
          </tr>

          <!-- Breakout: company band -> collapsible sub-rows -> subtotal -->
          <template v-if="grouped">
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

          <!-- Flat: one row per company -->
          <template v-else>
            <tr v-for="(g, gi) in sortedGroups" :key="g.key" class="prod-row" :class="{ 'row-alt': gi % 2 === 1 }">
              <th scope="row" class="dim-cell prod-name">{{ g.key }}</th>
              <td v-for="y in years" :key="y" class="text-right">{{ g.byYear[y] ? currency(g.byYear[y]) : '—' }}</td>
            </tr>
          </template>
        </tbody>
        <tfoot v-if="groups.length">
          <tr class="total-row">
            <th scope="row" :colspan="grouped ? 2 : 1">{{ truncated ? 'Total (shown)' : 'Total' }}</th>
            <td v-for="y in years" :key="y" class="text-right">{{ currency(totalsByYear[y]) }}</td>
          </tr>
        </tfoot>
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

// Searchable company dropdown: a sticky search box above a scrolling option list.
.multi-select__dropdown--search { padding: 0; }
.multi-select__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #dfe1e2;
  .usa-input { margin: 0; height: 2.25rem; }
  .multi-select__clear { flex: none; font-size: 0.85rem; }
}
.multi-select__list { list-style: none; margin: 0; padding: 0; max-height: 16rem; overflow-y: auto; }
.multi-select__empty,
.multi-select__more { padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #565c65; }

// Break-out control (in the toolbar's left cluster): label above the dropdown, dropdown itself
// vertically centered on the row with the button and results line (label taken out of flow).
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
.table-toolbar--breakout { padding-top: 1.25rem; }
.table-toolbar__group { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; }
.table-toolbar__group .usa-button { margin: 0; }
.results-line { font-size: 0.95rem; }
.truncation-note { font-size: 0.9rem; color: #565c65; }

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
.dim-cell { min-width: var(--dim-w, 15rem); }
.dim-col { white-space: nowrap; }
.breakout-col { width: 1%; white-space: nowrap; }

// Sortable column headers.
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
  color: #a9aeb1;
}
.sort-icon--active { color: $onrr-violet; }

// --- Breakout (grouped) table -------------------------------------------------
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

// --- Flat table ---------------------------------------------------------------
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

// Overall total (table footer).
.pivot .total-row > th,
.pivot .total-row > td {
  background: #f9fafb;
  font-weight: 700;
  border-top: 2px solid #565c65;
  position: sticky;
  bottom: 0;
}
// In the flat table the first column is sticky (position: sticky; left: 0). Pin the total row's
// first cell the same way so the "Total" label stays under the sticky Company column on h-scroll.
.pivot--flat .total-row > th {
  left: 0;
  z-index: 2;
}

.text-right { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
