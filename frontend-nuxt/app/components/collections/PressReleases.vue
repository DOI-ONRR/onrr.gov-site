<script setup>
import getPressReleasesByStatus from '@/graphql/queries/collections/press_releases/getPressReleasesByStatus.gql'

const props = defineProps({
  status: { type: String, default: 'published' },
  paginate: { type: Boolean, default: false },
})

const { assetUrl } = useCmsContent()

const { data } = await useAsyncQuery(getPressReleasesByStatus, { status: props.status })
const releases = computed(() => data.value?.press_releases ?? [])

const searchText = ref('')
const selectedYear = ref('')

const years = computed(() => {
  const yearSet = new Set()
  releases.value.forEach((r) => {
    if (r.date) yearSet.add(new Date(r.date).getFullYear())
  })
  return [...yearSet].sort((a, b) => b - a)
})

const filteredReleases = computed(() => {
  return releases.value.filter((r) => {
    if (selectedYear.value && new Date(r.date).getFullYear() !== Number(selectedYear.value)) {
      return false
    }
    if (searchText.value) {
      const query = searchText.value.toLowerCase()
      const titleMatch = r.title?.toLowerCase().includes(query)
      const excerptMatch = r.excerpt?.toLowerCase().includes(query)
      if (!titleMatch && !excerptMatch) return false
    }
    return true
  })
})

const {
  currentPage, totalPages, displayedItems,
  visiblePages, goToPage, resetPage,
} = usePagination(filteredReleases)

const displayedReleases = computed(() => {
  if (!props.paginate) return filteredReleases.value
  return displayedItems.value
})

watch([searchText, selectedYear], () => {
  resetPage()
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-3">
    <div class="grid-col-6">
      <label class="usa-label" for="press-release-search">Search</label>
      <input
        id="press-release-search"
        v-model="searchText"
        class="usa-input"
        type="text"
        placeholder="Search by title or excerpt"
      />
    </div>
    <div class="grid-col-6">
      <label class="usa-label" for="press-release-year">Year</label>
      <select id="press-release-year" v-model="selectedYear" class="usa-select">
        <option value="">All years</option>
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>
  </div>
  <ul class="usa-list usa-list--unstyled">
    <li v-for="release in displayedReleases" :key="release.id" class="margin-bottom-3">
      <h3 class="margin-bottom-05">
        <a
          v-if="release.file?.id"
          :href="assetUrl(release.file.id)"
          target="_blank"
          class="usa-link"
        >
          {{ release.title }}
        </a>
        <a
          v-else-if="release.link"
          :href="release.link"
          target="_blank"
          class="usa-link"
        >
          {{ release.title }}
        </a>
        <span v-else>{{ release.title }}</span>
      </h3>
      <p class="text-base margin-top-0 margin-bottom-05">
        {{ formatDate(release.date) }}
      </p>
      <div v-if="release.excerpt" class="margin-top-0" v-html="release.excerpt" />
    </li>
  </ul>
  <PaginationBar
    v-if="paginate"
    :current-page="currentPage"
    :total-pages="totalPages"
    :visible-pages="visiblePages"
    @page-change="goToPage"
  />
</template>
