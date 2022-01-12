<template>
  <div class="home__wrap">
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else>
      <HeroImage 
        v-if="pages_by_id" 
        :title="pages_by_id.hero_title" 
        :image="`${ API_URL }/assets/${ pages_by_id.hero_image.id }?fit=cover&quality=80`"
        :isHome="true" />
      <v-container class="home__content">
        <v-row>
          <v-col
            cols="12"
            xs="12"
            sm="8">

            <LayoutBlock :layoutBlocks="page.page_blocks"></LayoutBlock>

            <!-- Revenue Data block content -->
            <v-row class="revenue-row">
              <v-col cols="12" xs="12" md="12">
                <v-card outlined elevation="0" class="card">
                  <RevenueBlock title="Revenue Statistics" />
                </v-card>
              </v-col>
            </v-row>
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

export default {
  mixins: [pageBlockMixin],
  name: 'Home',
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
      result ({ data }) {
        if (data) {
          console.log('contentBlocks data: ', data)
        }
        
      },
      fetchPolicy: 'cache-and-network'
    },
    // collection: {
    //   query() {
    //   },
    //   update: data => data
    // }
  }, 
  components: {
    RevenueBlock,
    HeroImage,
    LayoutBlock
  },
  created () {
    // this.contentBlocks()
    console.log('view vuetify obj--------->', this.$vuetify)
  },
  mounted () {
    console.log('breakpoint-------> ', this.$vuetify.breakpoint.width)
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
