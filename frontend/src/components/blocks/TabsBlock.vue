<template>
  <div class="v-tabs__wrap">
    <v-tabs
      :background-color="`${ this.nestedTabs ? 'secondary' : 'shades white' }`"
      :color="`${ this.nestedTabs ? 'white' : 'grey darken-4' }`"
      v-model="model"
      dark>
      <v-tab 
        v-for="(tab, index) in tabs"
        :key="index"
        :href="`#tab-${ index }`">
        <span v-html="tab"></span>
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="model">
      <v-tab-item
        v-for="(tab, index) in tabContents"
        :key="index"
        :value="`tab-${ index }`">
        <v-card
          text
          elevation="0">
          <v-card-text style="white-space: pre-line;">
            <component :is="pageLayout(tab.tab_layout)" :block="tab">
              <div v-for="block in tab.blocks" :key="block.id">
                {{ block }}
              </div>
            </component>
            <div v-if="tab.tab_items">
              <TabsBlock :block="nestedTabs" class="nested-tabs"></TabsBlock>
            </div>
            
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { 
  pageBlockMixin,
  pageLayoutMixin,
  editorBlockMixin
} from '@/mixins'

export default {
  mixins: [pageBlockMixin, pageLayoutMixin, editorBlockMixin],
  name: 'TabsBlock',
  template: '<div><TabsBlock></TabsBlock></div>',
  data () {
    return {
      model: 'tab-0'
    }
  },
  props: {
    block: [Array, Object]
  },
  // components: {},
  // methods: {},
  computed: {
    tabs() {
      const tabs = this.block && this.block.tab_items.map(item => item.tab_label)

      return tabs
    },
    tabContents() {
      return this.block.tab_items
    },
    nestedTabs() {
      const tItems = this.block.tab_items
      const nItems = tItems.filter(item => Object.prototype.hasOwnProperty.call(item, 'tab_items'))
      let nObj = {}
      nObj = nItems[0]
  
      return nObj
    },
    tabsBackgroundColor() {
      let color = this.block.tab_items.length > 0 ? 'deeppink': 'secondary'
      return color
    }
  },
  mounted() {
    console.log('tabs block mounted!')
  }
}
</script>

<style lang="scss" scoped>
.v-tabs__wrap {
  margin-bottom: 16px;
}

// .v-tabs__wrap.nested-tabs .v-slide-group__content {
//   background: transparent;
// }
</style>