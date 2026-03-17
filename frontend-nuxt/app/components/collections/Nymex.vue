<script setup>
import getNYMEX from '@/graphql/queries/collections/pricing/NYMEX/getNYMEX.gql'

const { data } = await useAsyncQuery(getNYMEX)

const rows = computed(() => {
  return (data.value?.NYMEX ?? []).map((record) => {
    const date = new Date(record.date)
    return {
      year: date.getFullYear(),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      average: record.average,
      roll: record.roll,
      excelFile: record.excel_file?.filename_download ?? null,
    }
  })
})

const allYears = computed(() => {
  const years = new Set()
  rows.value.forEach((r) => years.add(r.year))
  return [...years].sort((a, b) => b - a)
})

const selectedYear = ref(null)

watch(allYears, (years) => {
  if (selectedYear.value == null && years.length) {
    selectedYear.value = years[0]
  }
}, { immediate: true })

const filteredRows = computed(() => {
  if (!selectedYear.value) return rows.value
  return rows.value.filter((r) => r.year === Number(selectedYear.value))
})

const {
  currentPage, totalPages, displayedItems: displayedRows,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredRows)

watch(selectedYear, () => {
  resetPage()
})

function formatPrice(value) {
  if (value == null || value === '') return ''
  if (isNaN(value)) return value
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-5">
    <div class="grid-col-6">
      <label class="usa-label" for="nymex-year">Year</label>
      <select
        id="nymex-year"
        v-model="selectedYear"
        class="usa-select"
      >
        <option v-for="year in allYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>
  </div>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col />
      <col />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Month</th>
        <th scope="col" class="text-right">Calendar Month Avg.</th>
        <th scope="col" class="text-right">NYMEX Roll</th>
        <th scope="col">Excel File</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in displayedRows" :key="i">
        <th scope="row">{{ row.month }}</th>
        <td class="text-right">{{ formatPrice(row.average) }}</td>
        <td class="text-right">{{ formatPrice(row.roll) }}</td>
        <td>
          <a
            v-if="row.excelFile"
            :href="`/document/${row.excelFile}`"
            class="usa-link download-link"
          >
            Download
            <span class="excel-icon" aria-hidden="true"></span>
          </a>
        </td>
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

.download-link {
  display: inline-flex;
  align-items: center;
  gap: units(0.5);
}

.usa-table tbody tr:nth-child(odd) {
  th, td {
    @include u-bg('base-lightest');
  }
}
</style>
