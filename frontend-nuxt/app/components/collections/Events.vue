<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import getEvents from '@/graphql/queries/collections/events/getEvents.gql'

const { data } = await useAsyncQuery(getEvents)

const outreachEvents = computed(() => data.value?.outreach_events ?? [])
const otherEvents = computed(() => data.value?.other_events ?? [])

function addExternalLinkClasses(html) {
  return html.replace(/<a\s([^>]*href=['"]https?:\/\/[^>]*)>/gi, (match, attrs) => {
    if (/class=/.test(attrs)) {
      return match.replace(/class=['"]([^'"]*)['"]/,  (m, classes) => {
        const added = []
        if (!classes.includes('usa-link')) added.push('usa-link')
        if (!classes.includes('usa-link--external')) added.push('usa-link--external')
        return `class="${classes}${added.length ? ' ' + added.join(' ') : ''}"`
      })
    }
    return `<a class="usa-link usa-link--external" ${attrs}>`
  })
}

function labeledField(label, value) {
  const strong = `<strong class="text-uppercase">${label}:</strong> `
  const processed = addExternalLinkClasses(value)
  const trimmed = processed.trimStart()
  if (trimmed.match(/^<p[\s>]/i)) {
    return trimmed.replace(/^<p([^>]*)>/i, `<p$1>${strong}`)
  }
  return strong + processed
}

function formatDateRange(event) {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  const start = new Date(event.event_start_date)
  const end = new Date(event.event_end_date)
  const startStr = start.toLocaleDateString('en-US', opts)
  if (start.toUTCString().slice(0, 16) === end.toUTCString().slice(0, 16)) {
    return startStr
  }
  return `${startStr} - ${end.toLocaleDateString('en-US', opts)}`
}
</script>

<template>
  <TabGroup as="div">
    <TabList class="events-tabs">
      <Tab v-slot="{ selected }" as="template">
        <button class="events-tab" :class="{ 'events-tab--selected': selected }">
          Indian Outreach &amp; Events
        </button>
      </Tab>
      <Tab v-slot="{ selected }" as="template">
        <button class="events-tab" :class="{ 'events-tab--selected': selected }">
          Other ONRR Events
        </button>
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel :unmount="false">
        <template v-if="outreachEvents.length">
          <div
            v-for="event in outreachEvents"
            :key="event.id"
            class="event-card"
          >
            <h2 class="event-card__title">{{ event.title }}</h2>
            <h3 class="event-card__date">{{ formatDateRange(event) }}</h3>
            <div class="event-card__body">
              <div v-if="event.time" class="margin-bottom-2" v-html="labeledField('Time', event.time)" />
              <div v-if="event.location" class="margin-bottom-2" v-html="labeledField('Location', event.location)" />
              <div v-if="event.description" class="margin-bottom-2" v-html="labeledField('Description', event.description)" />
              <div v-if="event.who_should_attend" class="margin-bottom-2" v-html="labeledField('Who Should Attend', event.who_should_attend)" />
              <div v-if="event.other_information" class="margin-bottom-2" v-html="labeledField('Other Information', event.other_information)" />
              <div v-if="event.contact" class="margin-bottom-2" v-html="labeledField('Contact', event.contact)" />
              <div v-if="event.email" class="margin-bottom-2" v-html="labeledField('Email', `<a href='mailto:${event.email}' class='usa-link'>${event.email}</a>`)" />
            </div>
          </div>
        </template>
        <p v-else>No upcoming events at this time.</p>
      </TabPanel>
      <TabPanel :unmount="false">
        <template v-if="otherEvents.length">
          <div
            v-for="event in otherEvents"
            :key="event.id"
            class="event-card"
          >
            <h2 class="event-card__title">{{ event.title }}</h2>
            <h3 class="event-card__date">{{ formatDateRange(event) }}</h3>
            <div class="event-card__body">
              <div v-if="event.time" class="margin-bottom-2" v-html="labeledField('Time', event.time)" />
              <div v-if="event.location" class="margin-bottom-2" v-html="labeledField('Location', event.location)" />
              <div v-if="event.description" class="margin-bottom-2" v-html="labeledField('Description', event.description)" />
              <div v-if="event.who_should_attend" class="margin-bottom-2" v-html="labeledField('Who Should Attend', event.who_should_attend)" />
              <div v-if="event.other_information" class="margin-bottom-2" v-html="labeledField('Other Information', event.other_information)" />
              <div v-if="event.contact" class="margin-bottom-2" v-html="labeledField('Contact', event.contact)" />
              <div v-if="event.email" class="margin-bottom-2" v-html="labeledField('Email', `<a href='mailto:${event.email}' class='usa-link'>${event.email}</a>`)" />
            </div>
          </div>
        </template>
        <p v-else>No upcoming events at this time.</p>
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *;

.events-tabs {
  display: flex;
  border-bottom: 1px solid color('base-lighter');
  gap: units(0.5);
}

.events-tab {
  @include typeset('sans', 'sm', 3);
  padding: units(1) units(2);
  background: none;
  border: 1px solid color('base-lighter');
  border-bottom: none;
  cursor: pointer;
  color: color('base-dark');

  &:hover {
    color: color('primary');
  }

  &--selected {
    background-color: color('primary');
    color: white;
    border-color: color('primary');
  }
}

.event-card {
  border-top: 6px solid color('primary');
  background-color: white;
  padding: units(3);
  margin-top: units(2);
  margin-bottom: units(3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.event-card__title {
  @include typeset('sans', 'lg', 2);
  text-transform: uppercase;
  margin-top: 0;
  margin-bottom: units(1);
}

.event-card__date {
  @include typeset('sans', 'md', 3);
  margin-top: 0;
  margin-bottom: units(2);
}

.event-card__body {
  @include typeset('sans', 'sm', 4);
}
</style>
