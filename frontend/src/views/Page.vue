<template>
  <div>
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else class="page-wrap">
      <Breadcrumbs />
      <div v-if="page.page_builder">
        <div v-for="block in page.page_builder.blocks" :key="block.id">
          <!-- Dynamic components yo -- https://vuejs.org/v2/guide/components-dynamic-async.html -->
          <keep-alive>
            <component :is="pageBlock(block.type)" :block="block" :key="block.id" class="block-component"></component>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
const Breadcrumbs = () => import(/* webpackChunkName: "Breadcrumbs" */ '@/components/sections/Breadcrumbs')
const TextBlock = () => import(/* webpackChunkName: "TextBlock" */ '@/components/blocks/TextBlock')
const TabsBlock = () => import(/* webpackChunkName: "TabsBlock" */ '@/components/blocks/TabsBlock')
const ListBlock = () => import(/* webpackChunkName: "ListBlock" */ '@/components/blocks/ListBlock')
const TableBlock = () => import(/* webpackChunkName: "TableBlock" */ '@/components/blocks/TableBlock')
const CodeBlock = () => import(/* webpackChunkName: "CodeBlock" */ '@/components/blocks/CodeBlock')
const ImageBlock = () => import(/* webpackChunkName: "ImageBlock" */ '@/components/blocks/ImageBlock')

export default {
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
    TextBlock,
    TabsBlock,
    ListBlock,
    TableBlock,
    CodeBlock,
    ImageBlock
  },
  data() {
    return {
      pages: [],
      pages_by_id: [],
      code: ''
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
          ID: this.findPageBySlug.id
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
  methods: {
    pageBlock: function(type) { 
      let block
      switch (type) {
        case 'header':
        case 'paragraph':
          block = TextBlock
          break
        case 'tabs':
          block = TabsBlock
          break
        case 'list':
          block = ListBlock 
          break
        case 'table':
          block = TableBlock 
          break
        case 'code':
          block = CodeBlock
          break
        case 'image':
          block = ImageBlock 
          break
        default:
          block = TextBlock
          break
      }
      return block
    }
  },
  computed: {
    findPageBySlug () {
      const str = this.$route.path
      const route = str.replace(/\//g, '')
      let page
      if(this.pages) {
        page = this.slug ? this.pages.find(page => page.slug === this.slug) : this.pages.find(page => page.slug === route)
      }

      return page
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

.block-component {
  margin: 24px 0;
}
</style>