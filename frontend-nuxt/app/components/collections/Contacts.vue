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

const searchText = ref('')

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

const {
  currentPage, totalPages, displayedItems: displayedContacts,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredContacts, 5)

watch(searchText, () => {
  resetPage()
})
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
  <PaginationBar
    class="margin-bottom-3"
    :current-page="currentPage"
    :total-pages="totalPages"
    :visible-pages="visiblePages"
    :range-start="rangeStart"
    :range-end="rangeEnd"
    :total-items="totalItems"
    label="contacts"
    @page-change="goToPage"
  />
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
@use "onrr-colors" as *;

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

.contact-header {
  background-color: $onrr-blue-gray;
  padding: units(1) units(2);
  @include u-margin-bottom(4);
  border-top: 2px solid $onrr-blue;
  @include u-text('white');
}
</style>
