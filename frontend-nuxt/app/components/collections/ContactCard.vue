<script setup>
/*
  A single contact card: role-coloured header, name chip, email/phone lines, and an
  optional `meta` slot (the hub finder uses it for letter coverage + topic link).
  Shared by ContactDirectory (per-topic) and ContactHub (global search).
*/
defineProps({
  person: { type: Object, required: true },
})

// Card colour by role. Prefers the structured role_type; falls back to deriving from
// the free-string role for any row that lacks one.
function roleType(person) {
  if (person.role_type) return person.role_type
  const r = (person.role || '').toLowerCase()
  if (r.includes('indian')) return 'indian'
  if (r.includes('supervisor')) return 'supervisor'
  if (r.includes('back') && r.includes('up')) return 'backup'
  if (r.includes('manager')) return 'manager'
  return 'federal'
}

const telHref = (phone) => `tel:${(phone || '').replace(/[^\d]/g, '')}`
</script>

<template>
  <div class="contact-card">
    <div class="contact-card__role" :class="`contact-card__role--${roleType(person)}`">{{ person.role }}</div>
    <div class="contact-card__body">
      <span class="contact-card__name">{{ person.name }}</span>
      <p v-if="person.email" class="contact-card__line margin-0">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
        <a class="usa-link" :href="`mailto:${person.email}`">{{ person.email }}</a>
      </p>
      <p v-if="person.phone" class="contact-card__line margin-0">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.6a1 1 0 0 1-.25 1l-2.22 2.2z" /></svg>
        <a class="usa-link" :href="telHref(person.phone)">{{ person.phone }}</a>
      </p>
    </div>
    <p v-if="$slots.meta" class="contact-card__meta margin-0"><slot name="meta" /></p>
  </div>
</template>

<style lang="scss" scoped>
.contact-card {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.contact-card__role {
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;

  &--federal { background: #1a2a52; color: #fff; }
  &--supervisor { background: #ffbe2e; color: #1b1b1b; }
  &--indian { background: #8168b3; color: #fff; }
  &--backup { background: #71767a; color: #fff; }
  &--manager { background: #2e2e5b; color: #fff; }
}

.contact-card__body { padding: 0.85rem; flex: 1 1 auto; }

.contact-card__name {
  display: block;
  background: #f0f0f0;
  padding: 0.4rem 0.6rem;
  border-radius: 3px;
  font-size: 0.95rem;
  color: #1b1b1b;
  margin-bottom: 0.6rem;
}

.contact-card__line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
  word-break: break-word;

  &:last-child { margin-bottom: 0; }
  svg { flex: 0 0 auto; fill: #005ea2; }
}

// Meta footer (mockup .contact-card__meta) — letter coverage + topic link.
.contact-card__meta {
  border-top: 1px solid #dfe1e2;
  padding: 0.55rem 0.85rem;
  font-size: 0.8rem;
  color: #565c65;
  background: #f9fafb;

  :deep(a) { font-size: 0.8rem; }
}
</style>
