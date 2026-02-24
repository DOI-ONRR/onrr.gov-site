<script setup>
import getReporterLetters from '@/graphql/queries/collections/reporter_letters/getReporterLetters.gql'

const PAGE_SIZE = 10

const { assetUrl } = useCmsContent()

const { data } = await useAsyncQuery(getReporterLetters)
const letters = computed(() => data.value?.reporter_letters ?? [])

const searchText = ref('')
const selectedTopics = ref([])
const topicsOpen = ref(false)
const topicsRef = ref(null)

const allTopics = computed(() => {
  const topicSet = new Set()
  letters.value.forEach((l) => {
    if (Array.isArray(l.topics)) {
      l.topics.forEach((t) => topicSet.add(t))
    } else if (l.topics) {
      topicSet.add(l.topics)
    }
  })
  return [...topicSet].sort((a, b) => a.localeCompare(b))
})

const filteredLetters = computed(() => {
  return letters.value.filter((l) => {
    if (searchText.value) {
      const query = searchText.value.toLowerCase()
      if (!l.title?.toLowerCase().includes(query)) return false
    }
    if (selectedTopics.value.length) {
      const letterTopics = Array.isArray(l.topics) ? l.topics : l.topics ? [l.topics] : []
      if (!selectedTopics.value.some((t) => letterTopics.includes(t))) return false
    }
    return true
  })
})

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredLetters.value.length / PAGE_SIZE))

const displayedLetters = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredLetters.value.slice(start, start + PAGE_SIZE)
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

watch([searchText, selectedTopics], () => {
  currentPage.value = 1
})

function goToPage(page) {
  currentPage.value = page
}

function toggleTopic(topic) {
  const idx = selectedTopics.value.indexOf(topic)
  if (idx === -1) {
    selectedTopics.value = [...selectedTopics.value, topic]
  } else {
    selectedTopics.value = selectedTopics.value.filter((t) => t !== topic)
  }
}

function removeTopic(topic) {
  selectedTopics.value = selectedTopics.value.filter((t) => t !== topic)
}

function handleClickOutside(e) {
  if (topicsRef.value && !topicsRef.value.contains(e.target)) {
    topicsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

function formatTopics(topics) {
  if (!topics) return ''
  if (Array.isArray(topics)) return topics.join(', ')
  return String(topics)
}
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-3">
    <div class="grid-col-6">
      <label class="usa-label" for="reporter-letters-topics">Topics</label>
      <div ref="topicsRef" class="multi-select">
        <button
          id="reporter-letters-topics"
          type="button"
          class="usa-select multi-select__trigger"
          @click="topicsOpen = !topicsOpen"
        >
          <span v-if="!selectedTopics.length" class="multi-select__placeholder">All Topics</span>
          <span v-else class="multi-select__pills">
            <span
              v-for="topic in selectedTopics"
              :key="topic"
              class="multi-select__pill"
              @click.stop="removeTopic(topic)"
            >
              {{ topic }}
              <span class="multi-select__pill-remove" aria-hidden="true">&times;</span>
            </span>
          </span>
        </button>
        <ul v-show="topicsOpen" class="multi-select__dropdown" role="listbox" aria-multiselectable="true">
          <li
            v-for="topic in allTopics"
            :key="topic"
            role="option"
            :aria-selected="selectedTopics.includes(topic)"
            class="multi-select__option"
            :class="{ 'multi-select__option--selected': selectedTopics.includes(topic) }"
            @click="toggleTopic(topic)"
          >
            <input
              type="checkbox"
              :checked="selectedTopics.includes(topic)"
              tabindex="-1"
              class="multi-select__checkbox"
            />
            {{ topic }}
          </li>
        </ul>
      </div>
    </div>
    <div class="grid-col-6">
      <label class="usa-label" for="reporter-letters-search">Search</label>
      <input
        id="reporter-letters-search"
        v-model="searchText"
        class="usa-input"
        type="text"
        placeholder="Search by title"
      />
    </div>
  </div>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col style="width: 50%" />
      <col style="width: 15%" />
      <col style="width: 35%" />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Reporter Letters</th>
        <th scope="col">Date</th>
        <th scope="col">Topics</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="letter in displayedLetters" :key="letter.id">
        <td>
          <a
            v-if="letter.file?.id"
            :href="assetUrl(letter.file.id)"
            target="_blank"
            class="usa-link"
          >
            {{ letter.title }}
          </a>
          <a
            v-else-if="letter.link"
            :href="letter.link"
            target="_blank"
            class="usa-link"
          >
            {{ letter.title }}
          </a>
          <span v-else>{{ letter.title }}</span>
        </td>
        <td>{{ formatDate(letter.date) }}</td>
        <td>{{ formatTopics(letter.topics) }}</td>
      </tr>
    </tbody>
  </table>
  <nav v-if="totalPages > 1" aria-label="Pagination" class="usa-pagination">
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

<style lang="scss" scoped>
@use "uswds-theme" as *;

.usa-table--fixed {
  table-layout: fixed;
}

.usa-pagination__list {
  justify-content: center;
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
