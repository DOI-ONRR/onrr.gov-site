<template>
  <div>
    <v-tabs
      v-model="tab"
      dark
      color="white"
      background-color="white"
      show-arrows>
      <v-tab href="#indian-outreach-and-events">Indian Outreach and Events</v-tab>
      <v-tab href="#other-onrr-events">Other ONRR Events</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item value="indian-outreach-and-events" transition="fade-transition" class="col">
        <div v-if="events && events.length">
          <v-card
            v-for="event in events"
            :key="event.id"
            elevation="1"
            class="mb-6 mt-3 event-card">
            <v-card-title class="text-h2 text-wrap text-uppercase">{{ event.title }}</v-card-title>
            <v-card-subtitle class="text-h3 black--text my-4">{{ formatDateRange(event) }}</v-card-subtitle>
            <v-card-text class="text--primary body-1">
              <div v-if="event.event_start_date_time" class="mb-4">
                <strong class="text-uppercase">Time:</strong>
                <div>{{ formatTimeRange(event) }}</div>
              </div>
              <div v-if="event.location" class="mb-4">
                <strong class="text-uppercase">Location:</strong>
                <div>{{ event.location }}</div>
              </div>
              <div v-if="event.description" class="mb-4">
                <strong class="text-uppercase">Description:</strong>
                <div v-html="event.description"></div>
              </div>
              <div v-if="event.who_should_attend" class="mb-4">
                <strong class="text-uppercase">Who Should Attend:</strong>
                <div v-html="event.who_should_attend"></div>
              </div>
              <div v-if="event.other_information" class="mb-4">
                <strong class="text-uppercase">Other Information:</strong>
                <div v-html="event.other_information"></div>
              </div>
              <div v-if="event.contact" class="mb-4">
                <strong class="text-uppercase">Contact:</strong>
                <div v-html="event.contact" class="display-inline"></div>
              </div>
              <div v-if="event.email" class="mb-4">
                <strong class="text-uppercase">Email:</strong>
                <div>
                  <a :href="`mailto:${event.email}`">{{ event.email }}</a>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <v-card v-else class="mt-3 event-card">
          <v-card-text>No upcoming events at this time.</v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item value="other-onrr-events" transition="fade-transition" class="col">
        <div v-if="training && training.length">
          <v-card
            v-for="event in training"
            :key="event.id"
            elevation="1"
            class="mb-6 mt-3 event-card">
            <v-card-title class="text-h2 text-wrap text-uppercase">{{ event.title }}</v-card-title>
            <v-card-subtitle class="text-h3 black--text my-4">{{ formatDateRange(event) }}</v-card-subtitle>
            <v-card-text class="text--primary body-1">
              <div v-if="event.event_start_date_time" class="mb-4">
                <strong class="text-uppercase">Time:</strong>
                <div>{{ formatTimeRange(event) }}</div>
              </div>
              <div v-if="event.location" class="mb-4">
                <strong class="text-uppercase">Location:</strong>
                <div>{{ event.location }}</div>
              </div>
              <div v-if="event.description" class="mb-4">
                <strong class="text-uppercase">Description:</strong>
                <div v-html="event.description"></div>
              </div>
              <div v-if="event.who_should_attend" class="mb-4">
                <strong class="text-uppercase">Who Should Attend:</strong>
                <div v-html="event.who_should_attend"></div>
              </div>
              <div v-if="event.other_information" class="mb-4">
                <strong class="text-uppercase">Other Information:</strong>
                <div v-html="event.other_information"></div>
              </div>
              <div v-if="event.contact" class="mb-4">
                <strong class="text-uppercase">Contact:</strong>
                <div v-html="event.contact" class="display-inline"></div>
              </div>
              <div v-if="event.email" class="mb-4">
                <strong class="text-uppercase">Email:</strong>
                <div>
                  <a :href="`mailto:${event.email}`">{{ event.email }}</a>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <v-card v-else class="mt-3 event-card">
          <v-card-text>No upcoming events at this time.</v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { EVENTS_AND_TRAINING_QUERY } from '@/graphql/queries'

export default {
  name: 'EventsCollection',
  props: {
    collection: [Object, Array],
    collectionName: String,
    collectionLayout: String,
  },
  data() {
    return {
      tab: 'indian-outreach-and-events',
      eventsData: null,
    }
  },
  apollo: {
    eventsData: {
      query: EVENTS_AND_TRAINING_QUERY,
      update: data => data,
    },
  },
  methods: {
    formatTime(date) {
      let hours = date.getHours()
      const minutes = date.getMinutes()
      const period = hours >= 12 ? 'p.m.' : 'a.m.'
      hours = hours % 12 || 12
      const minuteStr = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : ':00'
      return `${hours}${minuteStr} ${period}`
    },
    formatTimeRange(event) {
      const start = new Date(event.event_start_date_time)
      const end = new Date(event.event_end_date_time)
      const isMultiDay = start.toDateString() !== end.toDateString()
      const tz = event.time_zone || ''
      let result = `${this.formatTime(start)} - ${this.formatTime(end)}`
      if (tz) result += ` ${tz}`
      if (isMultiDay) result += ' daily'
      return result
    },
    formatDateRange(event) {
      const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const start = new Date(event.event_start_date_time)
      const end = new Date(event.event_end_date_time)
      const startStr = start.toLocaleDateString('en-US', opts)
      if (start.toDateString() === end.toDateString()) {
        return startStr
      }
      return `${startStr} - ${end.toLocaleDateString('en-US', opts)}`
    },
  },
  computed: {
    events() {
      return this.eventsData?.events ?? []
    },
    training() {
      return this.eventsData?.training ?? []
    },
  },
}
</script>

<style lang="scss" scoped>
.event-card {
  border-top: 6px solid var(--v-secondary-base);
}

.v-tab {
  border-left: 1.5px solid var(--v-secondary-base);
  border-right: 1.5px solid var(--v-secondary-base);
  border-top: 1.5px solid var(--v-secondary-base);
  margin-right: 6px;
  text-transform: initial !important;
}

.v-tab--active {
  background-color: var(--v-secondary-base);
  border: none;
}

.v-tabs-slider {
  background-color: white !important;
}

.v-tabs-bar .v-tab:not(.v-tab--active) {
  color: rgb(0, 0, 0, 1) !important;
}

.theme--light.v-card > .v-card__text, .theme--light.v-card > .v-card__subtitle {
  color: rgb(0, 0, 0, 1) !important;
}

.v-tabs {
  border-bottom: 1px solid var(--v-neutrals-base) !important;
}
</style>
