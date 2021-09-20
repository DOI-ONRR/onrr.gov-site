<template>
  <div>
    <div v-if="$apolloData.loading">
      <div class="text-center">
        <v-progress-circular :value="20" />
      </div>
    </div>
    <div v-else>
      <HeroImage
        v-if="page && pages_by_id" 
        :title="page.title" 
        :image="`${ API_URL }/assets/${ pages_by_id.hero_image ? pages_by_id.hero_image.id : '36cdee7e-e6e8-435f-850c-05636e551723' }?fit=cover&quality=80`"
        :isHome="false" />
      <v-container>
        <v-row>
          <v-col
            sm="12"
            md="3">
            <SideMenu />
          </v-col>
          <v-col
            sm="12"
            md="9">
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
const SideMenu = () => import(/* webpackChunkName: "Sidemenu" */ '@/components/navigation/SideMenu')
const HeroImage = () =>  import(/* webpackChunkName: "HeroImage" */ '@/components/sections/HeroImage')



export default {
  name: "TwoColumnLeft",
  data() {
    return {
      page: null,
      pages: [],
      API_URL: process.env.VUE_APP_API_URL,
      pageId: null,
    }
  },
  apollo: {
    pages: {
      query: PAGES_QUERY,
      loadingKey: 'loading...',
      result ({ data }) {
        if (data) {
          const str = this.$route.path
          const routes = str.split('/')
          const page = this.slug 
            ? data.pages.find(page => page.slug === this.slug)
            : this.pages.find(page => page.slug === routes[routes.length - 1])
          this.page = page
          this.pageId = page.id
        }
      }
    },
    pages_by_id: {
      query: PAGES_BY_ID_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: this.pageId
        }
      },
    }
  },
  components: {
    HeroImage,
    SideMenu,
  },
  props: {
    slug: {
      type: String,
    }
  },
  created() {
    this.findPageBySlug()
  },
  methods: {
    findPageBySlug: function () {
      const str = this.$route.path
      const routes = str.split('/')

      let page
      if(this.pages) {
        page = (this.slug !== undefined) 
          ? this.pages.find(page => page.slug === this.slug)
          : this.pages.find(page => page.slug === routes[routes.length - 1]) || false
      }
      this.page = page
      return page
    },
    getPageBySlug: function(slug) {
      const page = this.pages.find(page => page.slug === slug)
      return page
    }
  }
}
</script>

<style lang="scss" scoped>
.text-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
