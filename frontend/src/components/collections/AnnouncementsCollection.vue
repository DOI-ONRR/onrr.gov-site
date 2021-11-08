<template>
  <div class="announcements__wrap mt-4">
    <v-card 
      v-for="announcement in announcements"
      :key="announcement.id"
      outlined
      elevation="0"
      class="card">
      <v-card-title class="text--primary">{{ announcement.title }}</v-card-title>
      <v-card-text v-html="announcement.content" class="text--primary body-1" />
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementsCollection',
  data() {
    return {}
  },
  props: {
    collection: Object,
    collectionName: String,
    collectionLayout: String,
  },
  computed: {
    announcements() {
      return this.collection
    }
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