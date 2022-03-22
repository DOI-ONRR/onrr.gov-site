<template>
  <div class="v-tabs__wrap">
    <v-tabs
      v-model="tab"
      dark
      color="white"
      background-color="white"
      show-arrows
      @change="getSelectedTabs($event)"
      @input="onTabUpdate()">
      <v-tab 
        v-for="(tab, index) in tabItems"
        :key="index"
        :href="`#${ formattedLabel(tab.item.tab_block_label) }`"
        :ref="`tab_label_${ formattedLabel(tab.item.tab_block_label) }`"
        @click="handleClick()">
        <span v-html="tab.item.tab_block_label"></span>
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="tab"
      :key="componentKey">
      <v-tab-item
        v-for="(block, i) in tabItems"
        :key="i"
        :value="formattedLabel(block.item.tab_block_label)">
        <v-card
          text
          elevation="0"
          >
          <v-card-text style="white-space: pre-line;" class="pl-1 pr-1 pt-4 pb-4 text-body-1 tab-content">
            <LayoutBlock :layoutBlocks="block.tabBlocks"></LayoutBlock>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { 
  // store, 
  // mutations 
} from '@/store'
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
      tab: '',
      nestedTab: '',
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
    getSelectedTabs() {
      setTimeout(() => {
        const selectedTabs = document.querySelectorAll('.v-tabs .v-tab--active')
        const selectedNestedTabs = document.querySelectorAll('.v-tabs-items .v-window-item--active .v-tab--active')
        const parentItem = Array.from(selectedTabs).map(item => this.formattedLabel(item.innerText))[0]
        const childItem = Array.from(selectedNestedTabs).map(item => this.formattedLabel(item.innerText))[0]
        const tabs = childItem ? [parentItem, childItem].toString() : parentItem

        console.log('getSelectedTabs selectedTabs, selectedNestedTabs: ', selectedTabs, selectedNestedTabs)

        const query = { path: this.$route.fullPath, ...this.$route.query, query: { tabs: tabs } }
        this.$router.push(query).catch(() => {})
        
      }, 0);
    },
    onTabUpdate(newVal) {
      this.$emit('tab yo!', newVal)
    },
    formattedLabel(label) {
      return formatToSlug(label)
    },
    forceRerender() {
      return this.componentKey += 1
    },
    handleClick() {
      // console.log('handleClick for ---------> ', label)
    }
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
  watch: {
    tab() {
      // console.log('watch this.$refs: ', this.$refs)
      this.$emit('tab', this.tab)
    }
  },
  created() {
    // console.log('create this.$refs: ', this.$refs)
    const activeTab = this.$route.query.tabs.split(',')[0]
    this.tab = activeTab || this.formattedLabel(this.tabItems[0].item.tab_block_label)
  },
  mounted() {
    console.log('TabsBlock mounted!')
    // set nested tab item
    setTimeout(() => {
      const activeTabs = this.$route.query.tabs.split(',')
      
      if (activeTabs.length > 1) {
        const targetEl = `tab_label_${ activeTabs[1] }`
        if (this.$refs[targetEl]) this.$refs[targetEl][0].$el.click()
      }
      
    },0);
  }
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

.theme--light.v-card > .v-card__text, .theme--light.v-card > .v-card__subtitle {
  color: rgb(0, 0, 0, 1) !important;
}

</style>