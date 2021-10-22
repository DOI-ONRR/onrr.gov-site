<template>
  <v-container>
    <h2 class="text-h2 mt-1 mb-3">{{ title  || 'Files'}}</h2>
    <v-card v-for="file in fileItems" :key="file.id"
    class="announcement-card"
    elevation="0">
      <a :href="`${ API }/assets/${ file.filename_disk }`">
        {{ file.title }}
      </a>
    </v-card>
  </v-container>
</template>

<script>
import { FILES_QUERY } from '@/graphql/queries'
export default {
  name: 'FilesBlock',
  data() {
    return {
      API: process.env.VUE_APP_API_URL,
      files: []
    }
  },
  apollo: {
    files: {
      query: FILES_QUERY,
      loadingKey: 'loading...',
      client: 'a'
    }
  },
  props: {
    filterBy: String,
    title: String
  },
  computed: {
    fileItems: function() {
      return this.files.filter(file => file.folder && file.folder.name === this.filterBy)
    }
  }
}
</script>