<template>
  <div>
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else class="page-wrap">
      <Breadcrumbs />
      <!-- <div v-if="page.content" v-html="page.content" class="body-1" /> -->
      <div v-if="page.page_builder">
        <div v-for="block in page.page_builder.blocks" :key="block.id">
          <div v-if="block && (block.type === 'header' || block.type === 'paragraph')">
            <TextBlock :content="block.data.text" :contentType="block.type" :contentLevel="block.data.level"></TextBlock>
          </div>

          <div v-if="block && block.type === 'list'">
            <ListBlock :content="block.data.items" :listStyle="block.data.style"></ListBlock>
          </div>

          <div v-if="block && block.type === 'tabs'">
            <TabsBlock :content="block.data" :contentType="block.type"></TabsBlock>
          </div>

          <div v-if="block && block.type === 'table'">
            <TableBlock :tableContent="block.data.content"></TableBlock>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
import Breadcrumbs from '@/components/sections/Breadcrumbs'
import TextBlock from '@/components/blocks/TextBlock'
import TabsBlock from '@/components/blocks/TabsBlock'
import ListBlock from '@/components/blocks/ListBlock'
import TableBlock from '@/components/blocks/TableBlock'

export default {
  name: 'Page',
  components: {
    Breadcrumbs,
    TextBlock,
    TabsBlock,
    ListBlock,
    TableBlock
  },
  data() {
    return {
      pages: [],
      pages_by_id: []
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
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding-top: 25px;
}
</style>