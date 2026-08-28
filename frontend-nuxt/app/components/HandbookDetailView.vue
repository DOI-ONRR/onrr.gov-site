<script setup>
/*
  Handbook detail (template = 'handbook') — the interactive handbook page, e.g.
  /references/handbooks/minerals-revenue-reporter-handbook. Mirrors DatasetView:
  the pages record carries a `handbook` M2O (all the handbook metadata), and this
  view fetches that handbook's table-of-contents rows from `handbook_toc`.

  Layout is the "utility" shape (like events): a 3/9 grid with a sticky On this
  page rail and four stacked sections — searchable/paginated TOC, Chapters,
  Supplemental information, Contact.
*/
import getHandbookToc from '@/graphql/queries/collections/handbook_toc/getHandbookToc.gql'

const props = defineProps({
  page: { type: Object, required: true },
})

const hb = computed(() => props.page?.handbook || {})

const { data } = await useAsyncQuery(
  getHandbookToc,
  { handbookId: hb.value?.id },
  { enabled: !!hb.value?.id },
)
const toc = computed(() => data.value?.handbook_toc ?? [])

// Doc lists are JSON repeaters of { label, href, format }.
const chapters = computed(() => hb.value?.chapters || [])
const appendices = computed(() => hb.value?.appendices || [])
const guidance = computed(() => hb.value?.guidance || [])
const related = computed(() => hb.value?.related || [])
const hasSupplemental = computed(
  () => appendices.value.length || guidance.value.length || related.value.length,
)
const hasContact = computed(
  () => hb.value?.contact_group || hb.value?.contact_name || hb.value?.contact_email || hb.value?.contact_phone,
)

// On this page rail: only sections that render.
const sections = computed(() =>
  [
    toc.value.length ? { id: 'table-of-contents', label: 'Table of contents' } : null,
    chapters.value.length ? { id: 'chapters', label: 'Chapters' } : null,
    hasSupplemental.value ? { id: 'supplemental-information', label: 'Supplemental information' } : null,
    hasContact.value ? { id: 'contact', label: 'Contact' } : null,
  ].filter(Boolean),
)

// TOC search (chapter / section / title / page) + pagination.
const searchText = ref('')
const filteredToc = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return toc.value
  return toc.value.filter((r) =>
    `${r.chapter || ''} ${r.section || ''} ${r.title || ''} ${r.toc_page || ''}`.toLowerCase().includes(q),
  )
})
const {
  currentPage, totalPages, displayedItems: displayedToc,
  visiblePages, rangeStart, rangeEnd, totalItems, goToPage, resetPage,
} = usePagination(filteredToc, 25)
watch(searchText, () => resetPage())

// A row with no section number is a chapter/appendix heading, not a linked entry.
const isHeading = (r) => !r.section
const pageUrl = (r) => (r.url && r.actual_page ? `${r.url}#${r.actual_page}` : null)
const telHref = (phone) => `tel:${String(phone).replace(/[^0-9]/g, '')}`

