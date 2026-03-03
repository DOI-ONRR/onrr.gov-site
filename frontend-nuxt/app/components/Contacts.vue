<script setup>
import getContacts from '@/graphql/queries/collections/contacts/getContacts.gql'
import getContactsByPage from '@/graphql/queries/collections/contacts/getContactsByPage.gql'
import getContactsByPageAndTab from '@/graphql/queries/collections/contacts/getContactsByPageAndTab.gql'
import getContactsByPageTabAndAccordion from '@/graphql/queries/collections/contacts/getContactsByPageTabAndAccordion.gql'

const props = defineProps({
  page: { type: String, default: null },
  tab: { type: String, default: null },
  accordion: { type: String, default: null },
})

const { data } = props.accordion
  ? await useAsyncQuery(getContactsByPageTabAndAccordion, { page: props.page, tab: props.tab, accordion: props.accordion })
  : props.page && props.tab
    ? await useAsyncQuery(getContactsByPageAndTab, { page: props.page, tab: props.tab })
    : props.page
      ? await useAsyncQuery(getContactsByPage, { page: props.page })
      : await useAsyncQuery(getContacts)
const contacts = computed(() => data.value?.contacts ?? [])

const requiresSearch = !props.page && !props.tab

const PAGE_SIZE = 5
const searchText = ref('')
const currentPage = ref(1)

const filteredContacts = computed(() => {
  if (!searchText.value) return requiresSearch ? [] : contacts.value
  const query = searchText.value.toLowerCase()
  return contacts.value
    .map((contact) => {
      const matchingPeople = contact.people?.filter((p) =>
        p.name?.toLowerCase().includes(query)
      )
      if (!matchingPeople?.length) return null
      return { ...contact, people: matchingPeople }
    })
    .filter(Boolean)
})

const totalPages = computed(() => Math.ceil(filteredContacts.value.length / PAGE_SIZE))

const displayedContacts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredContacts.value.slice(start, start + PAGE_SIZE)
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

watch(searchText, () => {
  currentPage.value = 1
})

const rangeStart = computed(() => (currentPage.value - 1) * PAGE_SIZE + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * PAGE_SIZE, filteredContacts.value.length))

function goToPage(page) {
  currentPage.value = page
}
</script>

<template>
  <div class="margin-bottom-3">
    <label class="usa-label usa-sr-only" for="contacts-search">Search</label>
    <div class="search-input-wrapper">
      <input
        id="contacts-search"
        v-model="searchText"
        class="usa-input"
        type="text"
        placeholder="Search contacts"
      />
    </div>
  </div>
  <div v-if="totalPages > 1" class="pagination-bar margin-bottom-3">
    <span class="pagination-bar__info">
      Displaying {{ rangeStart }} - {{ rangeEnd }} of {{ filteredContacts.length }} contacts
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
  <div v-for="contact in displayedContacts" :key="contact.id" class="margin-bottom-4">
    <h3 v-if="contact.header" class="contact-header">{{ contact.header }}</h3>
    <div class="grid-row grid-gap">
      <div v-for="person in contact.people" :key="person.id" class="grid-col-3 margin-bottom-2">
        <div class="usa-card">
          <div class="usa-card__container">
            <div class="usa-card__header">
              <h4 class="usa-card__heading">{{ person.role }}</h4>
            </div>
            <div class="usa-card__body">
              <div v-if="person.role" class="text-base margin-bottom-1">{{ person.name }}</div>
              <div v-if="person.email">
                <a :href="`mailto:${person.email}`" class="usa-link">{{ person.email }}</a>
              </div>
              <div v-if="person.phone">
                <a :href="`tel:${person.phone}`" class="usa-link">{{ person.phone }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.search-input-wrapper {
  position: relative;

  .usa-input {
    padding-right: units(5);
    width: 100%;
  }
}

.search-input-icon {
  position: absolute;
  right: units(1.5);
  top: 50%;
  transform: translateY(-50%);
  color: color('base');
  pointer-events: none;
}

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

.contact-header {
  background-color: $color-muted-blue-gray;
  padding: units(1) units(2);
  @include u-margin-bottom(4);
  border-top: 2px solid $color-medium-blue;
  @include u-text('white');
}
</style>
