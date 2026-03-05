<script setup>
import getRevenueHandbook from '@/graphql/queries/collections/handbooks/revenue_handbook/getRevenueHandbook.gql'
import getProductionHandbook from '@/graphql/queries/collections/handbooks/production_handbook/getProductionHandbook.gql'
import getSolidMineralsHandbook from '@/graphql/queries/collections/handbooks/solid_minerals_handbook/getSolidMineralsHandbook.gql'
import getGeothermalClass1 from '@/graphql/queries/collections/handbooks/geothermal_class_1/getGeothermalClass1.gql'
import getGeothermalClass23 from '@/graphql/queries/collections/handbooks/geothermal_class_2_3/getGeothermalClass23.gql'

const props = defineProps({
  collection: { type: String, required: true },
})

const queries = {
  revenue_handbook: getRevenueHandbook,
  production_handbook: getProductionHandbook,
  solid_minerals_handbook: getSolidMineralsHandbook,
  geothermal_class_1: getGeothermalClass1,
  geothermal_class_2_3: getGeothermalClass23,
}

const { data } = await useAsyncQuery(queries[props.collection])

const rows = computed(() =>
  (data.value?.[props.collection] ?? []).map((r) => ({
    id: r.id,
    chapter: r.chapter,
    section: r.section,
    title: r.title,
    tocPage: r.toc_page,
    pageUrl: r.url && r.actual_page ? `${r.url}#${r.actual_page}` : null,
  }))
)

const searchText = ref('')

const filteredRows = computed(() => {
  if (!searchText.value) return rows.value
  const query = searchText.value.toLowerCase()
  return rows.value.filter((r) => r.title?.toLowerCase().includes(query))
})

const {
  currentPage, totalPages, displayedItems: displayedRows,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredRows, 10)

watch(searchText, () => {
  resetPage()
})
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-6">
    <div class="grid-col-6">
      <label class="usa-label" :for="`${collection}-search`">Search</label>
      <input
        :id="`${collection}-search`"
        v-model="searchText"
        class="usa-input"
        type="text"
        placeholder="Search by title"
      />
    </div>
  </div>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col style="width: 10%" />
      <col style="width: 10%" />
      <col style="width: 65%" />
      <col style="width: 15%" />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Chapter</th>
        <th scope="col">Section</th>
        <th scope="col">Title</th>
        <th scope="col">Page</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in displayedRows" :key="row.id">
        <td>{{ row.chapter }}</td>
        <td>{{ row.section }}</td>
        <td>{{ row.title }}</td>
        <td>
          <a
            v-if="row.pageUrl"
            :href="row.pageUrl"
            target="_blank"
            class="usa-link"
          >
            {{ row.tocPage }}
          </a>
          <span v-else>{{ row.tocPage }}</span>
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

.usa-table tbody tr:nth-child(odd) {
  th, td {
    @include u-bg('base-lightest');
  }
}
</style>
