<script setup>
/*
  DisbursementPreview — the "Preview and filter" panel for the Monthly Disbursements
  dataset, mirroring the dataset-page mockup. A horizontal filter bar (month range,
  recipient/source multi-selects, state, commodity) plus a group-by dimension drive a
  grouped PIVOT table: rows grouped by the chosen dimension, then calendar-year columns
  with collapsible monthly detail, plus subtotals and a grand total.

  All aggregation is server-side via `/charts/disbursement/pivot` (Directus endpoint
  extension) — the browser never crunches raw rows. Recipient labels are bucketed into
  the shared RECIPIENT_GROUPS; `source` is fund.source; state/commodity group directly.

  Multi-select semantics: every option starts selected (= all, no filter); a partial
  selection narrows, and clearing all shows nothing. Each recipient/source dropdown
  follows the app's shared `.multi-select` pattern — a usa-select trigger (showing
  "All X", the single label, or "N selected") over a listbox with a "Select all" toggle.
*/
const { apiUrl } = useRuntimeConfig().public

const GROUP_OPTIONS = [
  { key: 'recipient', label: 'Recipient' },
  { key: 'source', label: 'Source' },
  { key: 'state', label: 'State' },
  { key: 'commodity', label: 'Commodity' },
]

// --- formatting ---------------------------------------------------------------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function monthLabel(d) {
  if (!d) return '—'
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(dt.getTime()) ? d : `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}
function currency(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '$0'
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
// Negative amounts get the USWDS `text-secondary` color treatment.
const isNegative = (v) => Number(v) < 0

// --- filter dropdown options (loaded once from the endpoint) -------------------
const { data: options } = await useAsyncData('disb-pivot-options', () =>
  $fetch(`${apiUrl}/charts/disbursement/pivot/options`),
)
const recipientOptions = computed(() => options.value?.recipients || []) // [{ key, label }]
const sourceOptions = computed(() => options.value?.sources || []) // [string]
const recipientLabel = (key) => recipientOptions.value.find((r) => r.key === key)?.label || key

// --- filter state (recipients/sources seeded to all-selected once options load) --
const filters = reactive({
  groupBy: 'recipient',
  from: '',
  to: '',
  state: '',
  commodity: '',
  recipients: [],
  sources: [],
})

// Selection helpers: "all selected" = every option checked (the default). recipients
// hold RECIPIENT_GROUPS keys; sources hold raw fund.source values.
const allRecipientKeys = computed(() => recipientOptions.value.map((r) => r.key))
const recipAllSelected = computed(() => allRecipientKeys.value.length > 0 && filters.recipients.length === allRecipientKeys.value.length)
const sourceAllSelected = computed(() => sourceOptions.value.length > 0 && filters.sources.length === sourceOptions.value.length)
// Trigger summary: all -> "All X"; none -> "None selected"; one -> that label; else "N selected".
const recipSummary = computed(() => {
  const n = filters.recipients.length
  if (recipAllSelected.value) return 'All recipients'
  if (n === 0) return 'None selected'
  if (n === 1) return recipientLabel(filters.recipients[0])
  return `${n} selected`
})
const sourceSummary = computed(() => {
  const n = filters.sources.length
  if (sourceAllSelected.value) return 'All sources'
  if (n === 0) return 'None selected'
  if (n === 1) return filters.sources[0]
  return `${n} selected`
})

// One-shot: seed the month range once options load.
const ready = ref(false)
watchEffect(() => {
  if (ready.value || !options.value) return
  filters.from = options.value.months?.[0] || ''
  filters.to = options.value.months?.[options.value.months.length - 1] || ''
  // Default to everything selected (all boxes checked).
  filters.recipients = recipientOptions.value.map((r) => r.key)
  filters.sources = [...sourceOptions.value]
  ready.value = true
})

// --- multi-select dropdowns (recipients + sources) ----------------------------
const recipOpen = ref(false)
const sourceOpen = ref(false)
const recipRef = ref(null)
const sourceRef = ref(null)
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
function toggleRecipient(key) { filters.recipients = toggleIn(filters.recipients, key) }
function toggleSource(val) { filters.sources = toggleIn(filters.sources, val) }
// Select-all toggle: check every option, or clear when already all-selected.
function toggleAllRecipients() { filters.recipients = recipAllSelected.value ? [] : allRecipientKeys.value }
function toggleAllSources() { filters.sources = sourceAllSelected.value ? [] : [...sourceOptions.value] }
function handleClickOutside(e) {
  if (recipRef.value && !recipRef.value.contains(e.target)) recipOpen.value = false
  if (sourceRef.value && !sourceRef.value.contains(e.target)) sourceOpen.value = false
}

// Sticky group headers pin directly beneath the sticky thead. Measure the thead's
// actual height (rather than hardcode an offset) so there's no transparent gap —
// exposed as the `--thead-h` CSS var the .group-head `top` reads.
const wrapRef = ref(null)
const theadRef = ref(null)
const theadH = ref(0)
let theadObserver = null

// Size the (empty) dimension column to fit the widest group name, so a group header's
// text would fit within that column. The group names render in inline `.group-name`
// spans (their offsetWidth is the intrinsic text width, unlike the stretched button);
// take the max + room for the button's left padding, caret, and gap. Exposed as
// `--dim-w`. Re-measured whenever the pivot changes (new groups / dimension).
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

// Collapsed groups reset when the grouping dimension changes (keys differ).
const collapsed = ref(new Set())
watch(() => filters.groupBy, () => { collapsed.value = new Set() })
function toggle(key) {
  const s = new Set(collapsed.value)
  s.has(key) ? s.delete(key) : s.add(key)
  collapsed.value = s
}

// Expand/collapse-all button. "All collapsed" only when every group is collapsed, so
// the default (all expanded) offers "Collapse all"; once all are collapsed it flips to
// "Expand all". Acts on the current groups.
const allCollapsed = computed(() => groups.value.length > 0 && groups.value.every((g) => collapsed.value.has(g.key)))
function toggleAll() {
  collapsed.value = allCollapsed.value ? new Set() : new Set(groups.value.map((g) => g.key))
}

// --- pivot data ---------------------------------------------------------------
const { data: pivot, pending } = await useAsyncData(
  'disb-pivot',
  async () => {
    if (!ready.value) return null
    const query = { groupBy: filters.groupBy }
    if (filters.from) query.from = String(filters.from).slice(0, 10)
    if (filters.to) query.to = String(filters.to).slice(0, 10)
    if (filters.state) query.state = filters.state
    if (filters.commodity) query.commodity = filters.commodity
    // None selected -> empty result. All selected -> no filter (omit). Partial -> narrow.
    if (!filters.recipients.length || !filters.sources.length) {
      return { groupBy: filters.groupBy, years: [], groups: [], grandTotal: 0, recordCount: 0 }
    }
    if (filters.recipients.length < allRecipientKeys.value.length) query.recipients = filters.recipients.join(',')
    if (filters.sources.length < sourceOptions.value.length) query.sources = filters.sources.join(',')
    return $fetch(`${apiUrl}/charts/disbursement/pivot`, { query })
  },
  { watch: [() => JSON.stringify(filters), ready] },
)

const years = computed(() => pivot.value?.years || [])
const groups = computed(() => pivot.value?.groups || [])
const groupByLabel = computed(() => GROUP_OPTIONS.find((o) => o.key === filters.groupBy)?.label || 'Group')
// Column (per-year) totals across all groups, for the footer row.
const yearTotals = computed(() => {
  const t = {}
  for (const g of groups.value) for (const y of years.value) t[y] = (t[y] || 0) + (g.byYear[y] || 0)
  return t
})

// Re-measure the dimension column whenever the pivot changes (new groups / dimension).
watch(pivot, () => nextTick(measureDimCol))

function clearFilters() {
  filters.groupBy = 'recipient'
  filters.state = ''
  filters.commodity = ''
  filters.recipients = recipientOptions.value.map((r) => r.key)
  filters.sources = [...sourceOptions.value]
  filters.from = options.value?.months?.[0] || ''
  filters.to = options.value?.months?.[options.value.months.length - 1] || ''
}

function downloadCsv() {
  const p = pivot.value
  if (!p?.groups?.length) return
  const head = [groupByLabel.value, 'Month', ...p.years.map(String), 'Total']
  const rows = [head]
  for (const g of p.groups) {
    rows.push([g.key, 'All months', ...p.years.map((y) => g.byYear[y] ?? ''), g.total])
    for (const m of g.months) rows.push([g.key, m.monthName, ...p.years.map((y) => m.byYear[y] ?? ''), m.total])
  }
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `disbursements_by_${filters.groupBy}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Publish the current filtered selection to the dataset Download section (DatasetView
// provides the ref; DatasetDownloads' "filtered" card consumes it). The href points at
// the /charts/disbursement/export route — the same filter params as the pivot query, so
// it streams the raw records matching what the preview shows.
const datasetExport = inject('datasetPreviewExport', null)
if (datasetExport) {
  const exportHref = computed(() => {
    // Nothing selected → no export (matches the empty-result short-circuit).
    if (!filters.recipients.length || !filters.sources.length) return null
    const q = new URLSearchParams()
    if (filters.from) q.set('from', String(filters.from).slice(0, 10))
    if (filters.to) q.set('to', String(filters.to).slice(0, 10))
    if (filters.state) q.set('state', filters.state)
    if (filters.commodity) q.set('commodity', filters.commodity)
    if (filters.recipients.length < allRecipientKeys.value.length) q.set('recipients', filters.recipients.join(','))
    if (filters.sources.length < sourceOptions.value.length) q.set('sources', filters.sources.join(','))
    const qs = q.toString()
    return `${apiUrl}/charts/disbursement/export${qs ? `?${qs}` : ''}`
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
    <!-- Horizontal filter bar (full width, above the table) -->
    <div class="filter-bar padding-2 margin-bottom-2">
      <div class="filter-bar__fields">
        <div class="field">
          <label class="usa-label margin-top-0" for="f-from">From</label>
          <select id="f-from" v-model="filters.from" class="usa-select">
            <option v-for="m in options?.months" :key="m" :value="m">{{ monthLabel(m) }}</option>
          </select>
        </div>

        <div class="field">
          <label class="usa-label margin-top-0" for="f-to">To</label>
          <select id="f-to" v-model="filters.to" class="usa-select">
            <option v-for="m in options?.months" :key="m" :value="m">{{ monthLabel(m) }}</option>
          </select>
        </div>

        <!-- Recipients: usa-select-styled multi-select dropdown -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="f-recipients">Recipients</label>
          <div ref="recipRef" class="multi-select">
            <button
              id="f-recipients"
              type="button"
              class="usa-select multi-select__trigger"
              :aria-expanded="recipOpen"
              @click="recipOpen = !recipOpen"
            >
              <span :class="{ 'multi-select__placeholder': recipAllSelected }">{{ recipSummary }}</span>
            </button>
            <ul v-show="recipOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li
                role="option"
                :aria-selected="recipAllSelected"
                class="multi-select__option multi-select__option--all"
                :class="{ 'multi-select__option--selected': recipAllSelected }"
                @click="toggleAllRecipients"
              >
                <input type="checkbox" :checked="recipAllSelected" tabindex="-1" class="multi-select__checkbox">
                Select all
              </li>
              <li
                v-for="r in recipientOptions"
                :key="r.key"
                role="option"
                :aria-selected="filters.recipients.includes(r.key)"
                class="multi-select__option"
                :class="{ 'multi-select__option--selected': filters.recipients.includes(r.key) }"
                @click="toggleRecipient(r.key)"
              >
                <input type="checkbox" :checked="filters.recipients.includes(r.key)" tabindex="-1" class="multi-select__checkbox">
                {{ r.label }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Sources: usa-select-styled multi-select dropdown -->
        <div class="field field--wide">
          <label class="usa-label margin-top-0" for="f-sources">Sources</label>
          <div ref="sourceRef" class="multi-select">
            <button
              id="f-sources"
              type="button"
              class="usa-select multi-select__trigger"
              :aria-expanded="sourceOpen"
              @click="sourceOpen = !sourceOpen"
            >
              <span :class="{ 'multi-select__placeholder': sourceAllSelected }">{{ sourceSummary }}</span>
            </button>
            <ul v-show="sourceOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
              <li
                role="option"
                :aria-selected="sourceAllSelected"
                class="multi-select__option multi-select__option--all"
                :class="{ 'multi-select__option--selected': sourceAllSelected }"
                @click="toggleAllSources"
              >
                <input type="checkbox" :checked="sourceAllSelected" tabindex="-1" class="multi-select__checkbox">
                Select all
              </li>
              <li
                v-for="s in sourceOptions"
                :key="s"
                role="option"
                :aria-selected="filters.sources.includes(s)"
                class="multi-select__option"
                :class="{ 'multi-select__option--selected': filters.sources.includes(s) }"
                @click="toggleSource(s)"
              >
                <input type="checkbox" :checked="filters.sources.includes(s)" tabindex="-1" class="multi-select__checkbox">
                {{ s }}
              </li>
            </ul>
          </div>
        </div>

        <div class="field">
          <label class="usa-label margin-top-0" for="f-state">State</label>
          <select id="f-state" v-model="filters.state" class="usa-select">
            <option value="">All states</option>
            <option v-for="v in options?.states" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>

        <div class="field">
          <label class="usa-label margin-top-0" for="f-com">Commodity</label>
          <select id="f-com" v-model="filters.commodity" class="usa-select">
            <option value="">All commodities</option>
            <option v-for="v in options?.commodities" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>

        <div class="field field--action">
          <button type="button" class="usa-button usa-button--unstyled" @click="clearFilters">
            Clear all filters
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbar just above the table: unlabeled group-by + results/total -->
    <div class="table-toolbar">
      <div class="table-toolbar__group">
        <select
          v-model="filters.groupBy"
          class="usa-select group-select"
          aria-label="Group results by"
        >
          <option v-for="o in GROUP_OPTIONS" :key="o.key" :value="o.key">{{ o.label }}</option>
        </select>
        <button
          type="button"
          class="usa-button usa-button--outline"
          :disabled="!groups.length"
          @click="toggleAll"
        >{{ allCollapsed ? 'Expand all' : 'Collapse all' }}</button>
      </div>
      <p class="results-line margin-0" aria-live="polite">
        <template v-if="pending">Loading…</template>
        <template v-else>
          <strong>{{ (pivot?.recordCount || 0).toLocaleString() }}</strong> records ·
          <strong>{{ currency(pivot?.grandTotal) }}</strong> total disbursed, grouped by {{ groupByLabel }}
          <button
            type="button"
            class="usa-button usa-button--unstyled margin-left-2"
            :disabled="!groups.length"
            @click="downloadCsv"
          >Download CSV</button>
        </template>
      </p>
    </div>

    <!-- Full-width pivot table -->
    <div
      ref="wrapRef"
      class="data-table-wrap"
      :style="{ '--thead-h': theadH ? `${theadH}px` : undefined, '--dim-w': dimW ? `${dimW}px` : undefined }"
    >
      <table class="usa-table usa-table--compact width-full margin-y-0 pivot">
        <caption class="usa-sr-only">
          Disbursement totals grouped by {{ groupByLabel }}, with calendar-year columns and
          collapsible monthly detail. Reflects the current filters.
        </caption>
        <thead ref="theadRef">
          <tr>
            <th scope="col" class="dim-col">{{ groupByLabel }}</th>
            <th scope="col" class="month-col">Month</th>
            <th v-for="y in years" :key="y" scope="col" class="text-right">{{ y }}</th>
            <th scope="col" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pending && !groups.length">
            <td :colspan="years.length + 3">No records match the current filters.</td>
          </tr>
          <template v-for="g in groups" :key="g.key">
            <!-- Group header: a full-width light-violet band; the whole row toggles the
                 group (a full-width unstyled button keeps it keyboard-accessible). Sticks
                 below the thead while scrolling until the next header pushes it up. -->
            <tr class="group-row">
              <th scope="colgroup" :colspan="years.length + 3" class="group-head">
                <button
                  type="button"
                  class="group-toggle"
                  :aria-expanded="!collapsed.has(g.key)"
                  @click="toggle(g.key)"
                >
                  <span aria-hidden="true" class="caret">{{ collapsed.has(g.key) ? '▸' : '▾' }}</span>
                  <span class="group-name">{{ g.key }}</span>
                </button>
              </th>
            </tr>
            <template v-if="!collapsed.has(g.key)">
              <tr v-for="m in g.months" :key="`${g.key}-${m.month}`" class="month-row">
                <td class="dim-cell"></td>
                <td class="month-cell">{{ m.monthName }}</td>
                <td v-for="y in years" :key="y" class="text-right" :class="{ 'text-secondary': isNegative(m.byYear[y]) }">{{ m.byYear[y] ? currency(m.byYear[y]) : '—' }}</td>
                <td class="text-right" :class="{ 'text-secondary': isNegative(m.total) }">{{ currency(m.total) }}</td>
              </tr>
              <!-- Group subtotal: "Subtotal:" in the month column; highlighted values. -->
              <tr class="subtotal-row">
                <td class="dim-cell"></td>
                <th scope="row" class="month-cell subtotal-label">Subtotal:<span class="usa-sr-only"> {{ g.key }}</span></th>
                <td v-for="y in years" :key="y" class="text-right" :class="{ 'text-secondary': isNegative(g.byYear[y]) }">{{ currency(g.byYear[y]) }}</td>
                <td class="text-right" :class="{ 'text-secondary': isNegative(g.total) }">{{ currency(g.total) }}</td>
              </tr>
            </template>
          </template>
        </tbody>
        <tfoot v-if="groups.length">
          <tr class="total-row">
            <th scope="row" colspan="2">Total</th>
            <td v-for="y in years" :key="y" class="text-right" :class="{ 'text-secondary': isNegative(yearTotals[y]) }">{{ currency(yearTotals[y]) }}</td>
            <td class="text-right" :class="{ 'text-secondary': isNegative(pivot?.grandTotal) }">{{ currency(pivot?.grandTotal) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

// Horizontal filter bar: fields wrap and share the row, aligned at their baselines.
.filter-bar {
  background: #f0f0f0;
  border-radius: 4px;
}
.filter-bar__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: flex-end;
}
.field {
  flex: 1 1 10rem;
  min-width: 9rem;

  .usa-label { font-size: 0.82rem; margin-bottom: 0.25rem; }
  .usa-select { margin-top: 0; }
}
.field--wide { flex: 2 1 15rem; }
.field--action { flex: 0 0 auto; display: flex; align-items: flex-end; }

// "Select all" row atop each multi-select dropdown, ruled off from the options.
.multi-select__option--all { font-weight: 700; border-bottom: 1px solid #dfe1e2; }

// Toolbar row above the table: group-by select (left) + results line (right).
.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}
// Left cluster: group-by select + expand/collapse-all button.
.table-toolbar__group { display: flex; align-items: center; gap: 0.5rem; }
.table-toolbar__group .usa-button { margin: 0; }
.group-select { width: auto; min-width: 12rem; margin: 0; }
.results-line { font-size: 0.95rem; }

.data-table-wrap {
  max-height: 36rem;
  overflow: auto;
  // Isolate the scroll container's layout: without this, a pivot taller than max-height
  // leaks its full (scrolled) height into the document, adding blank space past the footer.
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

// Each row type sets its own background under `.pivot`, which outranks the app-wide
// zebra/borderless `_tables.scss` (it targets `.usa-table tbody tr:nth-child(even)`,
// so a plain `.pivot .row` selector wins on specificity).

// Leading dimension column (headed by the group-by label) + month column: the group
// identity lives in the spanning violet band, so the dimension cells are empty — but
// the column keeps an explicit, reserved width so it's consistent top-to-bottom and the
// month labels sit one column over (not under the group-by header).
// min-width (not width): in `table-layout: auto` a specified `width` on a column that
// a colspan cell also spans gets ignored, but min-width is honored — so the empty
// dimension column holds its reserved width both in the header and every body row.
.dim-col,
.dim-cell { min-width: var(--dim-w, 12rem); }
.dim-col { white-space: nowrap; }
.month-col { width: 1%; white-space: nowrap; } // hug the month labels

// Group header: full-width light-violet band, entire row clickable (the button fills
// the spanning cell), no link styling — plain bold text with the brand caret. Sticky
// below the thead; an OPAQUE violet (mix, not rgba) so scrolled rows don't bleed through.
.pivot .group-head {
  padding: 0;
  background: mix($onrr-violet, #fff, 12%);
  position: sticky;
  // Flush beneath the sticky thead: --thead-h is its measured height (JS); the -1px
  // overlap prevents a sub-pixel transparent gap that would let rows show through.
  top: calc(var(--thead-h, 2.5rem) - 1px);
  z-index: 1; // under the thead (z-index 2)
}
.group-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  font-weight: 700;
  color: #1b1b1b;

  &:hover { background: mix($onrr-violet, #fff, 22%); }
  &:focus-visible { outline: 2px solid $onrr-violet; outline-offset: -2px; }
}
.group-row .caret { display: inline-block; width: 1em; color: $onrr-violet; }

// Month detail rows: plain white cells; the month label in its own column.
.pivot .month-row > th,
.pivot .month-row > td { background: #fff; font-weight: 400; }
.month-cell { padding-left: 0.5rem; white-space: nowrap; color: #3d4551; }

// Group subtotal: "Subtotal:" label in the month column; highlighted (bold) values.
.pivot .subtotal-row > th,
.pivot .subtotal-row > td {
  background: #fff;
  font-weight: 700;
  border-top: 1px solid #dfe1e2;
}
.subtotal-label { color: #1b1b1b; }

// Overall total (table footer).
.pivot .total-row > th,
.pivot .total-row > td {
  background: #f9fafb;
  font-weight: 700;
  border-top: 2px solid #565c65;
}

.text-right { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
