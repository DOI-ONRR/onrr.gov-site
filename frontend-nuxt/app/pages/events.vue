<script setup>
import getEvents from '@/graphql/queries/collections/events/getEvents.gql'

const { data } = await useAsyncQuery(getEvents)
const events = computed(() => data.value?.events ?? [])

// The query already sorts by event_start_date; grouping preserves that order.
const training = computed(() => events.value.filter((e) => e.event_category === 'reporter_training'))
const outreach = computed(() => events.value.filter((e) => e.event_category === 'indian_outreach'))
const other = computed(() => events.value.filter((e) => e.event_category === 'other'))

// On-this-page rail: the training entry only appears when a featured training
// event exists; the two stacked sections are always present.
const toc = computed(() =>
  [
    training.value.length ? { id: 'reporter-training', label: 'Reporter training' } : null,
    { id: 'indian-outreach-and-events', label: 'Indian outreach & events' },
    { id: 'other-onrr-events', label: 'Other ONRR events' },
  ].filter(Boolean),
)

// --- Formatting helpers ---

function formatDateRange(event) {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  const start = new Date(event.event_start_date)
  const startStr = start.toLocaleDateString('en-US', opts)
  if (!event.event_end_date || event.event_start_date === event.event_end_date) return startStr
  const end = new Date(event.event_end_date)
  return `${startStr} – ${end.toLocaleDateString('en-US', opts)}`
}

