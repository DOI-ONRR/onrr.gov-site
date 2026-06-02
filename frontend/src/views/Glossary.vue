<template>
  <div class="page-wrap">
    <div v-if="!isMobile">
      <Breadcrumbs />
      <div
        role="heading"
        aria-level="1"
        variant="h1"
        class="text-h1 page-title black--text text--lighten-2"
        v-if="pageData && pageData.title"
      >
        {{ pageData.title }}
      </div>
    </div>

    <div v-if="isMobile">
      <div
        role="heading"
        aria-level="1"
        variant="h1"
        class="text-h1 page-title black--text text--lighten-2"
        v-if="pageData && pageData.title"
      >
        {{ pageData.title }}
      </div>
      <SideMenu />
      <Breadcrumbs />
    </div>

    <LayoutBlock v-if="pageData && pageData.page_blocks" :layoutBlocks="pageData.page_blocks"></LayoutBlock>

    <div class="text-center" v-if="!glossaryData">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else>
      <nav class="glossary-jump-links" aria-label="Jump to letter">
        <a
          v-for="letter in alphabet"
          :key="'jump-' + letter"
          :href="termsByLetter[letter] ? '#' + letter : null"
          :class="{ 'glossary-jump-link--disabled': !termsByLetter[letter] }"
          class="glossary-jump-link"
        >{{ letter }}</a>
      </nav>
      <div v-for="letter in letters" :key="letter">
        <h2 :id="letter">{{ letter }}</h2>
        <hr />
        <div v-for="item in termsByLetter[letter]" :key="item.term">
          <h3>{{ item.term }}</h3>
          <p v-html="item.definition"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { GLOSSARY_TERMS_QUERY } from '@/graphql/queries'
import { mobileMixin } from '@/mixins'

const Breadcrumbs = () =>
  import(/* webpackChunkName: "Breadcrumbs" */ '@/components/sections/Breadcrumbs')
const SideMenu = () =>
  import(/* webpackChunkName: "SideMenu" */ '@/components/navigation/SideMenu')
const LayoutBlock = () =>
  import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')

export default {
  name: 'GlossaryView',
  mixins: [mobileMixin],
  metaInfo() {
    return {
      title: this.pageData?.meta_title || this.pageData?.title,
      meta: [
        { name: 'description', content: this.pageData?.meta_description },
        { property: 'og:title', content: this.pageData?.meta_title || this.pageData?.title },
        { property: 'og:site_name', content: 'Office of Natural Resources Revenue' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index,follow' },
      ],
    }
  },
  components: {
    Breadcrumbs,
    SideMenu,
    LayoutBlock,
  },
  props: {
    pageData: {
      type: Object,
      default: () => ({}),
    },
    pages: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      glossaryData: null,
    }
  },
  apollo: {
    glossaryData: {
      query: GLOSSARY_TERMS_QUERY,
      update: data => data.glossary_terms,
    },
  },
  computed: {
    termsByLetter() {
      if (!this.glossaryData) return {}
      const grouped = {}
      for (const item of this.glossaryData) {
        const letter = item.term.charAt(0).toUpperCase()
        if (!grouped[letter]) grouped[letter] = []
        grouped[letter].push(item)
      }
      return grouped
    },
    alphabet() {
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    },
    letters() {
      return Object.keys(this.termsByLetter).sort()
    },
  },
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

.glossary-jump-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 24px;
}

.glossary-jump-link {
  padding: 4px 8px;
  text-decoration: none;
  font-weight: 600;
}

.glossary-jump-link--disabled {
  color: #aaa;
  pointer-events: none;
}
</style>
