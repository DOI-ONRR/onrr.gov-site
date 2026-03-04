<script setup>
import getPlantSpecificUCAs from '@/graphql/queries/collections/plant_specific_ucas/getPlantSpecificUCAs.gql'

const { data } = await useAsyncQuery(getPlantSpecificUCAs)

const rows = computed(() =>
  (data.value?.plant_specific_ucas ?? []).map((r) => ({
    id: r.id,
    name: r.transportation_system_or_gas_plant,
    fileUrl: r.file?.folder?.name && r.file?.filename_download
      ? `/${r.file.folder.name}/${r.file.filename_download}`
      : null,
    type: r.type,
    operator: r.operator,
    location: r.location,
    docDate: r.doc_date,
  }))
)

const searchText = ref('')

const filteredRows = computed(() => {
  if (!searchText.value) return rows.value
  const query = searchText.value.toLowerCase()
  return rows.value.filter((r) =>
    r.name?.toLowerCase().includes(query)
    || r.type?.toLowerCase().includes(query)
    || r.operator?.toLowerCase().includes(query)
    || r.location?.toLowerCase().includes(query)
  )
})

const {
  currentPage, totalPages, displayedItems: displayedRows,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredRows)

watch(searchText, () => {
  resetPage()
})

function formatDocDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-3">
    <div class="grid-col-6">
      <label class="usa-label" for="plant-ucas-search">Search table</label>
      <input
        id="plant-ucas-search"
        v-model="searchText"
        class="usa-input"
        type="text"
        placeholder="Search table"
      />
    </div>
  </div>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col style="width: 30%" />
      <col />
      <col />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Transportation system or gas plant</th>
        <th scope="col">Type</th>
        <th scope="col">Operator</th>
        <th scope="col">Location</th>
        <th scope="col">Doc Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in displayedRows" :key="row.id">
        <th scope="row">
          <a
            v-if="row.fileUrl"
            :href="row.fileUrl"
            class="usa-link"
          >
            {{ row.name }}
          </a>
          <span v-else>{{ row.name }}</span>
        </th>
        <td>{{ row.type }}</td>
        <td>{{ row.operator }}</td>
        <td>{{ row.location }}</td>
        <td>{{ formatDocDate(row.docDate) }}</td>
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
