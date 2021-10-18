<template>
  <div class="events-wrap">
    <Breadcrumbs />
    <v-card 
    class="mx-auto v-card"
    max-width="100%"
    v-for="event in events"
    :key="event.id"
    >
    
    <v-list>
      <v-header v-text="event.title"> {{ event.title }} </v-header>
      <!-- <v-list-item>
        <v-list-item-content>
          <v-list-item-title v-text="event.description">{{ event.description }}</v-list-item-title>
        </v-list-item-content>

        <v-list-item-content>
          <v-list-item-title v-text="event.location">{{ event.location }}</v-list-item-title>
          <span style="margin-left: 8px;">{{ contact.primary_email }}</span>
        </v-list-item-content>

        <v-list-item-icon v-if="event.location">
          <v-icon>
            mdi-flag
          </v-icon>
          <span style="margin-left: 8px;">{{ event.location }}</span>
        </v-list-item-icon>
      </v-list-item> -->
    </v-list>
  </v-card>
  </div>
</template>

<script>
import { EVENTS_QUERY } from '@/graphql/queries'
import Breadcrumbs from '@/components/sections/Breadcrumbs'

export default {
  name: 'Event',
  metaInfo: {
  title: 'Event',
  },
  data () {
    return {
      events: []
    }
  },
  components: {
    Breadcrumbs
  },
  apollo: {
    events: {
      query: EVENTS_QUERY,
      loadingKey: 'loading...',
      result ({ data }) {
        if (data) {
          console.log('events data-------> ', data)
          this.events = data.events
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.events-wrap {
  padding-top: 25px;
}
.v-card {
  margin-bottom: 16px;
}
</style>