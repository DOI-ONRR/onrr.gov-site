<script setup>
/*
  FederalSalesPreview — the "Preview and filter" panel for the Federal Sales dataset.

  Unlike the other previews (one measure spread across year COLUMNS), federal sales aggregates
  SIX measures for the selected calendar-year RANGE and shows them as the table's columns, one
  row per commodity: Sales Volume, Sales Value, RVPA, TA, PA, RVLA.

  Filters: Calendar-year From/To, Commodity (a fixed set), Land Type, State/Offshore Region.
  An optional "Break out by" (Land Type / State/Offshore Region) turns each commodity into a
  collapsible band with one sub-row per value plus a commodity subtotal. Deep-linkable via the
  URL query (useQueryFilters). Aggregation is server-side via `/charts/federal-sales/pivot`.
*/
const props = defineProps({
  dataset: { type: Object, required: true },
})
const { apiUrl } = useRuntimeConfig().public

// URL query <-> filters (deep-linkable, two-way): read filter values from the query on load and
// reflect changes back into it. Param names match the endpoint. See the useQueryFilters composable.
const route = useRoute()

// The six measures, in display order. `short` heads the column (abbreviation for the long ones,
// with `full` as its title); `format` picks currency vs plain volume.
const MEASURES = [
  { key: 'sales_volume', short: 'Sales Volume', full: 'Sales Volume', format: 'number' },
  { key: 'sales_value', short: 'Sales Value', full: 'Sales Value', format: 'currency' },
  { key: 'rvpa', short: 'RVPA', full: 'Royalty Value Prior to Allowances', format: 'currency' },
  { key: 'ta', short: 'TA', full: 'Transportation Allowances', format: 'currency' },
  { key: 'pa', short: 'PA', full: 'Processing Allowances', format: 'currency' },
  { key: 'rvla', short: 'RVLA', full: 'Royalty Value Less Allowances', format: 'currency' },
]

const BREAKOUT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'land_type', label: 'Land Type' },
  { value: 'region', label: 'State/Offshore Region' },
]
const breakout = ref(BREAKOUT_OPTIONS.some((o) => o.value && o.value === queryStr(route.query.breakout)) ? queryStr(route.query.breakout) : '')
const hasBreakout = computed(() => !!breakout.value) // drives the query
// The breakout the CURRENT DATA is grouped by — render off this (not the live control) so the
// breakout layout only appears once its rows have loaded, never as empty bands.
const dataBreakout = computed(() => pivot.value?.breakout || '')
const breakoutColLabel = computed(() => BREAKOUT_OPTIONS.find((o) => o.value === dataBreakout.value)?.label || '')
const grouped = computed(() => !!dataBreakout.value)

