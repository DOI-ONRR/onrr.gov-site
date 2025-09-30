<template>
  <div>
    <div v-if="$apolloData.loading">
      <div class="text-center">
        <v-progress-circular :value="20" />
      </div>
    </div>
    <v-container class="page__wrap" v-else>
      <Breadcrumbs />
      <div class="text-h1 text-center" v-if="page.title">{{ page.title }}</div>
      <LayoutBlock :layoutBlocks="page.page_blocks"></LayoutBlock>
    </v-container>
  </div>
</template>

<script>
import { PAGES_BY_ID_QUERY } from '@/graphql/queries'
const Breadcrumbs = () => import(/* webpackChunkName: "Breadcrumbs" */ '@/components/sections/Breadcrumbs')
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')


export default {
  name: 'PageNotFound',
  metaInfo: {
    title: 'Page not found',
  },
  data() {
    return {}
  },
  apollo: {
    pages_by_id: {
      query: PAGES_BY_ID_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: "26bf9014-50d5-48a5-b7ae-e5f159b36951" // 404 page id cms
        }
      },
    },
  },
  components: {
    Breadcrumbs,
    LayoutBlock
  },
  computed: {
    pageSlug() {
      return this.pages_by_id.slug
    },
    page() {
      return this.pages_by_id && this.pages_by_id
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