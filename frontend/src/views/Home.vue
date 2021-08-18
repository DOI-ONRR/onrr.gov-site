<template>
  <div class="home__wrap">
    <div class="text-center" v-if="$apollo.loading">
      <v-progress-circular :value="20"></v-progress-circular>
    </div>
    <div v-else>
      <HeroImage 
        v-if="pages_by_id" 
        :title="heroContent" 
        :image="`${ API_URL }/assets/${ pages_by_id.hero_image.id }?fit=cover&quality=80`"
        :isHome="true" />
      <v-container class="home__content">
        <v-row>
          <v-col
            cols="12"
            xs="12"
            sm="8">
            <!-- <div v-html="pages_by_id.content" /> -->
            <!-- First row of block content -->
            <v-row class="first-row">
              <v-col cols="12" xs="12" sm="6" v-for="(block, index) in firstRowBlocks" :key="index">
                <v-card 
                  outlined
                  elevation="0" 
                  class="card"
                  v-if="index <= 1">
                  <v-card-text>
                    <div class="text-body-1" v-html="block.item.content"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Second row block content -->
            <v-row class="second-row">
              <v-col cols="12" xs="12" md="4" v-for="(block, index) in secondRowBlocks" :key="index">
                <v-card outlined elevation="0" class="card" >
                  <v-card-text>
                    <div class="text-body-1" v-html="block.item.content"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Third row block content -->
            <v-row class="third-row">
              <v-col cols="12" xs="12" md="4" v-for="(block, index) in thirdRowBlocks" :key="index">
                <v-card outlined elevation="0" class="card">
                  <v-card-text>
                    <div class="text-body-1" v-html="block.item.content"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Fourth row of block content -->
            <v-row class="fourth-row">
              <v-col cols="12" xs="12" md="6">
                <v-card outlined elevation="0" class="card">
                  <FilesBlock title="Reporter Letters" filterBy="Reporter Letters"  class="text-body-1" />
                </v-card>
              </v-col>
              <v-col xs="12" md="6">
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
import Announcements from '@/components/sections/Announcements'
import FilesBlock from '@/components/blocks/FilesBlock'
import RevenueBlock from '@/components/blocks/RevenueBlock'
import HeroImage from '@/components/sections/HeroImage'

export default {
  name: 'Home',
  data() {
    return {
      API_URL: process.env.VUE_APP_API_URL,
      contentBlocks: [],
      heroContent: `The Office of Natural Resources Revenue (ONRR - pronounced like "honor") collects, accounts for, and verifies energy and mineral revenues. We then distribute the funds to States, American Indians, and the U.S. Treasury.`
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
          const blocks = data.pages_by_id.page_blocks.filter(block => block.item.__typename === 'content_blocks')
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
    HeroImage
  },
  created () {
    // this.contentBlocks()
    console.log('view vuetify obj--------->', this.$vuetify)
  },
  mounted () {
    console.log('breakpoint yo-------> ', this.$vuetify.breakpoint.width)
  },
  methods: {
    //  contentBlocks () {
    //   const contentBlocks = this.pages_by_id && this.pages_by_id.page_blocks.filter(block => block.item.__typename === 'content_blocks')
    //   return contentBlocks
    // },
  },
  computed: {
    firstRowBlocks () {
      const blocks = this.contentBlocks.filter((block, index) => index <= 1)
      return blocks
    },
    secondRowBlocks () {
      const blocks = this.contentBlocks.filter((block, index) => index >= 2 && index <= 4)
      return blocks
    },
    thirdRowBlocks () {
      const blocks = this.contentBlocks.filter((block, index) => index >= 5 && index <= 7)
      return blocks
    },
    cssProps () {
      return {
        '--anchor-color': this.$vuetify.theme.themes.dark.anchor
      }
    },
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

.first-row .card {
  min-height: 350px;
  border-top-color: var(--v-secondary-base);
  border-top-width: 6px;
}

.second-row .card {
  min-height: 450px;
}

.third-row .card {
  min-height: 275px;
}

.second-row .card,
.third-row .card {
  border-top-color: var(--v-primary-base);
  border-top-width: 6px;
}

.fourth-row .card {
  min-height: 375px;
  border-top-color: var(--v-purple-base);
  border-top-width: 6px;
}

.fifth-row .card {
  border-top-color: var(--v-green-lighten1);
  border-top-width: 6px;
}
</style>