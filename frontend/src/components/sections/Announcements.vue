<template>
  <v-container class="announcements__wrap">
    <h2 class="text-h2">{{ title  || 'Announcements'}}</h2>
    <v-card 
      v-for="announcement in announcements"
      :key="announcement.id"
      outlined
      elevation="0"
      class="card">
      <v-card-title>{{ announcement.title }}</v-card-title>
      <v-card-text v-html="announcement.content" class="body-1" />
    </v-card>
  </v-container>
</template>

<script>
import { ANNOUNCEMENTS_QUERY } from '@/graphql/queries'
export default {
  name: 'Announcements',
  data() {
    return {

    }
  },
  apollo: {
    announcements: {
      query: ANNOUNCEMENTS_QUERY,
      loadingKey: 'loading...'
    }
  },
  props: {
    title: String
  }
}
</script>

<style lang="scss" scoped>
.announcements__wrap .card {
  border-top-color: var(--v-yellow-lighten1);
  border-top-width: 6px;
  margin-bottom: 25px;
}
</style>