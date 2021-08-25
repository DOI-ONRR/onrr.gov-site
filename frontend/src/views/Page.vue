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
            <component :is="pageBlock(block.type)" :block="block" :key="block.id"></component>
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

export default {
  name: 'Page',
  components: {
    Breadcrumbs,
    TextBlock,
    TabsBlock,
    ListBlock,
    TableBlock,
    CodeBlock
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
    cardBlockCount () {
      const cardBlocks = this.pages_by_id && this.pages_by_id.page_blocks.filter(block => block.item.__typename === 'card_blocks')
      return cardBlocks
    },
    
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding-top: 25px;
}
</style>