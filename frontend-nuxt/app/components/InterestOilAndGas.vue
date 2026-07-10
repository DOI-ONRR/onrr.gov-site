<script setup>
import getInterestOilAndGas from '@/graphql/queries/collections/late_payment_interest/interest_oil_and_gas/getInterestOilAndGas.gql'

// Preview-aware: published-only live, published + draft when previewing.
const { statuses } = usePreview()
const { data } = await useAsyncQuery(getInterestOilAndGas, { statuses: statuses.value })

const rows = computed(() => data.value?.Interest_Oil_and_Gas ?? [])

const {
  currentPage, totalPages, displayedItems: displayedRows,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage,
} = usePagination(rows, 10)
</script>

<template>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col style="width: 25%" />
      <col />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Period</th>
        <th scope="col">Indian Late and Underpayments</th>
        <th scope="col">Federal Late and Underpayments</th>
        <th scope="col">Federal Overpayments</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in displayedRows" :key="row.id">
        <th scope="row">{{ row.Period }}</th>
        <td>{{ row.Indian_Late_and_Underpayments }}</td>
        <td>{{ row.Federal_Late_and_Underpayments }}</td>
        <td>{{ row.Federal_Overpayments }}</td>
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
</style>
