<template>
  <div>
    <div class="text-center" v-if="!pageData || !pageData.id">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else class="page-wrap">
      <div v-if="!isMobile">
        <Breadcrumbs />
        <div
          role="heading"
          aria-level="1"
          variant="h1"
          class="text-h1 page-title black--text text--lighten-2"
          v-if="page.title"
        >
          {{ page.title }}
        </div>
      </div>

      <div v-if="isMobile">
        <div
          role="heading"
          aria-level="1"
          variant="h1"
          class="text-h1 page-title black--text text--lighten-2"
          v-if="page.title"
        >
          {{ page.title }}
        </div>
        <SideMenu />
        <Breadcrumbs />
      </div>
      <LayoutBlock :layoutBlocks="page.page_blocks" id="main-content"></LayoutBlock>
      <EventsCollection v-if="isEventsPage" />
    </div>
  </div>
</template>

<script>
import { pageBlockMixin, editorBlockMixin, mobileMixin } from '@/mixins'
import { mapActions } from 'vuex';

const Breadcrumbs = () =>
  import(
    /* webpackChunkName: "Breadcrumbs" */ '@/components/sections/Breadcrumbs'
  )
const LayoutBlock = () =>
  import(
    /* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock'
  )
const SideMenu = () =>
  import(/* webpackChunkName: "SideMenu" */ '@/components/navigation/SideMenu')
const EventsCollection = () =>
  import(/* webpackChunkName: "EventsCollection" */ '@/components/collections/Events')
const SITE = process.env.VUE_APP_SITE
export default {
  mixins: [pageBlockMixin, editorBlockMixin, mobileMixin],
  name: 'PageView',
  metaInfo () {
    return {
      title: this.metaTitle || this.pageTitle,
      meta: [
        { name: 'description', content: this.metaDescription },
        { property: 'og:title', content: this.metaTitle },
        {
          property: 'og:site_name',
          content: 'Office of Natural Resources Revenue'
        },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index,follow' }
      ]
    }
  },
  components: {
    Breadcrumbs,
    LayoutBlock,
    SideMenu,
    EventsCollection,
  },
  data () {
    return {
      code: '',
      colCount: 1
    }
  },
  methods: {
    ...mapActions([
      'updatePageLoaded'
    ])
  },
  props: {
    slug: String,
    pageData: {
      type: Object,
      default: () => ({})
    },
    pages: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    pageData(newValue) {
      if (newValue) {
        this.updatePageLoaded(true);
      }
    },
  },
  computed: {
    page () {
      return this.pageData
    },
    metaTitle () {
      return this.pageData?.meta_title
    },
    metaDescription () {
      return this.pageData?.meta_description
    },
    pageTitle () {
      return this.pageData?.title
    },
    pageCMSUrl () {
      return (
        'https://dev-onrr-cms.app.cloud.gov/admin/content/pages/' +
        this.pageData?.id
      )
    },
    isProd () {
      if (SITE == 'PROD') {
        return true
      } else {
        return false
      }
    },
    isDev () {
      if (SITE == 'DEV') {
        return true
      } else {
        return false
      }
    },
    isEventsPage () {
      return this.$route.params.slug === 'events'
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
  padding-bottom: 10px;
  border-bottom: 4px solid var(--v-yellow-lighten1);
  margin-bottom: 40px;
}

.block-component {
  margin: 0;
}
</style>
