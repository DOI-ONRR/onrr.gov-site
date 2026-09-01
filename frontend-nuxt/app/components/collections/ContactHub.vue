<script setup>
import getContactTopics from '@/graphql/queries/collections/contacts/getContactTopics.gql'
import getContactsForSearch from '@/graphql/queries/collections/contacts/getContactsForSearch.gql'

const { data: topicsData } = await useAsyncQuery(getContactTopics)
const topics = computed(() => topicsData.value?.contact_topics ?? [])
const topicUrl = (slug) => `/about/contact/${slug}`

const { data: searchData } = await useAsyncQuery(getContactsForSearch)

const search = ref('')

// Flatten to one record per (person, contacts-row) with a searchable haystack.
const index = computed(() =>
  (searchData.value?.contacts ?? []).flatMap((c) => {
    const topic = c.topics?.[0]?.contact_topics_id || null
    return (c.people || []).map((p) => ({
      ...p,
      letter: c.letter,
      topicSlug: topic?.slug || null,
      topicTitle: topic?.title || null,
      hay: [c.letter, c.company_name, c.operator_number, c.agency, p.name, p.role, p.email, p.phone]
        .filter(Boolean).join(' ').toLowerCase(),
    }))
  }),
)

// "Companies beginning with A–E" (contiguous) / "A, C, F" — from a set of letters.
function coverage(letters) {
  const ls = [...letters].filter((l) => /^[A-Za-z]$/.test(l)).sort()
  if (!ls.length) return null
  if (ls.length === 1) return `Companies beginning with ${ls[0]}`
  const codes = ls.map((l) => l.charCodeAt(0))
  const contiguous = codes.every((n, i) => i === 0 || n === codes[i - 1] + 1)
  return `Companies beginning with ${contiguous ? `${ls[0]}–${ls[ls.length - 1]}` : ls.join(', ')}`
}

// Collapse filtered hits to unique people, aggregating their letters + topics.
const results = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  const byPerson = new Map()
  for (const h of index.value) {
    if (!h.hay.includes(q)) continue
    // Lowercase the email/name so inconsistent casing across rows collapses to one person.
    const key = `${(h.email || h.name || '').toLowerCase()}|${h.role_type || h.role || ''}`
    let e = byPerson.get(key)
    if (!e) {
      e = { id: key, name: h.name, role: h.role, role_type: h.role_type, email: h.email, phone: h.phone, letters: new Set(), topics: new Map() }
      byPerson.set(key, e)
    }
    String(h.letter || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((l) => e.letters.add(l))
    if (h.topicSlug) e.topics.set(h.topicSlug, h.topicTitle)
  }
  return [...byPerson.values()].map((e) => ({
    ...e,
    coverage: coverage(e.letters),
    topicList: [...e.topics.entries()].map(([slug, title]) => ({ slug, title })),
  }))
})

const searching = computed(() => !!search.value.trim())
const clear = () => { search.value = '' }
</script>

<template>
  <div class="grid-row grid-gap margin-top-2 margin-bottom-4">
    <div class="tablet:grid-col-7">
      <div class="usa-form-group margin-top-0">
        <label class="usa-label margin-top-0" for="contact-search">Search contacts</label>
        <span id="contact-search-hint" class="usa-hint">By operator, payor, company name, or specialist</span>
        <input
          id="contact-search"
          v-model="search"
          class="usa-input"
          type="text"
          aria-describedby="contact-search-hint"
          autocomplete="off"
        />
      </div>
    </div>
    <div class="tablet:grid-col-5">
      <div class="help-box padding-2">
        <p class="margin-top-0 margin-bottom-1 text-bold">Getting the best results</p>
        <ul>
          <li>Enter as many letters as you can; results narrow as you type.</li>
          <li>Try the first few letters of the operator, payor, company, or agency name.</li>
          <li>If nothing matches, pick a topic below — each topic has its own contact list.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Search results -->
  <section v-if="searching">
    <h2 class="margin-bottom-1">Contact results</h2>
    <p class="result-count margin-top-0 margin-bottom-3" aria-live="polite">
      {{ results.length }} {{ results.length === 1 ? 'contact matches' : 'contacts match' }} “{{ search.trim() }}”
    </p>
    <div v-if="results.length" class="contact-grid">
      <ContactCard v-for="r in results" :key="r.id" :person="r">
        <template #meta>
          <template v-if="r.coverage">{{ r.coverage }}<template v-if="r.topicList.length"> · </template></template>
          <template v-for="(t, i) in r.topicList" :key="t.slug">
            <template v-if="i > 0">, </template>
            <NuxtLink class="usa-link" :to="topicUrl(t.slug)">{{ t.title }}</NuxtLink>
          </template>
        </template>
      </ContactCard>
    </div>
    <p v-else class="no-results">No contacts match that search.</p>
    <p class="margin-top-3">
      <a class="usa-link" href="#" @click.prevent="clear">Clear search and browse all topics</a>
    </p>
  </section>

  <!-- Topic router (default) -->
   <section v-else>
    <h2 class="margin-top-5 margin-bottom-1">I want to contact someone about, or have a problem with:</h2>
    <p class="result-count">{{ topics.length }} topics</p>
    <div class="topic-grid">
      <div v-for="topic in topics" :key="topic.id" class="topic-card">
        <h3 class="topic-card__title">
          <NuxtLink :to="topicUrl(topic.slug)" class="usa-link">{{ topic.title }}</NuxtLink>
        </h3>
        <p v-if="topic.description" class="topic-card__desc">{{ topic.description }}</p>
        <NuxtLink :to="topicUrl(topic.slug)" class="usa-button usa-button--outline">View contacts</NuxtLink>
      </div>
    </div>
   </section>

   <section>
      <div class="grid-row grid-gap margin-bottom-4 margin-top-5">
        <div class="tablet:grid-col-5">
           <div class="help-box padding-2">
            <p class="margin-top-0 margin-bottom-1 text-bold">Not sure which topic fits?</p>
            <p class="margin-0 font-body-2xs">Call the ONRR Enterprise Service Desk, or use site search in the header
              to look across all of ONRR.gov.</p>
          </div>
        </div>
      </div>
   </section>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;
@use "onrr-colors" as *;

// Help callout beside the search box (mockup .help-box).
.help-box {
  border-left: 4px solid #005ea2;
  border-radius: 0 4px 4px 0;
  background: #e1eefa;

  ul { margin: 0; padding-left: 1.1rem; font-size: 0.93rem; }
  li { margin-bottom: 0.4rem; }
  li:last-child { margin-bottom: 0; }
}

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

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.5rem;
  @include u-margin-top(4);
}

.topic-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #dfe1e2;
  border-top: 4px solid $onrr-navy;
  border-radius: 0 0 4px 4px;
  background: #fff;
  padding: 1.25rem 1.25rem 1rem;
}

.topic-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  line-height: 1.25;
}

.topic-card__desc {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: #3d4551;
  flex: 1 1 auto;
}

.topic-card .usa-button {
  margin: 0;
  align-self: flex-start;
}
</style>
