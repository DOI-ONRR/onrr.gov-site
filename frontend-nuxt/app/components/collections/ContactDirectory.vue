<script setup>
/*
  Per-topic contacts directory (mockup: contact-oil-gas .contact-section). Each
  contacts row is a group (header + company info) holding one card per person;
  a client-side filter narrows by company letter, name, role, email, or phone.
  Card header colour comes from the person's role type.
*/
import getContactsByTopic from '@/graphql/queries/collections/contacts/getContactsByTopic.gql'

const props = defineProps({
  // Either pass `groups` directly, or a `topic` slug to fetch them here (block use).
  groups: { type: Array, default: null },
  topic: { type: String, default: null },
  // Contacts per page (from collection_blocks.items_per_page); groups stay whole.
  itemsPerPage: { type: Number, default: null },
})

// When given a topic slug, fetch the directory ourselves; otherwise use the prop.
const { data: fetched } = props.topic
  ? await useAsyncQuery(getContactsByTopic, { slug: props.topic })
  : { data: ref(null) }
const sourceGroups = computed(() => (props.topic ? (fetched.value?.contacts ?? []) : (props.groups ?? [])))

const search = ref('')

const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return sourceGroups.value
  return sourceGroups.value
    .map((g) => {
      const groupHay = [g.header, g.letter, g.company_name, g.operator_number, g.agency]
        .filter(Boolean).join(' ').toLowerCase()
      if (groupHay.includes(q)) return g // whole group matches
      const people = (g.people || []).filter((p) =>
        [p.name, p.role, p.email, p.phone].filter(Boolean).join(' ').toLowerCase().includes(q),
      )
      return people.length ? { ...g, people } : null
    })
    .filter(Boolean)
})

const totalPeople = computed(() =>
  filteredGroups.value.reduce((n, g) => n + (g.people?.length || 0), 0),
)

// Page size = contacts per page (block field), default 20. Groups are kept whole, so
// each page packs groups until it reaches ~perPage contacts (a single oversized group
// still gets its own page).
const perPage = computed(() => Number(props.itemsPerPage) || 20)

const pages = computed(() => {
  const out = []
  let cur = []
  let count = 0
  for (const g of filteredGroups.value) {
    const n = g.people?.length || 0
    if (cur.length && count + n > perPage.value) {
      out.push(cur)
      cur = []
      count = 0
    }
    cur.push(g)
    count += n
  }
  if (cur.length) out.push(cur)
  return out
})

// Reuse the pager machinery by paging the pre-built pages one at a time.
const {
  currentPage, totalPages, displayedItems, visiblePages, goToPage, resetPage,
} = usePagination(pages, 1)
const pagedGroups = computed(() => displayedItems.value[0] ?? [])
watch([search, perPage], () => resetPage())

// The pager reads in CONTACTS: the span of people the current page covers.
const peopleBefore = computed(() =>
  pages.value.slice(0, currentPage.value - 1)
    .reduce((n, pg) => n + pg.reduce((m, g) => m + (g.people?.length || 0), 0), 0),
)
const pagePeople = computed(() => pagedGroups.value.reduce((n, g) => n + (g.people?.length || 0), 0))
const contactRangeStart = computed(() => (totalPeople.value ? peopleBefore.value + 1 : 0))
const contactRangeEnd = computed(() => peopleBefore.value + pagePeople.value)
</script>

<template>
  <div class="filter-row margin-top-4 margin-bottom-2">
    <div class="usa-form-group margin-top-0 filter-row__field">
      <label class="usa-label margin-top-0" for="contact-filter">Search contacts</label>
      <span id="contact-filter-hint" class="usa-hint">By company letter, specialist name, or role</span>
      <input
        id="contact-filter"
        v-model="search"
        class="usa-input"
        type="text"
        aria-describedby="contact-filter-hint"
        autocomplete="off"
      />
    </div>
    <p class="result-count margin-0" aria-live="polite">
      {{ totalPeople }} contact{{ totalPeople === 1 ? '' : 's' }}
    </p>
  </div>

  <p v-if="!filteredGroups.length" class="no-results">No contacts match that search.</p>

  <!-- group-head is a styled role="heading" div (not a real h2) so it stays out of the
       topic template's "On this page" rail, which scans <h2>. Section grouping is
       intentionally ignored for now (see the section data cleanup). -->
  <div v-for="group in pagedGroups" :key="group.id" class="contact-group">
    <div v-if="group.header" class="group-head" role="heading" aria-level="2">{{ group.header }}</div>
    <div class="contact-grid">
      <ContactCard v-for="person in group.people" :key="person.id" :person="person" />
    </div>
  </div>

  <PaginationBar
    v-if="totalPages > 1"
    class="margin-top-2"
    :current-page="currentPage"
    :total-pages="totalPages"
    :visible-pages="visiblePages"
    :range-start="contactRangeStart"
    :range-end="contactRangeEnd"
    :total-items="totalPeople"
    label="contacts"
    @page-change="goToPage"
  />
</template>

<style lang="scss" scoped>
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}
.filter-row__field { flex: 1 1 20rem; }

.result-count {
  font-size: 0.9rem;
  color: #565c65;
  font-variant-numeric: tabular-nums;
}

.no-results {
  border: 1px dashed #a9aeb1;
  border-radius: 4px;
  padding: 1.5rem;
  color: #565c65;
}

.group-head {
  background: #f0f0f0;
  border-left: 4px solid #565c65;
  border-radius: 0 4px 4px 0;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1b1b1b;
  margin-bottom: 1rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
</style>