// --- formatting ---------------------------------------------------------------
function currency(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function volume(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
const fmt = (measure, v) => (measure.format === 'currency' ? currency(v) : volume(v))

// --- filter options (loaded once) ---------------------------------------------
const { data: options } = await useAsyncData('fs-pivot-options', () =>
  $fetch(`${apiUrl}/charts/federal-sales/pivot/options`),
)
const yearOptions = computed(() => options.value?.years || [])
const commodityOptions = computed(() => options.value?.commodities || [])
const landTypeOptions = computed(() => options.value?.landTypes || [])
const regionOptions = computed(() => options.value?.regions || [])

// --- filter state (seeded to full range / all-selected once options load) -----
const filters = reactive({ fromYear: '', toYear: '', commodities: [], landTypes: [], regions: [] })

const commodityAllSelected = computed(() => commodityOptions.value.length > 0 && filters.commodities.length === commodityOptions.value.length)
const landAllSelected = computed(() => landTypeOptions.value.length > 0 && filters.landTypes.length === landTypeOptions.value.length)
const regionAllSelected = computed(() => regionOptions.value.length > 0 && filters.regions.length === regionOptions.value.length)

const summarize = (all, arr, allLabel) => {
  if (all) return allLabel
  if (arr.length === 0) return 'None selected'
  if (arr.length === 1) return arr[0]
  return `${arr.length} selected`
}
const commoditySummary = computed(() => summarize(commodityAllSelected.value, filters.commodities, 'All commodities'))
const landSummary = computed(() => summarize(landAllSelected.value, filters.landTypes, 'All land types'))
const regionSummary = computed(() => summarize(regionAllSelected.value, filters.regions, 'All regions'))

function seedFilters() {
  filters.fromYear = yearOptions.value[0] ?? ''
  filters.toYear = yearOptions.value[yearOptions.value.length - 1] ?? ''
  filters.commodities = [...commodityOptions.value]
  filters.landTypes = [...landTypeOptions.value]
  filters.regions = [...regionOptions.value]
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
  applyMulti('commodities', commodityOptions.value, 'commodities')
  applyMulti('landTypes', landTypeOptions.value, 'landTypes')
  applyMulti('regions', regionOptions.value, 'regions')
}

const ready = ref(false)
watchEffect(() => {
  if (ready.value || !options.value) return
  seedFilters()
  applyQueryToFilters()
  ready.value = true
})

// --- multi-select dropdowns ---------------------------------------------------
const commodityOpen = ref(false)
const landOpen = ref(false)
const regionOpen = ref(false)
const commodityRef = ref(null)
const landRef = ref(null)
const regionRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleCommodity(v) { filters.commodities = toggleIn(filters.commodities, v) }
function toggleLand(v) { filters.landTypes = toggleIn(filters.landTypes, v) }
function toggleRegion(v) { filters.regions = toggleIn(filters.regions, v) }
function toggleAllCommodities() { filters.commodities = commodityAllSelected.value ? [] : [...commodityOptions.value] }
function toggleAllLand() { filters.landTypes = landAllSelected.value ? [] : [...landTypeOptions.value] }
function toggleAllRegions() { filters.regions = regionAllSelected.value ? [] : [...regionOptions.value] }
function handleClickOutside(e) {
  if (commodityRef.value && !commodityRef.value.contains(e.target)) commodityOpen.value = false
  if (landRef.value && !landRef.value.contains(e.target)) landOpen.value = false
  if (regionRef.value && !regionRef.value.contains(e.target)) regionOpen.value = false
}

// Sticky headers + the widest commodity name for the band-column width.
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

// Collapse/expand commodity bands (breakout only). Reset when the breakout dimension changes,
// so a new breakout always starts expanded (otherwise stale collapsed keys hide the new rows).
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
const selectionEmpty = computed(() => !filters.commodities.length || !filters.landTypes.length || !filters.regions.length)
const filterQuery = computed(() => {
  const query = {}
  const ys = yearOptions.value
  if (filters.fromYear && filters.fromYear !== ys[0]) query.fromYear = String(filters.fromYear)
  if (filters.toYear && filters.toYear !== ys[ys.length - 1]) query.toYear = String(filters.toYear)
  if (!selectionEmpty.value) {
    if (filters.commodities.length < commodityOptions.value.length) query.commodities = filters.commodities.join(',')
    if (filters.landTypes.length < landTypeOptions.value.length) query.landTypes = filters.landTypes.join(',')
    if (filters.regions.length < regionOptions.value.length) query.regions = filters.regions.join(',')
  }
  if (hasBreakout.value) query.breakout = breakout.value
  return { query, empty: selectionEmpty.value }
})

// --- pivot data ---------------------------------------------------------------
const emptyPivot = () => ({ groupBy: 'commodity', breakout: null, measures: MEASURES, groups: [], totals: {}, recordCount: 0 })
const { data: pivot, pending } = await useAsyncData(
  'fs-pivot',
  async () => {
    if (!ready.value) return null
    const { query, empty } = filterQuery.value
    if (empty) return emptyPivot()
    return $fetch(`${apiUrl}/charts/federal-sales/pivot`, { query })
  },
  { watch: [() => JSON.stringify(filters), ready, breakout], dedupe: 'cancel' },
)

const groups = computed(() => pivot.value?.groups || [])
const totals = computed(() => pivot.value?.totals || {})
watch(pivot, () => nextTick(measureDimCol))

// Reflect the active filters into the URL once seeded (filterQuery already omits defaults).
useUrlFilterSync(() => filterQuery.value.query, ready, ['fromYear', 'toYear', 'commodities', 'landTypes', 'regions', 'breakout'])

// --- sorting ------------------------------------------------------------------
// Client-side sort of the commodity rows. The Commodity header sorts by name; each measure
// header by that measure's value. Default (sortKey null) keeps the endpoint ranking (sales
// value desc). In the breakout view this reorders the commodity bands; sub-rows keep their order.
const sortKey = ref(null) // null | 'commodity' | <measure key>
const sortDir = ref('desc')
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'commodity' ? 'asc' : 'desc'
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
  if (key === 'commodity') copy.sort((a, b) => dir * String(a.key).localeCompare(String(b.key)))
  else copy.sort((a, b) => dir * ((a.values?.[key] || 0) - (b.values?.[key] || 0)))
  return copy
})

function clearFilters() {
  seedFilters()
}

