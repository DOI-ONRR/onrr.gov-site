<script setup>
import getIBMP from '@/graphql/queries/collections/pricing/ibmp/getIBMP.gql'

const { data } = await useAsyncQuery(getIBMP)

const rows = computed(() => {
  const items = []
  for (const record of data.value?.ibmp ?? []) {
    const date = new Date(record.date)
    const year = date.getFullYear()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    for (const row of record.ibmp_line_items ?? []) {
      items.push({
        designatedArea: row.designatedArea,
        year,
        month,
        condensate02: row.condensate02,
        sweet61: row.sweet61,
        sour62: row.sour62,
        asphaltic63: row.asphaltic63,
        blackWax64: row.blackWax64,
        yellowWax65: row.yellowWax65,
      })
    }
  }
  return items
})

const selectedArea = ref('')
const selectedYears = ref([])
const yearsOpen = ref(false)
const yearsRef = ref(null)

const allAreas = computed(() => {
  const areas = new Set()
  rows.value.forEach((r) => areas.add(r.designatedArea))
  return [...areas].sort((a, b) => a.localeCompare(b))
})

const allYears = computed(() => {
  const years = new Set()
  rows.value.forEach((r) => years.add(r.year))
  return [...years].sort((a, b) => b - a)
})

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    if (selectedArea.value && r.designatedArea !== selectedArea.value) return false
    if (selectedYears.value.length && !selectedYears.value.includes(r.year)) return false
    return true
  })
})

const {
  currentPage, totalPages, displayedItems: displayedRows,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredRows)

watch([selectedArea, selectedYears], () => {
  resetPage()
})

function formatPrice(value) {
  if (value == null || value === '') return ''
  if (isNaN(value)) return value
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
      <label class="usa-label" for="ibmp-area">Designated Area</label>
      <select
        id="ibmp-area"
        v-model="selectedArea"
        class="usa-select"
      >
        <option value="">All Areas</option>
        <option v-for="area in allAreas" :key="area" :value="area">{{ area }}</option>
      </select>
    </div>
    <div class="grid-col-6">
      <label class="usa-label" for="ibmp-years">Years</label>
      <div ref="yearsRef" class="multi-select">
        <button
          id="ibmp-years"
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
      <col style="width: 25%" />
      <col />
      <col />
      <col />
      <col />
      <col />
      <col />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Designated Area</th>
        <th scope="col">Year</th>
        <th scope="col">Month</th>
        <th scope="col" class="text-right">Condensate (02)</th>
        <th scope="col" class="text-right">Sweet (61)</th>
        <th scope="col" class="text-right">Sour (62)</th>
        <th scope="col" class="text-right">Asphaltic (63)</th>
        <th scope="col" class="text-right">Black Wax (64)</th>
        <th scope="col" class="text-right">Yellow Wax (65)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in displayedRows" :key="i">
        <th scope="row">{{ row.designatedArea }}</th>
        <td>{{ row.year }}</td>
        <td>{{ row.month }}</td>
        <td class="text-right">{{ formatPrice(row.condensate02) }}</td>
        <td class="text-right">{{ formatPrice(row.sweet61) }}</td>
        <td class="text-right">{{ formatPrice(row.sour62) }}</td>
        <td class="text-right">{{ formatPrice(row.asphaltic63) }}</td>
        <td class="text-right">{{ formatPrice(row.blackWax64) }}</td>
        <td class="text-right">{{ formatPrice(row.yellowWax65) }}</td>
      </tr>
    </tbody>
  </table>
  <PaginationBar
    class="margin-top-2 margin-bottom-3"
    :current-page="currentPage"
    :total-pages="totalPages"
    :visible-pages="visiblePages"
    :range-start="rangeStart"
    :range-end="rangeEnd"
    :total-items="totalItems"
    label="records"
    @page-change="goToPage"
  />
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

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
