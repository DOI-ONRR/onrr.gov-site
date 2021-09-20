<template>
  <div>
    <div v-if="$apolloData.loading">
      <div class="text-center">
        <v-progress-circular :value="20" />
      </div>
    </div>
    <v-container class="page__wrap" v-else>
      <Page :slug="pageSlug" />
    </v-container>
  </div>
</template>

<script>
import { PAGES_BY_ID_QUERY } from '@/graphql/queries'
import Page from '@/views/Page'

export default {
  name: 'PageNotFound',
  metaInfo: {
    title: 'Page not found',
  },
  data() {
    return {
      page: null
    }
  },
  apollo: {
    pages_by_id: {
      query: PAGES_BY_ID_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: "53" // 404 page id
        }
      },
       result ({ data }) {
        if (data) {
          this.page = data.pages_by_id
        }
      }
    },
  },
  components: {
    Page
  },
  computed: {
    pageSlug() {
      return this.pages_by_id.slug
    }
  }
}
</script>

<style lang="scss" scoped>
.page__wrap {
  padding-top: 25px;
}
.title {
  text-align: center;
}
</style>