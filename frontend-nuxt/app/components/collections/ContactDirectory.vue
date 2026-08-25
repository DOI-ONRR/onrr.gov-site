<script setup>
/*
  Per-topic contacts directory (mockup: contact-oil-gas .contact-section). Each
  contacts row is a group (header + company info) holding one card per person;
  a client-side filter narrows by company letter, name, role, email, or phone.
  Card header colour comes from the person's role type.
*/
const props = defineProps({
  groups: { type: Array, default: () => [] },
})

const search = ref('')

const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.groups
  return props.groups
    .map((g) => {
      const groupHay = [g.header, g.section, g.letter, g.company_name, g.operator_number, g.agency]
        .filter(Boolean).join(' ').toLowerCase()
      if (groupHay.includes(q)) return g // whole group matches
      const people = (g.people || []).filter((p) =>
        [p.name, p.role, p.email, p.phone].filter(Boolean).join(' ').toLowerCase().includes(q),
      )
      return people.length ? { ...g, people } : null
    })
    .filter(Boolean)
})

// Bucket the header-level groups into their sections, preserving order. A null
// section renders its groups with no section heading (flat, as today).
const sectionedGroups = computed(() => {
  const out = []
  const index = new Map()
  for (const g of filteredGroups.value) {
    const name = g.section || null
    let bucket = index.get(name)
    if (!bucket) {
      bucket = { name, groups: [] }
      index.set(name, bucket)
      out.push(bucket)
    }
    bucket.groups.push(g)
  }
  return out
})

const totalPeople = computed(() =>
  filteredGroups.value.reduce((n, g) => n + (g.people?.length || 0), 0),
)
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

  <template v-for="sec in sectionedGroups" :key="sec.name ?? '__none'">
    <h2 v-if="sec.name" class="section-head">{{ sec.name }}</h2>
    <div v-for="group in sec.groups" :key="group.id" class="contact-group">
      <component :is="sec.name ? 'h3' : 'h2'" v-if="group.header" class="group-head">{{ group.header }}</component>
      <div class="contact-grid">
        <ContactCard v-for="person in group.people" :key="person.id" :person="person" />
      </div>
    </div>
  </template>
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

.section-head {
  font-size: 1.35rem;
  line-height: 1.2;
  margin: 2rem 0 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #aeb9c2;

  &:first-child { margin-top: 0; }
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