// CMS values may contain anchors to external sites; give them the USWDS external
// link treatment (mirrors the helper the old Events component used).
function addExternalLinkClasses(html) {
  return String(html).replace(/<a\s([^>]*href=['"]https?:\/\/[^>]*)>/gi, (match, attrs) => {
    if (/class=/.test(attrs)) {
      return match.replace(/class=['"]([^'"]*)['"]/, (m, classes) => {
        const added = []
        if (!classes.includes('usa-link')) added.push('usa-link')
        if (!classes.includes('usa-link--external')) added.push('usa-link--external')
        return `class="${classes}${added.length ? ' ' + added.join(' ') : ''}"`
      })
    }
    return `<a class="usa-link usa-link--external" ${attrs}>`
  })
}

// Training-card contact line: link the email inline where it appears in the text.
function contactHtml(event) {
  const contact = addExternalLinkClasses(event.contact || '')
  if (event.email && contact.includes(event.email)) {
    return contact.replace(event.email, `<a class="usa-link" href="mailto:${event.email}">${event.email}</a>`)
  }
  return contact
}

// The <dl> rows for an outreach/other event card, in display order.
const dlRows = [
  ['time', 'Time'],
  ['location', 'Location'],
  ['description', 'Description'],
  ['who_should_attend', 'Who should attend'],
  ['other_information', 'Other information'],
  ['contact', 'Contact'],
]
function rowsFor(event) {
  return dlRows.filter(([key]) => event[key])
}

// --- On-this-page scroll spy (client only) ---
const activeSection = ref('')
function syncActiveSection() {
  const ids = toc.value.map((t) => t.id)
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
  <div class="events margin-top-4">
    <div class="grid-container">
      <Breadcrumbs :page="{ title: 'Events' }" />
    </div>

    <div class="grid-container padding-top-2 padding-bottom-6">
      <div class="grid-row grid-gap">
        <!-- On this page -->
        <div class="tablet:grid-col-3 display-none tablet:display-block">
          <nav class="onpage" aria-label="On this page">
            <p class="onpage-title">On this page</p>
            <ul>
              <li v-for="t in toc" :key="t.id">
                <a :href="`#${t.id}`" :class="{ active: activeSection === t.id }">{{ t.label }}</a>
              </li>
            </ul>
          </nav>
        </div>

        <div class="tablet:grid-col-9">
          <h1 class="margin-bottom-1">Events</h1>
          <p class="usa-intro lede">
            Reporter training, Indian outreach events, and other ONRR events. Most outreach events
            are drop-in booths where you can ask about your leases, IIM accounts, or trust properties
            in person.
          </p>

          <!-- Featured: reporter training -->
          <section v-if="training.length" id="reporter-training" class="event-section">
            <div v-for="t in training" :key="t.id" class="training-card">
              <h2>{{ t.title }}</h2>
              <p class="event-date">{{ formatDateRange(t) }}</p>
              <!-- div, not p: description is WYSIWYG HTML that may itself contain <p>. -->
              <div v-if="t.description" class="training-desc" v-html="addExternalLinkClasses(t.description)" />
              <a
                v-for="(r, i) in (t.registration || [])"
                :key="i"
                class="usa-button usa-button--outline"
                :href="r.href"
              >{{ r.label }}</a>
              <p v-if="t.location" class="reg-note"><strong>Venue:</strong> {{ t.location }}</p>
              <p v-if="t.contact" class="reg-note margin-top-1" v-html="contactHtml(t)" />
            </div>
          </section>

          <!-- Indian outreach -->
          <section id="indian-outreach-and-events" class="event-section">
            <h2 class="margin-bottom-1">Indian outreach &amp; events</h2>
            <p class="lede margin-top-0">
              ONRR outreach offices in Oklahoma City, Denver, and Farmington attend these events. See
              also the
              <NuxtLink class="usa-link" to="/indian-resources">Indian Resources</NuxtLink> section.
            </p>
            <template v-if="outreach.length">
              <article v-for="ev in outreach" :key="ev.id" class="event-card">
                <h3>{{ ev.title }}</h3>
                <p class="event-date margin-0">{{ formatDateRange(ev) }}</p>
                <dl class="event-dl">
                  <template v-for="[key, label] in rowsFor(ev)" :key="key">
                    <dt>{{ label }}</dt>
                    <dd v-html="addExternalLinkClasses(ev[key])" />
                  </template>
                  <template v-if="ev.email">
                    <dt>Email</dt>
                    <dd><a class="usa-link" :href="`mailto:${ev.email}`">{{ ev.email }}</a></dd>
                  </template>
                </dl>
              </article>
            </template>
            <div v-else class="empty-state">No upcoming events at this time.</div>
          </section>

          <!-- Other ONRR events -->
          <section id="other-onrr-events" class="event-section">
            <h2 class="margin-bottom-1">Other ONRR events</h2>
            <template v-if="other.length">
              <article v-for="ev in other" :key="ev.id" class="event-card">
                <h3>{{ ev.title }}</h3>
                <p class="event-date margin-0">{{ formatDateRange(ev) }}</p>
                <dl class="event-dl">
                  <template v-for="[key, label] in rowsFor(ev)" :key="key">
                    <dt>{{ label }}</dt>
                    <dd v-html="addExternalLinkClasses(ev[key])" />
                  </template>
                  <template v-if="ev.email">
                    <dt>Email</dt>
                    <dd><a class="usa-link" :href="`mailto:${ev.email}`">{{ ev.email }}</a></dd>
                  </template>
                </dl>
              </article>
            </template>
            <div v-else class="empty-state">No upcoming events at this time.</div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;

.lede { max-width: 66ch; }

.event-section {
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

// Featured training card (blue identity).
.training-card {
  border: 1px solid #dfe1e2;
  border-top: 4px solid $onrr-blue;
  border-radius: 0 0 4px 4px;
  background: #f7fbff;
  padding: 1.5rem;
  margin-bottom: 2.5rem;

  h2 { margin: 0 0 0.35rem; font-size: 1.3rem; line-height: 1.25; }
  .usa-button { margin: 0.5rem 0.5rem 0 0; }
}
.training-desc { margin-top: 0; max-width: 66ch; }
.reg-note { font-size: 0.85rem; color: #565c65; margin: 0.75rem 0 0; }

// Event cards (violet = the outreach section identity).
.event-card {
  border: 1px solid #dfe1e2;
  border-left: 4px solid #8168b3;
  border-radius: 0 4px 4px 0;
  background: #fff;
  padding: 1.25rem 1.4rem;
  margin-bottom: 1.25rem;

  h3 { margin: 0 0 0.4rem; font-size: 1.15rem; line-height: 1.25; }
}
.event-date {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #54318c;
  background: #f3effa;
  border-radius: 3px;
  padding: 0.15rem 0.5rem;
  margin-bottom: 0.9rem;
}
.event-dl {
  margin: 0;
  font-size: 0.95rem;

  dt {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #565c65;
    margin-top: 0.85rem;
  }
  dd {
    margin: 0.15rem 0 0;
    color: #1b1b1b;
    line-height: 1.55;
  }
}
.empty-state {
  border: 1px dashed #a9aeb1;
  border-radius: 4px;
  padding: 1.5rem;
  color: #565c65;
}
</style>
