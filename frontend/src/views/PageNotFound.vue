<template>
  <div>
    <div v-if="$apolloData.loading">
      <div class="text-center">
        <v-progress-circular :value="20" />
      </div>
    </div>
    <v-container class="page__wrap" v-else>
      <h2 class="title">{{ page.title }}</h2>
      <div v-html="page.content" />
    </v-container>
  </div>
</template>

<script>
import { PAGES_BY_ID_QUERY } from '@/graphql/queries'

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
          console.debug('404 data---------> ', data)
          this.page = data.pages_by_id
        }
      }
    },
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