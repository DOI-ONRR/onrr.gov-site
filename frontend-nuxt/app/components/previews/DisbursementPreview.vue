<script setup>
/*
  DisbursementPreview — the "Preview and filter" panel for the Monthly
  Disbursements dataset. One static preview component per dataset (selected via
  dataset_metadata.preview_component); filters and columns are fixed here, but the
  data is queried live from Directus REST (deep filter / sort / paginate / count /
  sum over the `disbursement` collection). No custom endpoint — the collections are
  publicly readable.
*/
const { apiUrl } = useRuntimeConfig().public

const PAGE_SIZE = 20

// Static column config (field path on `disbursement`, label, display format).
const COLUMNS = [
  { key: 'period.period_date', label: 'Month', format: 'month' },
  { key: 'fund.type', label: 'Fund type' },
  { key: 'location.land_category', label: 'Land category' },
  { key: 'location.state_name', label: 'State' },
  { key: 'location.county', label: 'County' },
  { key: 'fund.disbursement_type', label: 'Category' },
  { key: 'commodity.name', label: 'Commodity' },
  { key: 'amount', label: 'Disbursement', format: 'currency', numeric: true },
]

const filters = reactive({ from: '', to: '', fundType: '', landCat: '', state: '', category: '', commodity: '' })
const page = ref(1)
const sortKey = ref('period.period_date')
const sortDir = ref('desc') // 'asc' | 'desc'
const sortParam = computed(() => (sortDir.value === 'desc' ? '-' : '') + sortKey.value)

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
  // minus before the "$" so negatives read "-$1,234".
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
function getPath(row, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), row)
}
function cell(row, col) {
  const v = getPath(row, col.key)
  if (v == null || v === '') return '—'
  if (col.format === 'month') return monthLabel(v)
  if (col.format === 'currency') return currency(v)
  return v
}

// --- filter → Directus filter object ------------------------------------------
function buildFilter() {
  const and = [{ period: { type: { _eq: 'Monthly' } } }]
  if (filters.from) and.push({ period: { period_date: { _gte: filters.from } } })
  if (filters.to) and.push({ period: { period_date: { _lte: filters.to } } })
  if (filters.fundType) and.push({ fund: { type: { _eq: filters.fundType } } })
  if (filters.landCat) and.push({ location: { land_category: { _eq: filters.landCat } } })
  if (filters.state) and.push({ location: { state_name: { _eq: filters.state } } })
  if (filters.category) and.push({ fund: { disbursement_type: { _eq: filters.category } } })
  if (filters.commodity) and.push({ commodity: { name: { _eq: filters.commodity } } })
  return { _and: and }
}

// --- filter dropdown options (loaded once; distinct values per dimension) ------
const { data: options } = await useAsyncData('disb-preview-options', async () => {
  const distinct = (coll, field, extra = {}) =>
    $fetch(`${apiUrl}/items/${coll}`, {
      query: { groupBy: field, aggregate: JSON.stringify({ count: ['id'] }), sort: field, limit: -1, ...extra },
    }).then((r) => (r.data || []).map((x) => x[field]).filter((v) => v != null && v !== ''))

  const [months, fundTypes, landCats, states, categories, commodities] = await Promise.all([
    $fetch(`${apiUrl}/items/period`, {
      query: {
        filter: JSON.stringify({ type: { _eq: 'Monthly' } }),
        fields: 'period_date', sort: 'period_date', limit: -1,
      },
    }).then((r) => (r.data || []).map((x) => x.period_date).filter(Boolean)),
    distinct('fund', 'type'),
    distinct('location', 'land_category'),
    distinct('location', 'state_name'),
    distinct('fund', 'disbursement_type'),
    distinct('commodity', 'name'),
  ])
  return { months, fundTypes, landCats, states, categories, commodities }
})

// Default the month range to the full span once options load.
watchEffect(() => {
  const m = options.value?.months
  if (m?.length && !filters.from && !filters.to) {
    filters.from = m[0]
    filters.to = m[m.length - 1]
  }
})

// --- records + count + total --------------------------------------------------
watch(() => JSON.stringify(filters), () => { page.value = 1 })

const { data: result, pending } = await useAsyncData(
  'disb-preview-records',
  async () => {
    const filter = buildFilter()
    const [list, agg] = await Promise.all([
      $fetch(`${apiUrl}/items/disbursement`, {
        query: {
          fields: ['id', 'amount', ...COLUMNS.map((c) => c.key)].join(','),
          filter: JSON.stringify(filter),
          sort: sortParam.value,
          limit: PAGE_SIZE,
          page: page.value,
          meta: 'filter_count',
        },
      }),
      $fetch(`${apiUrl}/items/disbursement`, {
        query: { aggregate: JSON.stringify({ sum: ['amount'] }), filter: JSON.stringify(filter) },
      }),
    ])
    return {
      rows: list.data || [],
      count: list.meta?.filter_count ?? 0,
      total: Number(agg.data?.[0]?.sum?.amount) || 0,
    }
  },
  { watch: [() => JSON.stringify(filters), page, sortParam] }
)

const pageCount = computed(() => Math.max(1, Math.ceil((result.value?.count || 0) / PAGE_SIZE)))
const rangeStart = computed(() => (result.value?.count ? (page.value - 1) * PAGE_SIZE + 1 : 0))
const rangeEnd = computed(() => Math.min(page.value * PAGE_SIZE, result.value?.count || 0))
// Windowed page numbers (current ±2), like the mockup pager.
const pageWindow = computed(() => {
  const pages = []
  for (let p = Math.max(1, page.value - 2); p <= Math.min(pageCount.value, page.value + 2); p++) pages.push(p)
  return pages
})

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'amount' || key === 'period.period_date' ? 'desc' : 'asc'
  }
}
function goTo(p) {
  page.value = Math.min(pageCount.value, Math.max(1, p))
}
function clearFilters() {
  const m = options.value?.months
  filters.fundType = filters.landCat = filters.state = filters.category = filters.commodity = ''
  filters.from = m?.[0] || ''
  filters.to = m?.[m.length - 1] || ''
}
</script>

