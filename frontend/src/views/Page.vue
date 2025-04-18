<template>
  <div>
    <div class="text-center" v-if="$apollo.loading">
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
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
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
    SideMenu
  },
  data () {
    return {
      pages: [],
      pages_by_id: {},
      code: '',
      colCount: 1
    }
  },
  apollo: {
    pages: {
      query: PAGES_QUERY,
      loadingKey: 'loading...'
    },
    pages_by_id: {
      query: PAGES_BY_ID_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: this.findPageByUrl.id
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'updatePageLoaded'
    ]),
    async loadUsers () {
      const response = await fetch('https://reqres.in/api/users')
      const { data: users } = await response.json()
      this.users = users
    }
  },
  props: {
    slug: String
  },
  watch: {
    pages_by_id(newValue) {
      if (newValue) {
        this.updatePageLoaded(true);
      }
    },
  },
  computed: {
    findPageByUrl () {
      return this.pages.find(page => page.url === this.$route.path) || 1
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
    },
    pageCMSUrl () {
      return (
        'https://dev-onrr-cms.app.cloud.gov/admin/content/pages/' +
        this.pages_by_id.id
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
