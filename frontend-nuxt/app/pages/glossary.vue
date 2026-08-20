<script setup>
/*
  Glossary (`/glossary`) — a filterable, A-Z index of the `glossary_terms` collection
  (term / definition / categories). A dedicated route (not a page template) because it's
  a singular page with bespoke interactivity, modeled on the glossary mockup: a text
  filter + category select, an A-Z jump rail, terms grouped under letter headings, and a
  per-term deep-link anchor (e.g. #royalty).
*/
import getGlossaryTerms from '@/graphql/queries/collections/glossary_terms/getGlossaryTerms.gql'

const { data } = await useAsyncQuery(getGlossaryTerms)
const terms = computed(() => data.value?.glossary_terms ?? [])

// Filter state.
const query = ref('')
const category = ref('')

// Per-term anchor id (deep link like #royalty).
function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
// First letter A-Z, else "#" (numbers/symbols).
function letterOf(t) {
  const c = (t.term?.[0] || '').toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

const categoryOptions = computed(
  () => [...new Set(terms.value.flatMap((t) => t.categories || []).filter(Boolean))].sort(),
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return terms.value.filter((t) => {
    if (category.value && !(t.categories || []).includes(category.value)) return false
    if (!q) return true
    return t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
  })
})

// Filtered terms grouped by letter.
const byLetter = computed(() => {
  const map = {}
  for (const t of filtered.value) (map[letterOf(t)] ??= []).push(t)
  return map
})

// Ordered letter groups ("#" first).
const letters = computed(
  () => Object.keys(byLetter.value).sort((a, b) => ((a === '#' ? '0' : a) < (b === '#' ? '0' : b) ? -1 : 1)),
)

// The full A-Z rail (+ "#"), with which letters have visible terms.
const alphabet = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
const azRail = computed(
  () => alphabet.map((L) => ({ letter: L, id: L === '#' ? 'num' : L, active: !!byLetter.value[L] })),
)

const countLabel = computed(() =>
  (filtered.value.length === terms.value.length
    ? `${terms.value.length} terms`
    : `${filtered.value.length} of ${terms.value.length} terms match`),
)
</script>

<template>
  <div class="glossary margin-top-4">
    <div class="grid-container">
      <Breadcrumbs :page="{ title: 'Glossary' }" />
    </div>

    <div class="grid-container padding-bottom-6">
      <div class="grid-row grid-gap">
        <div class="tablet:grid-col-8">
          <h1 class="margin-bottom-1">Glossary</h1>
          <p class="usa-intro">
            Plain-language definitions of the terms used across ONRR.gov — from reporting and
            payment vocabulary to the names of funds, laws, and price references.
          </p>

          <!-- Filter + category controls -->
          <div class="g-controls padding-2 margin-y-2">
            <div class="grid-row grid-gap">
              <div class="tablet:grid-col-7">
                <label class="usa-label" for="g-filter">Filter terms</label>
                <input
                  id="g-filter"
                  v-model="query"
                  class="usa-input"
                  type="text"
                  placeholder="Type to filter, e.g. royalty"
                />
              </div>
              <div class="tablet:grid-col-5">
                <label class="usa-label" for="g-cat">Category</label>
                <select id="g-cat" v-model="category" class="usa-select">
                  <option value="">All categories</option>
                  <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <p class="g-count margin-bottom-0 margin-top-1" aria-live="polite">{{ countLabel }}</p>
          </div>

          <!-- A-Z jump rail: active letters link to their section, others are disabled. -->
          <ul class="az" aria-label="Jump to letter">
            <li v-for="l in azRail" :key="l.letter">
              <a v-if="l.active" :href="`#letter-${l.id}`">{{ l.letter }}</a>
              <span v-else aria-hidden="true">{{ l.letter }}</span>
            </li>
          </ul>

          <!-- Grouped term list -->
          <div class="margin-top-3">
            <template v-if="filtered.length">
              <template v-for="L in letters" :key="L">
                <h2 class="letter-head" :id="`letter-${L === '#' ? 'num' : L}`">{{ L }}</h2>
                <div v-for="t in byLetter[L]" :id="slug(t.term)" :key="t.id" class="g-term">
                  <h3>
                    {{ t.term }}
                    <span v-for="c in (t.categories || []).filter(Boolean)" :key="c" class="g-cat">{{ c }}</span>
                    <a class="g-anchor" :href="`#${slug(t.term)}`" :aria-label="`Link to ${t.term}`">#</a>
                  </h3>
                  <p>{{ t.definition }}</p>
                </div>
              </template>
            </template>
            <p v-else class="text-italic">No terms match your filter.</p>
          </div>
        </div>
        <!-- Right column intentionally left empty: the main glossary stays at grid-col-8
             (unchanged dimensions) even though the aside note has been removed. -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.g-controls {
  background: #f0f0f0;
  border-radius: 4px;

  .usa-label { margin-top: 0; font-size: 0.9rem; }
}

.g-count { font-size: 0.95rem; color: #565c65; }

// A-Z jump rail.
.az {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;

  a, span {
    display: inline-block;
    min-width: 1.7rem;
    text-align: center;
    padding: 0.2rem 0.3rem;
    border: 1px solid #dfe1e2;
    border-radius: 3px;
    font-size: 0.9rem;
    text-decoration: none;
  }
  a { color: $onrr-blue; font-weight: 700; }
  a:hover { background: $onrr-blue-light; }
  span { color: #a9aeb1; }
}

// Letter section heads + term entries (scroll-margin so anchor jumps aren't clipped).
.letter-head {
  font-size: 1.3rem;
  border-bottom: 2px solid #aeb9c2;
  padding-bottom: 0.25rem;
  scroll-margin-top: 1rem;
}

.g-term {
  padding: 0.9rem 0;
  border-bottom: 1px solid #dfe1e2;
  scroll-margin-top: 1rem;

  &:last-child { border-bottom: 0; }
  h3 { margin: 0 0 0.25rem; font-size: 1.05rem; }
  p { margin: 0; font-size: 0.95rem; max-width: 68ch; }
}

.g-cat {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #565c65;
  background: #f0f0f0;
  border-radius: 3px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.g-anchor {
  font-size: 0.8rem;
  text-decoration: none;
  color: #aeb9c2;
  margin-left: 0.4rem;

  &:hover { color: $onrr-blue; }
}
</style>
