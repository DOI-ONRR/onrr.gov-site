<template>
  <div class="v-tabs__wrap">
    <v-tabs
      v-model="model"
      dark
      color="white"
      background-color="white"
      show-arrows>

      <v-tab 
        v-for="(tab, index) in tabItems"
        :key="index"
        :href="`#${ formattedLabel(tab.item.tab_block_label) }`">
        <span v-html="tab.item.tab_block_label"></span>
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="model"
      :key="componentKey">
      <v-tab-item
        v-for="(block, i) in tabItems"
        :key="i"
        :value="formattedLabel(block.item.tab_block_label)">
        <v-card
          text
          elevation="0"
          >
          <v-card-text style="white-space: pre-line;" class="pl-1 pr-1 pt-4 pb-4 tab-content">
            <LayoutBlock :layoutBlocks="block.tabBlocks"></LayoutBlock>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { formatToSlug } from '@/js/utils'
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')

import { 
  pageBlockMixin,
  editorBlockMixin
} from '@/mixins'

export default {
  mixins: [pageBlockMixin, editorBlockMixin],
  name: 'TabsBlock',
  data () {
    return {
      model: '',
      componentKey: 0,
    }
  },
  props: {
    block: [Array, Object],
  },
  components: {
    LayoutBlock
  },
  methods: {
    // TODO: update params to handle levels of tabs
    // addParamsToLocation(params) {
    //   this.$router.replace({ path: this.$route.path, query: params })
    //   this.forceRerender()
    // },
    formattedLabel(label) {
      console.log('label yo --------> ', label)
      return formatToSlug(label)
    },
    forceRerender() {
      return this.componentKey += 1
    },
  },
  computed: {
    tabItems() {
      const tabBlocks = this.block.item.tab_blocks
      const tabItems = []

      tabBlocks && tabBlocks.forEach(obj => {
        // console.log('obj: ', obj)
        if(obj.item !== null) {
          if (obj.item.__typename === 'tab_block_label') {
            tabItems.push({ ...obj, tabBlocks: [] })
          } else {
            tabItems[tabItems.length - 1].tabBlocks.push(obj)
          }
        }
        
      })
      // console.log('tabItems: ', tabItems)
      return tabItems
    },
  },
  created() {
    // console.log('tab query params --------> ', this.$route.query.tab)
    this.model = this.$route.query.tab || this.formattedLabel(this.tabItems[0].item.tab_block_label)
  },
}
</script>

<style lang="scss">
.theme--dark.v-icon.v-icon.v-icon--disabled {
  color: rgba(0, 0, 0, 0.5) !important;
}

.v-tabs__wrap {
  margin-bottom: 16px;
}

// .v-tabs__wrap .v-icon {
//   color: black !important;
// }

.v-slide-group__prev--disabled {
  color: rgba(0, 0, 0, 0.5) !important;
}

.v-tab--active {
  background-color: var(--v-secondary-base);
}

.tab-content .v-tab--active {
  background-color: var(--v-secondary-lighten6);
  color: black !important;
}

.tab-content .v-tabs-slider {
  background-color: black !important;
  caret-color: black !important;
}

.v-tabs-slider {
  background-color: white !important;
  caret-color: white !important;
}

.v-slide-group__content {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: black;
}

.v-tab {
  text-transform: initial !important;
}

.v-card__text {
  font-size: 16px;
}

.v-tabs-bar .v-tab:not(.v-tab--active) {
  color: rgb(0, 0, 0, 1) !important;
}

// .v-icon {
//   color: rgba(0,0,0,1) !important;
// }

</style>