// On this page scroll spy (client only).
const activeSection = ref('')
function syncActiveSection() {
  const ids = sections.value.map((s) => s.id)
  let current = ids[0]
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top < 120) current = id
  }
  activeSection.value = current
}
onMounted(() => {
  syncActiveSection()
  window.addEventListener('scroll', syncActiveSection, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', syncActiveSection))
</script>

<template>
  <div class="grid-row grid-gap handbook">
    <!-- On this page -->
    <div class="tablet:grid-col-3 display-none tablet:display-block">
      <nav class="onpage" aria-label="On this page">
        <p class="onpage-title">On this page</p>
        <ul>
          <li v-for="s in sections" :key="s.id">
            <a :href="`#${s.id}`" :class="{ active: activeSection === s.id }">{{ s.label }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="tablet:grid-col-9">
      <h1 class="margin-bottom-1">{{ hb.title }}</h1>
      <p v-if="hb.release" class="margin-top-0 margin-bottom-2">
        <span class="hb-release">{{ hb.release }}</span>
      </p>
      <!-- intro is WYSIWYG HTML → div, never a <p> wrapper -->
      <div v-if="hb.intro" class="usa-intro lede" v-html="hb.intro" />
      <p v-if="hb.download_url">
        <a class="usa-button" :href="hb.download_url">View complete handbook</a>
      </p>
      <div v-if="hb.note" class="usa-alert usa-alert--info usa-alert--slim margin-bottom-4 hb-note">
        <div class="usa-alert__body"><p class="usa-alert__text">{{ hb.note }}</p></div>
      </div>

      <!-- Table of contents -->
      <section v-if="toc.length" id="table-of-contents" class="hb-section">
        <h2 class="margin-bottom-1">Table of contents</h2>
        <p class="lede margin-top-0">Each entry opens the complete handbook PDF at that page.</p>
        <div class="usa-form-group margin-top-0 toc-search">
          <label class="usa-label margin-top-0" for="toc-filter">Search the table of contents</label>
          <span id="toc-hint" class="usa-hint">By chapter, section number, or title</span>
          <input
            id="toc-filter"
            v-model="searchText"
            class="usa-input"
            type="text"
            aria-describedby="toc-hint"
            autocomplete="off"
          />
        </div>
        <div class="toc-table-wrap margin-top-2">
          <table class="usa-table width-full">
            <caption class="usa-sr-only">Handbook table of contents</caption>
            <thead>
              <tr>
                <th scope="col">Chapter</th>
                <th scope="col">Section</th>
                <th scope="col">Title</th>
                <th scope="col">Page</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in displayedToc" :key="r.id">
                <th scope="row">{{ r.chapter }}</th>
                <td class="sec">{{ r.section }}</td>
                <td :class="{ 'toc-chapter': isHeading(r) }">
                  <a v-if="pageUrl(r)" class="usa-link" :href="pageUrl(r)" target="_blank">{{ r.title }}</a>
                  <template v-else>{{ r.title }}</template>
                </td>
                <td class="pg">{{ r.toc_page }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!filteredToc.length" class="no-results margin-top-2">No entries match that search.</p>
        <PaginationBar
          class="margin-top-2"
          :current-page="currentPage"
          :total-pages="totalPages"
          :visible-pages="visiblePages"
          :range-start="rangeStart"
          :range-end="rangeEnd"
          :total-items="totalItems"
          label="entries"
          @page-change="goToPage"
        />
      </section>

      <!-- Chapters -->
      <section v-if="chapters.length" id="chapters" class="hb-section">
        <h2 class="margin-bottom-1">Chapters</h2>
        <p class="lede margin-top-0">Individual chapters as separate documents.</p>
        <ul class="doc-list">
          <li v-for="(c, i) in chapters" :key="i">
            <span class="doc-fmt">{{ c.format }}</span>
            <a class="usa-link" :href="c.href">{{ c.label }}</a>
          </li>
        </ul>
      </section>

      <!-- Supplemental information -->
      <section v-if="hasSupplemental" id="supplemental-information" class="hb-section">
        <h2 class="margin-bottom-1">Supplemental information</h2>
        <template v-if="appendices.length">
          <h3 class="margin-bottom-0 font-body-md">Appendices</h3>
          <ul class="doc-list margin-bottom-3">
            <li v-for="(a, i) in appendices" :key="i">
              <span class="doc-fmt">{{ a.format || 'PDF' }}</span>
              <a class="usa-link" :href="a.href">{{ a.label }}</a>
            </li>
          </ul>
        </template>
        <template v-if="guidance.length">
          <h3 class="margin-bottom-0 font-body-md">Supplemental reporting guidance</h3>
          <ul class="doc-list margin-bottom-3">
            <li v-for="(g, i) in guidance" :key="i">
              <span class="doc-fmt">{{ g.format || 'PDF' }}</span>
              <a class="usa-link" :href="g.href">{{ g.label }}</a>
            </li>
          </ul>
        </template>
        <template v-if="related.length">
          <h3 class="margin-bottom-0 font-body-md">Related pages</h3>
          <ul class="doc-list">
            <li v-for="(rel, i) in related" :key="i">
              <span class="doc-fmt">{{ rel.format }}</span>
              <a class="usa-link" :href="rel.href">{{ rel.label }}</a>
            </li>
          </ul>
        </template>
      </section>

      <!-- Contact -->
      <section v-if="hasContact" id="contact" class="hb-section">
        <h2 class="margin-bottom-1">Contact</h2>
        <div class="contact-box">
          <p v-if="hb.contact_group" class="margin-top-0 margin-bottom-1 text-bold">{{ hb.contact_group }}</p>
          <p v-if="hb.contact_name" class="margin-0">{{ hb.contact_name }}</p>
          <p v-if="hb.contact_email" class="margin-0">
            <a class="usa-link" :href="`mailto:${hb.contact_email}`">{{ hb.contact_email }}</a>
          </p>
          <p v-if="hb.contact_phone" class="margin-0">
            <a class="usa-link" :href="telHref(hb.contact_phone)">{{ hb.contact_phone }}</a>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.lede { max-width: 66ch; }
.hb-note { max-width: 66ch; }
.toc-search { max-width: 24rem; }

.hb-section {
  scroll-margin-top: 1rem;
  margin-bottom: 3rem;
}

// On this page rail (sticky, left border, active marker).
.onpage {
  position: sticky;
  top: 1rem;
  font-size: 0.9rem;
}
.onpage-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #565c65;
  margin: 0 0 0.5rem;
}
.onpage ul {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 3px solid #dfe1e2;
}
.onpage a {
  display: block;
  padding: 0.35rem 0.9rem;
  color: #565c65;
  text-decoration: none;
  border-left: 3px solid transparent;
  margin-left: -3px;

  &:hover { color: $onrr-blue; text-decoration: underline; }
  &.active { color: #1b1b1b; font-weight: 700; border-left-color: $onrr-blue; }
}

.hb-release {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2c5c2e;
  background: #ecf3ec;
  border-radius: 3px;
  padding: 0.1rem 0.45rem;
}

// TOC table.
.toc-table-wrap {
  overflow-x: auto;
  
  table { margin: 0; }
  thead th { white-space: nowrap; }
  td.sec, td.pg { white-space: nowrap; font-variant-numeric: tabular-nums; }
}
.toc-chapter { font-weight: 700; }
.no-results {
  border: 1px dashed #a9aeb1;
  border-radius: 4px;
  padding: 1.5rem;
  color: #565c65;
}

// Document lists (chapters / appendices / guidance / related).
.doc-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    border-bottom: 1px solid #eef0f1;
    padding: 0.55rem 0;
    display: flex;
    gap: 0.5rem;
    align-items: baseline;

    &:last-child { border-bottom: none; }
  }
}
.doc-fmt {
  font-size: 0.75rem;
  color: #565c65;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex: 0 0 auto;
}

.contact-box {
  border-left: 4px solid $onrr-blue;
  background: $onrr-blue-light;
  border-radius: 0 4px 4px 0;
  padding: 1.1rem 1.25rem;
  max-width: 34rem;
}
</style>
