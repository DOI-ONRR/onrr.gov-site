<script setup>
import getPressReleasesByStatus from '@/graphql/queries/collections/press_releases/getPressReleasesByStatus.gql'

const props = defineProps({
  status: { type: String, default: 'published' },
  paginate: { type: Boolean, default: false },
})

const PAGE_SIZE = 15

const { assetUrl } = useCmsContent()

const { data } = await useAsyncQuery(getPressReleasesByStatus, { status: props.status })
const releases = computed(() => data.value?.press_releases ?? [])

const searchText = ref('')
const selectedYear = ref('')
const currentPage = ref(1)

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

const totalPages = computed(() => Math.ceil(filteredReleases.value.length / PAGE_SIZE))

const displayedReleases = computed(() => {
  if (!props.paginate) return filteredReleases.value
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredReleases.value.slice(start, start + PAGE_SIZE)
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

watch([searchText, selectedYear], () => {
  currentPage.value = 1
})

function goToPage(page) {
  currentPage.value = page
}

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
  <nav v-if="paginate && totalPages > 1" aria-label="Pagination" class="usa-pagination">
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
</template>
