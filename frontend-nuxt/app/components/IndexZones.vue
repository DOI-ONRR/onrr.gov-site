<script setup>
import getIndexZones from '@/graphql/queries/collections/index_zones/getIndexZones.gql'

const { data } = await useAsyncQuery(getIndexZones)

const rows = computed(() => {
  const items = []
  for (const record of data.value?.index_zones ?? []) {
    const date = new Date(record.date)
    const year = date.getFullYear()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    for (const zone of record.index_zones ?? []) {
      items.push({
        indexZone: `${zone.index_zone} (${zone.abbreviation})`,
        year,
        month,
        price: zone.price,
      })
    }
  }
  return items
})

const selectedZone = ref('')
const selectedYears = ref([])
const yearsOpen = ref(false)
const yearsRef = ref(null)

const allZones = computed(() => {
  const zones = new Set()
  rows.value.forEach((r) => zones.add(r.indexZone))
  return [...zones].sort((a, b) => a.localeCompare(b))
})

const allYears = computed(() => {
  const years = new Set()
  rows.value.forEach((r) => years.add(r.year))
  return [...years].sort((a, b) => b - a)
})

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    if (selectedZone.value && r.indexZone !== selectedZone.value) return false
    if (selectedYears.value.length && !selectedYears.value.includes(r.year)) return false
    return true
  })
})

const PAGE_SIZE = 15
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredRows.value.length / PAGE_SIZE))

const displayedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const rangeStart = computed(() => (currentPage.value - 1) * PAGE_SIZE + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * PAGE_SIZE, filteredRows.value.length))

watch([selectedZone, selectedYears], () => {
  currentPage.value = 1
})

