<template>
  <div>
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else class="page-wrap">
      <Breadcrumbs />
      <div v-if="page.content" v-html="page.content" class="body-1" />
      <div v-for="block in page.page_blocks" :key="block.id">
        <div v-if="block.item && block.item.__typename === 'section_heading_blocks'">
          <ContentBlock :content="block.item.section_heading" :contentType="block.item.section_heading_type"></ContentBlock>
        </div>
        <div v-if="block.item && block.item.__typename === 'content_blocks'">
          <ContentBlock :content="block.item.content" contentType="body-1"></ContentBlock>
        </div>
        <div v-if="block.item && block.item.__typename === 'tab_blocks'">
          <TabsBlock :content="block.item.tab_block" contentType="body-1"></TabsBlock>
        </div>
        <div v-if="block.item && block.item.__typename === 'card_blocks'">
          {{ block.length }}
          <CardBlock
            :cardTitle="block.item.card_title"
            :cardSubtitle="block.item.card_subtitle"
            :cardContent="block.item.card_content_block"></CardBlock>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
import Breadcrumbs from '@/components/sections/Breadcrumbs'
import ContentBlock from '@/components/blocks/ContentBlock'
import TabsBlock from '@/components/blocks/TabsBlock'
import CardBlock from '@/components/blocks/CardBlock'

export default {
  name: 'Page',
  components: {
    Breadcrumbs,
    ContentBlock,
    TabsBlock,
    CardBlock
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
      fetchPolicy: 'cache-and-network'
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