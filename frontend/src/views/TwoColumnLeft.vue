<template>
  <div>
    <div v-if="$apolloData.loading">
      <div class="text-center">
        <v-progress-circular :value="20" />
      </div>
    </div>
    <div v-else>
      <shutdown-banner />
      <HeroImage
        v-if="page && pages_by_id" 
        :title="pages_by_id.hero_title"
        :description="pages_by_id.hero_image.description"
        :image="`${ API_URL }/assets/${ pages_by_id.hero_image ? pages_by_id.hero_image.id : '36cdee7e-e6e8-435f-850c-05636e551723' }?fit=cover&quality=80`"
        :isHome="false" />
      <v-container>
        <v-row>
          <v-col
            xs="12"
            sm="12"
            md="3"
            cols="12">
            <SideMenu v-if="!isMobile" />
          </v-col>
          <v-col
            xs="12"
            sm="12"
            md="9"
            col="12">
              <router-view />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import { PAGES_QUERY, PAGES_BY_ID_QUERY } from '@/graphql/queries'
import { mobileMixin } from '@/mixins'
const SideMenu = () => import(/* webpackChunkName: "Sidemenu" */ '@/components/navigation/SideMenu')
const HeroImage = () =>  import(/* webpackChunkName: "HeroImage" */ '@/components/sections/HeroImage')
const ShutdownBanner = () =>  import(/* webpackChunkName: "ShutdownBanner" */ '@/components/sections/ShutdownBanner')

export default {
  name: "TwoColumnLeft",
  mixins: [mobileMixin],
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
          const page = data.pages.find(page => page.url === this.$route.path)

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
      }
    }
  },
  components: {
    HeroImage,
    SideMenu,
    ShutdownBanner
  },
  props: {
    slug: {
      type: String,
    }
  },
  created() {
    this.findPageByUrl()
  },
  methods: {
    findPageByUrl: function () {
        let page
        if (this.pages) {
          page = this.pages.find(page => page.url === this.$route.path)
        }
        

        this.page = page
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
