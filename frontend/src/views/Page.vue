<template>
  <div>
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else class="page-wrap">
      <Breadcrumbs />
      <div class="text-h1 page-title black--text text--lighten-2" v-if="page.title">{{ page.title }}</div>
      <LayoutBlock :layoutBlocks="page.page_blocks"></LayoutBlock>
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
  computed: {
    findPageByUrl () {
      console.log('routePath yo ------------> ', this.$route.path)
      return this.pages.find(page => page.url === this.$route.path)
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
  },
  created () {},
  
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding-top: 25px;
}

.page-title {
  width: 100%;
  padding-bottom: 10px;
  border-bottom: 4px solid var(--v-yellow-lighten1);
  margin-bottom: 40px;
}

.block-component {
  margin: 0;
}
</style>