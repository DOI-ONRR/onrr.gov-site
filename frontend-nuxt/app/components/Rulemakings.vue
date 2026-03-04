<script setup>
import getRulemakings from '@/graphql/queries/collections/rulemakings/getRulemakings.gql'

const { data } = await useAsyncQuery(getRulemakings)

const rows = computed(() =>
  (data.value?.rulemakings ?? []).map((r) => ({
    id: r.id,
    finalPublicationDate: r.final_publication_date,
    rin: r.rin,
    ruleTitle: r.rule_title,
    topics: r.commodity_subject_matter,
    webpageLink: r.webpage_link,
  }))
)

const searchText = ref('')
const selectedTopics = ref([])
const topicsOpen = ref(false)
const topicsRef = ref(null)

const allTopics = computed(() => {
  const topicSet = new Set()
  rows.value.forEach((r) => {
    if (Array.isArray(r.topics)) {
      r.topics.forEach((t) => topicSet.add(t))
    } else if (r.topics) {
      topicSet.add(r.topics)
    }
  })
  return [...topicSet].sort((a, b) => a.localeCompare(b))
})

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    if (searchText.value) {
      const query = searchText.value.toLowerCase()
      if (!r.ruleTitle?.toLowerCase().includes(query)) return false
    }
    if (selectedTopics.value.length) {
      const rowTopics = Array.isArray(r.topics) ? r.topics : r.topics ? [r.topics] : []
      if (!selectedTopics.value.some((t) => rowTopics.includes(t))) return false
    }
    return true
  })
})

const {
  currentPage, totalPages, displayedItems: displayedRows,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredRows)

watch([searchText, selectedTopics], () => {
  resetPage()
})

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

function formatTopics(topics) {
  if (!topics) return ''
  if (Array.isArray(topics)) return topics.join(', ')
  return String(topics)
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
</script>

<template>
  <div class="grid-row grid-gap margin-bottom-3">
    <div class="grid-col-6">
      <label class="usa-label" for="rulemakings-topics">Topics</label>
      <div ref="topicsRef" class="multi-select">
        <button
          id="rulemakings-topics"
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
      <label class="usa-label" for="rulemakings-search">Search</label>
      <input
        id="rulemakings-search"
        v-model="searchText"
        class="usa-input"
        type="text"
        placeholder="Search by rule title"
      />
    </div>
  </div>
  <table class="usa-table usa-table--borderless width-full usa-table--fixed">
    <colgroup>
      <col style="width: 15%" />
      <col style="width: 10%" />
      <col style="width: 45%" />
      <col style="width: 30%" />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Final Publication Date</th>
        <th scope="col">RIN</th>
        <th scope="col">Rule Title</th>
        <th scope="col">Topics</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in displayedRows" :key="row.id">
        <td>{{ formatDate(row.finalPublicationDate) }}</td>
        <td>{{ row.rin }}</td>
        <td>
          <a
            v-if="row.webpageLink"
            :href="row.webpageLink"
            target="_blank"
            class="usa-link"
          >
            {{ row.ruleTitle }}
          </a>
          <span v-else>{{ row.ruleTitle }}</span>
        </td>
        <td>{{ formatTopics(row.topics) }}</td>
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
