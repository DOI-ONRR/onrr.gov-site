<template>
  <div class="v-tabs__wrap">
    <v-tabs
      v-model="model"
      background-color="secondary"
      dark>
      <v-tab 
        v-for="(tab, index) in content"
        :key="index"
        :href="`#tab-${ index }`">
        {{ tab.item.tab_label }}
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="model">
      <v-tab-item
        v-for="(tab, index) in content"
        :key="index"
        :value="`tab-${ index }`">
        <v-card
          flat>
          <v-card-text v-if="checkNested(tab.item.tab_blocks)">
            <NestedTabsBlock :content="tab.item.tab_blocks"></NestedTabsBlock>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import NestedTabsBlock from '@/components/blocks/NestedTabsBlock'

export default {
  
  name: 'TabsBlock',
  data () {
    return {
      model: 'tab-0'
    }
  },
  props: {
    content: {
      type: [String, Array]
    },
    contentType: {
      type: String
    }
  },
  components: {
    NestedTabsBlock
  },
  methods: {
    checkNested(obj, ...args) {
      return args.reduce((obj, level) => obj && obj[level], obj)
    }
  }
}
</script>

<style lang="scss" scoped>
.v-tabs__wrap {
  margin-bottom: 16px;
}
</style>