// --- CSV ----------------------------------------------------------------------
function downloadCsv() {
  const p = pivot.value
  if (!p?.groups?.length) return
  const head = ['Commodity', ...(dataBreakout.value ? [breakoutColLabel.value] : []), ...MEASURES.map((m) => m.short)]
  const rows = [head]
  const vals = (v) => MEASURES.map((m) => v?.[m.key] ?? '')
  for (const g of p.groups) {
    if (dataBreakout.value) {
      rows.push([g.key, 'All', ...vals(g.values)])
      for (const r of g.rows || []) rows.push([g.key, r.key, ...vals(r.values)])
    } else {
      rows.push([g.key, ...vals(g.values)])
    }
  }
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'federal-sales.csv'
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
    return `${apiUrl}/charts/federal-sales/export${qs ? `?${qs}` : ''}`
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

const colspanEmpty = computed(() => MEASURES.length + (grouped.value ? 2 : 1))
</script>

<template>
  <div class="margin-bottom-4">
    <!-- Filter bar -->
    <div class="filter-bar padding-2 margin-bottom-2">
      <div class="filter-bar__fields">
        <!-- Calendar-year range -->
        <div class="field">
          <label class="usa-label margin-top-0" for="fs-from">From</label>
          <select id="fs-from" v-model.number="filters.fromYear" class="usa-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="field">
          <label class="usa-label margin-top-0" for="fs-to">To</label>
          <select id="fs-to" v-model.number="filters.toYear" class="usa-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Commodity -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="fs-commodity">Commodity</label>
          <div ref="commodityRef" class="multi-select">
            <button id="fs-commodity" type="button" class="usa-select multi-select__trigger" :aria-expanded="commodityOpen" @click="commodityOpen = !commodityOpen">
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

        <!-- Land Type -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="fs-land">Land type</label>
          <div ref="landRef" class="multi-select">
            <button id="fs-land" type="button" class="usa-select multi-select__trigger" :aria-expanded="landOpen" @click="landOpen = !landOpen">
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

        <!-- State / Offshore Region -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="fs-region">State/Offshore Region</label>
          <div ref="regionRef" class="multi-select">
            <button id="fs-region" type="button" class="usa-select multi-select__trigger" :aria-expanded="regionOpen" @click="regionOpen = !regionOpen">
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

        <div class="field field--action">
          <button type="button" class="usa-button usa-button--unstyled" @click="clearFilters">Clear all filters</button>
        </div>
      </div>
    </div>

    <!-- Toolbar: breakout + collapse control (left), record count + CSV (right) -->
    <div class="table-toolbar table-toolbar--breakout">
      <div class="table-toolbar__group">
        <div class="breakout-control">
          <label class="usa-label margin-top-0" for="fs-breakout">Break out by</label>
          <select id="fs-breakout" v-model="breakout" class="usa-select breakout-select">
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
          <button type="button" class="usa-button usa-button--unstyled margin-left-2" :disabled="!groups.length" @click="downloadCsv">Download CSV</button>
        </template>
      </p>
    </div>

    <!-- Table: Commodity [| breakout] | six measure columns -->
    <div
      ref="wrapRef"
      class="data-table-wrap pivot margin-top-2"
      :class="{ 'pivot--flat': !grouped }"
      :style="{ '--thead-h': `${theadH}px`, '--dim-w': dimW ? `${dimW}px` : undefined }"
    >
      <table class="usa-table usa-table--compact width-full margin-bottom-0 margin-top-0">
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col" :aria-sort="ariaSort('commodity')">
              <button type="button" class="sort-btn" @click="setSort('commodity')">
                <span>Commodity</span>
                <svg class="usa-icon sort-icon" :class="{ 'sort-icon--active': sortState('commodity') }" aria-hidden="true" role="img">
                  <use :href="`/uswds/img/sprite.svg#${sortIcon('commodity')}`" />
                </svg>
              </button>
            </th>
            <th v-if="grouped" scope="col" class="breakout-col">{{ breakoutColLabel }}</th>
            <th v-for="m in MEASURES" :key="m.key" scope="col" class="text-right" :aria-sort="ariaSort(m.key)">
              <button type="button" class="sort-btn sort-btn--right" @click="setSort(m.key)">
                <abbr :title="m.full">{{ m.short }}</abbr>
                <svg class="usa-icon sort-icon" :class="{ 'sort-icon--active': sortState(m.key) }" aria-hidden="true" role="img">
                  <use :href="`/uswds/img/sprite.svg#${sortIcon(m.key)}`" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !groups.length">
            <td :colspan="colspanEmpty">No records match the current filters.</td>
          </tr>

          <!-- Breakout: commodity band -> collapsible sub-rows -> subtotal -->
          <template v-if="grouped">
            <template v-for="g in sortedGroups" :key="g.key">
              <tr class="group-row">
                <th scope="colgroup" :colspan="MEASURES.length + 2" class="group-head">
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
                  <td v-for="m in MEASURES" :key="m.key" class="text-right">{{ fmt(m, row.values[m.key]) }}</td>
                </tr>
                <tr class="subtotal-row">
                  <td class="dim-cell"></td>
                  <th scope="row" class="breakout-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                  <td v-for="m in MEASURES" :key="m.key" class="text-right">{{ fmt(m, g.values[m.key]) }}</td>
                </tr>
              </template>
            </template>
          </template>

          <!-- Flat: one row per commodity -->
          <template v-else>
            <tr v-for="(g, gi) in sortedGroups" :key="g.key" class="prod-row" :class="{ 'row-alt': gi % 2 === 1 }">
              <th scope="row" class="dim-cell prod-name">{{ g.key }}</th>
              <td v-for="m in MEASURES" :key="m.key" class="text-right">{{ fmt(m, g.values[m.key]) }}</td>
            </tr>
          </template>
        </tbody>
        <tfoot v-if="groups.length">
          <tr class="total-row">
            <th scope="row" :colspan="grouped ? 2 : 1">Total</th>
            <td v-for="m in MEASURES" :key="m.key" class="text-right">{{ fmt(m, totals[m.key]) }}</td>
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

  abbr { text-decoration: none; }
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
  min-width: 12rem;
  max-width: 20rem;
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

.text-right { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
