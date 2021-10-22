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

            <div v-for="block in page.page_blocks" :key="block.id">
              <LayoutBlock :layout="block.item.block_layout" :block="block.item">
                <!-- Dynamic components -- https://vuejs.org/v2/guide/components-dynamic-async.html -->
                <component :is="pageBlock(block.item.__typename)" :block="block.item" class="block-component"></component>
              </LayoutBlock>
            </div>

            <!-- Fourth row of block content -->
            <v-row class="fourth-row">
              <v-col cols="12" xs="12" md="6" class="block-container">
                <v-card outlined elevation="0" class="card">
                  <FilesBlock title="Reporter Letters" filterBy="Reporter Letters"  class="text-body-1" />
                </v-card>
              </v-col>
              <v-col xs="12" md="6" class="block-container">
                <v-card outlined elevation="0" class="card">
                  <FilesBlock title="Press Releases" filterBy="Press Releases"  class="text-body-1" />
                </v-card>
              </v-col>
            </v-row>

            <!-- Fifth row of block content -->
            <v-row class="fifth-row">
              <v-col cols="12" xs="12" md="12">
                <v-card outlined elevation="0" class="card">
                  <RevenueBlock title="Revenue Statistics" />
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" xs="12" sm="4">
            <Announcements title="Announcements" />
          </v-col>
        </v-row>
        
      </v-container>
    </div>
  </div>
</template>

<script>
import { PAGES_BY_ID_QUERY } from '@/graphql/queries'
import { 
  pageBlockMixin
} from '@/mixins'
const Announcements = () => import('@/components/sections/Announcements')
const FilesBlock = () => import('@/components/blocks/FilesBlock')
const RevenueBlock = () => import('@/components/blocks/RevenueBlock')
const HeroImage = () => import('@/components/sections/HeroImage')
const LayoutBlock = () => import('@/components/blocks/LayoutBlock')

export default {
  mixins: [pageBlockMixin],
  name: 'Home',
  metaInfo: {
    title: 'Home',
    // overrid the parent template and just use the above title only
    // titleTemplate: 'Home'
  },
  data() {
    return {
      API_URL: process.env.VUE_APP_API_URL,
      contentBlocks: [],
    }
  },
  apollo: {
    pages_by_id: {
      query: PAGES_BY_ID_QUERY,
      loadingKey: 'loading...',
      variables () {
        return {
          ID: 1
        }
      },
      result ({ data }) {
        if (data) {
          console.log('contentBlocks data: ', data)
          const blocks = data.pages_by_id.page_blocks.filter(block => block.item.__typename === 'blocks')
          this.contentBlocks = blocks
        }
        
      },
      fetchPolicy: 'cache-and-network'
    }
  }, 
  components: {
    Announcements,
    FilesBlock,
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

.fourth-row .card {
  border-top-color: var(--v-purple-base);
  border-top-width: 6px;
}

.fifth-row .card {
  border-top-color: var(--v-green-lighten1);
  border-top-width: 6px;
}

.block-container {
  display: flex;
  flex-wrap: wrap;
}
</style>