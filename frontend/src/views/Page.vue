<template>
  <div>
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else class="page-wrap">
      <Breadcrumbs />
      <div class="text-h1 page-title" v-if="page.title">{{ page.title }}</div>
        <LayoutBlock :layoutBlocks="page.page_blocks"></LayoutBlock>
            <!-- Dynamic components -- https://vuejs.org/v2/guide/components-dynamic-async.html -->
            <!-- <keep-alive>
              <component :is="pageBlock(block.item.__typename)" :block="block.item" class="block-component"></component>
            </keep-alive> -->
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
import { 
  pageBlockMixin,
  editorBlockMixin
} from '@/mixins'

const Breadcrumbs = () => import(/* webpackChunkName: "Breadcrumbs" */ '@/components/sections/Breadcrumbs')
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')

export default {
  mixins: [pageBlockMixin, editorBlockMixin],
  name: 'Page',
  metaInfo () {
    return {
      title: this.metaTitle || this.pageTitle,
      meta: [
        { name: 'description', content: this.metaDescription },
        { property: 'og:title', content: this.metaTitle },
        { property: 'og:site_name', content: 'Office of Natural Resources Revenue' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index,follow' }
      ]
    }
  },
  components: {
    Breadcrumbs,
    LayoutBlock
  },
  data() {
    return {
      pages: [],
      pages_by_id: [],
      code: '',
      colCount: 1
    }
  },
  apollo: {
    pages: {
      query: PAGES_QUERY,
      loadingKey: 'loading...',
    },
    pages_by_id: {
      query: PAGES_BY_ID_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: this.findPageByUrl.id
        }
      },
      // fetchPolicy: 'cache-and-network'
    }
  },
  props: {
    slug: String,
  },
  created () {
    this.$apollo.queries.pages_by_id.refetch()
  },
  computed: {
    findPageByUrl () {
      const routePath = this.$route.fullPath.split('?')[0]
      // console.log('routePath yo ------------> ', routePath)
      return this.pages.find(page => page.url === routePath)
    },
    page () {
      return this.pages_by_id
    },
    metaTitle () {
      return this.pages_by_id.meta_title
    },
    metaDescription () {
      return this.pages_by_id.meta_description
    },
    pageTitle () {
      return this.pages_by_id.title
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding-top: 25px;
}

.page-title {
  width: 100%;
  padding-bottom: 8px;
  border-bottom: 4px solid var(--v-yellow-lighten1);
  font-weight: 500;
  margin-bottom: 24px;
}

.block-component {
  margin: 0;
}
</style>