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
        :href="`#${ formattedLabel(tabs[index]) }`"
        @click="addParamsToLocation({ tab: formattedLabel(tabs[index])  });">
        <span v-html="tab"></span>
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="model"
      :key="componentKey">
      <v-tab-item
        v-for="(tab, i) in tabContents"
        :key="i"
        :value="formattedLabel(tabs[i])">
        <v-card
          text
          elevation="0"
          >
          <v-card-text style="white-space: pre-line;" class="pl-0 pr-0 pt-4 pb-4">
            <LayoutBlock :layout="tab.tab_layout" :block="tab" ></LayoutBlock>

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
import { formatToSlug } from '@/js/utils'
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
    addParamsToLocation(params) {
      this.$router.replace({ path: this.$route.path, query: params })
      this.forceRerender()
    },
    formattedLabel(label) {
      return formatToSlug(label)
    },
    forceRerender() {
      return this.componentKey += 1
    },
  },
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
    },
  },
  created() {
    console.log('tab query params --------> ', this.$route.query.tab)
    this.model = this.$route.query.tab || this.formattedLabel(this.tabs[0])
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

.v-tabs__wrap .v-icon {
  color: black !important;
}

.v-slide-group__prev--disabled {
  color: rgba(0, 0, 0, 0.5) !important;
}

.v-tab--active {
  background-color: var(--v-secondary-base);
}

.nested-tabs .v-tab--active {
  background-color: var(--v-secondary-lighten6);
  color: black !important;
}

.v-tabs-slider {
  background-color: white !important;
  caret-color: white !important;
}

.nested-tabs .v-tabs-slider {
  background-color: black !important;
  caret-color: black !important;
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