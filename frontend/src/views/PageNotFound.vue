<template>
  <div>
    <div v-if="$apolloData.loading">
      <div class="text-center">
        <v-progress-circular :value="20" />
      </div>
    </div>
    <v-container class="page__wrap" v-else>
      <h2 class="title">{{ page.title }}</h2>
      <p align="center">The page you're looking for doesn't exist, was renamed, or was moved.</p>
      <p align="center"><img src="https://dev-onrr-cms.app.cloud.gov/assets/64c18520-76a1-4892-8dbd-baa17bac4ee6" alt="Rig 404" width="null" height="null" /></p>
      <p align="center">If you have reached this page from a link on our website, please email&nbsp;<a href="mailto:onrrweb@onrr.gov?subject=ONRR.gov%20feedback" rel="external">onrrweb@onrr.gov</a>&nbsp;with the incorrect url, so we can update the page.</p>
      <p align="center"><a title="" href="/" target="_self">Return to homepage</a></p>
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