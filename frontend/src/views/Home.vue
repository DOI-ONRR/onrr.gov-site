<template>
  <div class="home__wrap">
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20" aria-label="circular progress bar"></v-progress-circular>
    </div>
    <div v-else>
      <shutdown-banner />
      <HeroImage 
        v-if="pages_by_id" 
        :title="pages_by_id.hero_title"
	:description="pages_by_id.hero_image.description"
        :image="`${ API_URL }/assets/${ pages_by_id.hero_image.id }?fit=cover&quality=80`"
        :isHome="true" />
      <v-container class="home-content">
        <v-row>
          <v-col
            cols="12"
            xs="12"
            sm="8"
            class="pt-6">

            <LayoutBlock :layoutBlocks="page.page_blocks"></LayoutBlock>

          </v-col>
          <!-- Sidebar -->
          <v-col cols="12" xs="12" sm="4">
            <div v-for="block in page.sidebar_blocks.blocks" :key="block.id">
                <!-- Dynamic components -- https://vuejs.org/v2/guide/components-dynamic-async.html -->
                <component :is="pageBlock(block.type)" :block="block" class="block-component"></component>
            </div>
          </v-col>
        </v-row>
        
      </v-container>
    </div>
  </div>
</template>

<script>
import { HOME_PAGE_QUERY } from '@/graphql/queries'
import { 
  pageBlockMixin
} from '@/mixins'

const RevenueBlock = () => import('@/components/blocks/RevenueBlock')
const HeroImage = () => import('@/components/sections/HeroImage')
const LayoutBlock = () => import('@/components/blocks/LayoutBlock')
const ShutdownBanner = () =>  import(/* webpackChunkName: "ShutdownBanner" */ '@/components/sections/ShutdownBanner')

export default {
  mixins: [pageBlockMixin],
  name: 'HomePage',
  metaInfo: {
    title: 'Home',
  },
  data() {
    return {
      API_URL: process.env.VUE_APP_API_URL,
    }
  },
  apollo: {
    pages_by_id: {
      query: HOME_PAGE_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: 1
        }
      },
      fetchPolicy: 'cache-and-network'
    },
  }, 
  components: {
    RevenueBlock,
    HeroImage,
    LayoutBlock,
    ShutdownBanner
  },
  created () {
    // this.contentBlocks()
    console.log('view vuetify obj--------->', this.$vuetify)
  },
  mounted () {
    // console.log('breakpoint-------> ', this.$vuetify.breakpoint.width)
  },
  methods: {},
  computed: {
    cssProps () {
      return {
        '--anchor-color': this.$vuetify.theme.themes.dark.anchor
      }
    },
    page () {
      return this.pages_by_id
    }
  }
}
</script>


<style lang="scss" scoped>
.home-content img {
  max-width: 100%;
  margin: 20px 0;
}

.card {
  padding: 10px;
}

.home__content {
  padding-top: 25px;

  h2 {
    margin-bottom: 16px !important;
  }
}

img {
  max-width: 100%;
  margin: 20px 0;
}

.revenue-row .card {
  border-top-color: var(--v-green-lighten1);
  border-top-width: 6px;
}

</style>
