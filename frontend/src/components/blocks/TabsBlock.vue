<template>
  <div class="v-tabs__wrap">
    <v-tabs
      v-model="model"
      background-color="secondary"
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
          text>
          <v-card-text style="white-space: pre-line;">
            <div v-for="block in tab.blocks" :key="block.id">
              <EditorBlock :blockContent="block"></EditorBlock>
            </div>
            <div>
              
            </div>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
// import NestedTabsBlock from '@/components/blocks/NestedTabsBlock'

import { 
  pageBlockMixin,
  pageLayoutMixin,
  editorBlockMixin
} from '@/mixins'

export default {
  mixins: [pageBlockMixin, pageLayoutMixin, editorBlockMixin],
  name: 'TabsBlock',
  data () {
    return {
      model: 'tab-0'
    }
  },
  props: {
    // block: {
    //   type: [Array, Object]
    // },
  },
  components: {
    // TODO
    // NestedTabsBlock
    // EditorBlock
  },
  methods: {
    // checkNested(obj, ...args) {
    //   return args.reduce((obj, level) => obj && obj[level], obj)
    // }
  },
  computed: {
    tabs() {
      return this.block.tab_items.map(item => item.tab_label)
    },
    tabContents() {
      return this.block.tab_items.map(item => item.tab_content_one_column)
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
</style>