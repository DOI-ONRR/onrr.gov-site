<template>
  <div class="v-tabs__wrap">
    <v-tabs
      v-model="model"
      dark
      color="white"
      background-color="white"
      show-arrows>
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
          <v-card-text style="white-space: pre-line;" class="pl-0 pr-0 pt-4 pb-4">
            <LayoutBlock :layout="tab.tab_layout" :block="tab"></LayoutBlock>

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
const LayoutBlock = () => import(/* webpackChunkName: "LayoutBlock" */ '@/components/blocks/LayoutBlock')

import { 
  pageBlockMixin,
  editorBlockMixin
} from '@/mixins'

export default {
  mixins: [pageBlockMixin, editorBlockMixin],
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
  components: {
    LayoutBlock
  },
  // methods: {},
  computed: {
    tabs() {
      const tabs = this.block.tab_items.map(item => item.tab_label)

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
    }
  },
  mounted() {
    console.log('tabs block mounted!')
  }
}
</script>

<style lang="scss">
.v-tabs__wrap {
  margin-bottom: 16px;
}

.v-tab--active {
  background-color: var(--v-secondary-base);
}

.nested-tabs .v-tab--active {
  background-color: var(--v-secondary-lighten6);
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

.v-icon {
  color: rgba(0,0,0,1) !important;
}

</style>