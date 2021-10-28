<template>
  <div class="events-wrap">
    <Breadcrumbs />
    <v-card 
    class="mx-auto v-card"
    max-width="100%"
    v-for="event in events"
    :key="event.id"
    >
    <span class="event-date">
      <v-list>
        <v-list-item-content>
          <!-- This is a test date for formatting/demo purposes. I still need to figure out how exactly to just pull the month, day, and year from the graphql
          query and then format that to look like this.-->
          <v-list-item-title class="event-date-content">  Apr 1 <br> 2022  </v-list-item-title> 
        </v-list-item-content>
      </v-list>
    </span>
    <span class="vl"></span>
    <span class="event-info">
      <v-list>
        <v-header class="event_title event_item" v-text="event.title"> {{ event.title }} </v-header>
        <v-subheader class="event_description event_item" v-text="event.description"> {{ event.description}} </v-subheader>
          <v-list-item-content>
            <v-list-item-title class="event_item"> Location Placeholder </v-list-item-title>
          </v-list-item-content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="event_contact event_item" v-text="event.contact.primary_contact"> {{event.contact.primary_contact}} </v-list-item-title>
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title class="event_contact event_item" v-text="event.contact.primary_email"> {{event.contact.primary_email}} </v-list-item-title>
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title class="event_contact event_item" v-text="event.contact.primary_phone"> {{event.contact.primary_phone}} </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </span>
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
.event_item {
  padding-left: 25px;
  padding-top: 40px;
}
.event_title {
  font-size: 30px;
  font-weight: bold;
}
.event_description {
  font-size: 18px;
}
.event_contact {
  padding-left: 10px;
  padding-top: 0px;
}
.event-date {
  padding-left: 10px;
  display: inline-block;
  vertical-align: top;
  width: 10%;
  padding-top: 5%;
}
.event-date-content {
  font-weight: bold;
  font-size: 25px;
  text-align: center;
}
.vl {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #1a227e;
  width: 1%;
}
.event-info {
  padding-left: 0px;
  display: inline-block;
  width: 89%;
}
</style>