<template>
  <div class="grid-row grid-gap">
    <!-- Filter panel -->
    <div class="tablet:grid-col-3">
      <div class="filter-panel padding-2">
        <h3 class="margin-top-0 font-heading-sm">Filter records</h3>

        <label class="usa-label" for="f-from">From</label>
        <select id="f-from" v-model="filters.from" class="usa-select">
          <option v-for="m in options?.months" :key="m" :value="m">{{ monthLabel(m) }}</option>
        </select>
        <label class="usa-label" for="f-to">To</label>
        <select id="f-to" v-model="filters.to" class="usa-select">
          <option v-for="m in options?.months" :key="m" :value="m">{{ monthLabel(m) }}</option>
        </select>

        <label class="usa-label" for="f-fund">Fund type</label>
        <select id="f-fund" v-model="filters.fundType" class="usa-select">
          <option value="">All fund types</option>
          <option v-for="v in options?.fundTypes" :key="v" :value="v">{{ v }}</option>
        </select>

        <label class="usa-label" for="f-land">Land category</label>
        <select id="f-land" v-model="filters.landCat" class="usa-select">
          <option value="">All land categories</option>
          <option v-for="v in options?.landCats" :key="v" :value="v">{{ v }}</option>
        </select>

        <label class="usa-label" for="f-state">State</label>
        <select id="f-state" v-model="filters.state" class="usa-select">
          <option value="">All states</option>
          <option v-for="v in options?.states" :key="v" :value="v">{{ v }}</option>
        </select>

        <label class="usa-label" for="f-cat">Payment category</label>
        <select id="f-cat" v-model="filters.category" class="usa-select">
          <option value="">All categories</option>
          <option v-for="v in options?.categories" :key="v" :value="v">{{ v }}</option>
        </select>

        <label class="usa-label" for="f-com">Commodity</label>
        <select id="f-com" v-model="filters.commodity" class="usa-select">
          <option value="">All commodities</option>
          <option v-for="v in options?.commodities" :key="v" :value="v">{{ v }}</option>
        </select>

        <button type="button" class="usa-button usa-button--unstyled margin-top-2" @click="clearFilters">
          Clear all filters
        </button>
      </div>
    </div>

    <!-- Results -->
    <div class="tablet:grid-col-9">
      <p class="results-line" aria-live="polite">
        <template v-if="pending">Loading…</template>
        <template v-else>
          Showing <strong>{{ rangeStart.toLocaleString() }}–{{ rangeEnd.toLocaleString() }}</strong>
          of <strong>{{ (result?.count || 0).toLocaleString() }}</strong> records ·
          <strong>{{ currency(result?.total) }}</strong> total disbursed
        </template>
      </p>

      <div class="data-table-wrap">
        <table class="usa-table usa-table--compact usa-table--striped width-full margin-top-0">
          <caption class="usa-sr-only">
            Disbursement records matching current filters. Column headers sort the table.
          </caption>
          <thead>
            <tr>
              <th
                v-for="col in COLUMNS"
                :key="col.key"
                scope="col"
                :class="{ 'text-right': col.numeric }"
                :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
              >
                <button type="button" class="usa-button usa-button--unstyled sort-btn" @click="setSort(col.key)">
                  {{ col.label }}
                  <span aria-hidden="true">{{ sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!pending && !result?.rows.length">
              <td :colspan="COLUMNS.length">No records match the current filters.</td>
            </tr>
            <tr v-for="row in result?.rows" :key="row.id">
              <td v-for="col in COLUMNS" :key="col.key" :class="{ 'text-right': col.numeric }">
                {{ cell(row, col) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="pageCount > 1" aria-label="Results pagination" class="usa-pagination">
        <ul class="usa-pagination__list">
          <li v-if="page > 1" class="usa-pagination__item">
            <button type="button" class="usa-pagination__button" @click="goTo(page - 1)">‹ Prev</button>
          </li>
          <li v-if="pageWindow[0] > 1" class="usa-pagination__item">
            <button type="button" class="usa-pagination__button" @click="goTo(1)">1</button>
          </li>
          <li v-for="p in pageWindow" :key="p" class="usa-pagination__item">
            <button
              type="button"
              class="usa-pagination__button"
              :class="{ 'usa-current': p === page }"
              :aria-current="p === page ? 'page' : undefined"
              @click="goTo(p)"
            >{{ p.toLocaleString() }}</button>
          </li>
          <li v-if="pageWindow[pageWindow.length - 1] < pageCount" class="usa-pagination__item">
            <button type="button" class="usa-pagination__button" @click="goTo(pageCount)">
              {{ pageCount.toLocaleString() }}
            </button>
          </li>
          <li v-if="page < pageCount" class="usa-pagination__item">
            <button type="button" class="usa-pagination__button" @click="goTo(page + 1)">Next ›</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-panel {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  background: #f9fafb;
}

.data-table-wrap {
  max-height: 32rem;
  overflow: auto;
  border: 1px solid #dfe1e2;

  thead th {
    position: sticky;
    top: 0;
    background: #f0f0f0;
    z-index: 2;
    white-space: nowrap;
  }
}

.sort-btn {
  font-weight: 700;
  text-align: inherit;
}
</style>