function formatPrice(value) {
  if (value == null) return ''
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function goToPage(page) {
  currentPage.value = page
}

function toggleYear(year) {
  const idx = selectedYears.value.indexOf(year)
  if (idx === -1) {
    selectedYears.value = [...selectedYears.value, year]
  } else {
    selectedYears.value = selectedYears.value.filter((y) => y !== year)
  }
}

function removeYear(year) {
  selectedYears.value = selectedYears.value.filter((y) => y !== year)
}

function handleClickOutside(e) {
  if (yearsRef.value && !yearsRef.value.contains(e.target)) {
    yearsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-3">
    <div class="grid-col-6">
      <label class="usa-label" for="index-zones-zone">Index Zone</label>
      <select
        id="index-zones-zone"
        v-model="selectedZone"
        class="usa-select"
      >
        <option value="">All Index Zones</option>
        <option v-for="zone in allZones" :key="zone" :value="zone">{{ zone }}</option>
      </select>
    </div>
    <div class="grid-col-6">
      <label class="usa-label" for="index-zones-years">Years</label>
      <div ref="yearsRef" class="multi-select">
        <button
          id="index-zones-years"
          type="button"
          class="usa-select multi-select__trigger"
          @click="yearsOpen = !yearsOpen"
        >
          <span v-if="!selectedYears.length" class="multi-select__placeholder">All Years</span>
          <span v-else class="multi-select__pills">
            <span
              v-for="year in selectedYears"
              :key="year"
              class="multi-select__pill"
              @click.stop="removeYear(year)"
            >
              {{ year }}
              <span class="multi-select__pill-remove" aria-hidden="true">&times;</span>
            </span>
          </span>
        </button>
        <ul v-show="yearsOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
          <li
            v-for="year in allYears"
            :key="year"
            role="option"
            :aria-selected="selectedYears.includes(year)"
            class="multi-select__option"
            :class="{ 'multi-select__option--selected': selectedYears.includes(year) }"
            @click="toggleYear(year)"
          >
            <input
              type="checkbox"
              :checked="selectedYears.includes(year)"
              tabindex="-1"
              class="multi-select__checkbox"
            />
            {{ year }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col style="width: 50%" />
      <col />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Index Zone</th>
        <th scope="col">Year</th>
        <th scope="col">Month</th>
        <th scope="col" class="text-right">Price</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in displayedRows" :key="i">
        <th scope="row">{{ row.indexZone }}</th>
        <td>{{ row.year }}</td>
        <td>{{ row.month }}</td>
        <td class="text-right">{{ formatPrice(row.price) }}</td>
      </tr>
    </tbody>
  </table>
  <div v-if="totalPages > 1" class="pagination-bar margin-top-2 margin-bottom-3">
    <span class="pagination-bar__info">
      Displaying {{ rangeStart }} - {{ rangeEnd }} of {{ filteredRows.length }} records
    </span>
    <nav aria-label="Pagination" class="usa-pagination">
      <ul class="usa-pagination__list">
        <li v-if="currentPage > 1" class="usa-pagination__item usa-pagination__arrow">
          <a
            href="javascript:void(0)"
            class="usa-pagination__link usa-pagination__previous-page"
            aria-label="Previous page"
            @click="goToPage(currentPage - 1)"
          >
            <svg class="usa-icon" aria-hidden="true" role="img">
              <use href="/uswds/img/sprite.svg#navigate_before" />
            </svg>
            <span class="usa-pagination__link-text">Previous</span>
          </a>
        </li>
        <template v-for="(page, i) in visiblePages" :key="i">
          <li v-if="page === '...'" class="usa-pagination__item usa-pagination__overflow" aria-label="ellipsis indicating non-visible pages">
            <span>&hellip;</span>
          </li>
          <li v-else class="usa-pagination__item usa-pagination__page-no">
            <a
              href="javascript:void(0)"
              class="usa-pagination__button"
              :class="{ 'usa-current': page === currentPage }"
              :aria-label="`Page ${page}`"
              :aria-current="page === currentPage ? 'page' : undefined"
              @click="goToPage(page)"
            >
              {{ page }}
            </a>
          </li>
        </template>
        <li v-if="currentPage < totalPages" class="usa-pagination__item usa-pagination__arrow">
          <a
            href="javascript:void(0)"
            class="usa-pagination__link usa-pagination__next-page"
            aria-label="Next page"
            @click="goToPage(currentPage + 1)"
          >
            <span class="usa-pagination__link-text">Next</span>
            <svg class="usa-icon" aria-hidden="true" role="img">
              <use href="/uswds/img/sprite.svg#navigate_next" />
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-bar__info {
  font-size: size('sans', 'sm');
  color: color('base-dark');
}

.pagination-bar .usa-pagination {
  margin: 0;
}

.usa-table--fixed {
  table-layout: fixed;
}

.usa-table tbody tr:nth-child(odd) {
  th, td {
    @include u-bg('base-lightest');
  }
}

.multi-select {
  position: relative;
}

.multi-select__trigger {
  display: flex;
  align-items: center;
  text-align: left;
  min-height: units(5);
  height: auto;
  cursor: pointer;
  white-space: normal;
}

.multi-select__placeholder {
  color: color('base');
}

.multi-select__pills {
  display: flex;
  flex-wrap: wrap;
  gap: units(0.5);
}

.multi-select__pill {
  display: inline-flex;
  align-items: center;
  gap: units(0.5);
  padding: units(0.5) units(1);
  background-color: color('primary');
  color: white;
  border-radius: units(0.5);
  font-size: size('sans', 'xs');
  line-height: 1;
}

.multi-select__pill-remove {
  cursor: pointer;
  font-weight: fw('bold');
}

.multi-select__dropdown {
  position: absolute;
  z-index: 400;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid color('base-lighter');
  list-style: none;
  padding: 0;
  margin: 0;
}

.multi-select__option {
  display: flex;
  align-items: center;
  gap: units(1);
  padding: units(1) units(1.5);
  cursor: pointer;
  font-size: size('sans', 'sm');

  &:hover {
    background-color: color('base-lightest');
  }

  &--selected {
    background-color: color('primary-lighter');
  }
}

.multi-select__checkbox {
  pointer-events: none;
  margin: 0;
}
</style>
