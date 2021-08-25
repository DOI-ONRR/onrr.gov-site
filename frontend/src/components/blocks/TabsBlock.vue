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
        {{ tab }}
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
          <v-card-text>
            {{ tab }}
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
// import NestedTabsBlock from '@/components/blocks/NestedTabsBlock'

export default {
  
  name: 'TabsBlock',
  data () {
    return {
      model: 'tab-0'
    }
  },
  props: {
    block: {
      type: [Object]
    },
  },
  components: {
    // TODO
    // NestedTabsBlock
  },
  methods: {
    checkNested(obj, ...args) {
      return args.reduce((obj, level) => obj && obj[level], obj)
    }
  },
  computed: {
    tabs() {
      return this.block.data.tabs
    },
    tabContents() {
      return this.block.data.tabContents
    }
  }
}
</script>

<style lang="scss" scoped>
.v-tabs__wrap {
  margin-bottom: 16px;
}
</style>