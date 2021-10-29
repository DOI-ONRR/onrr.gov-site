<template>
  <div>
    <v-row v-if="layout === 'one_column'">
      <v-col cols="12" sm="12">
        <component :is="pageBlock(block.__typename)" :block="column(1)" :blockItem="block" class="block-component"></component>
      </v-col>
    </v-row>
    <v-row v-if="layout === 'two_column'">
      <v-col cols="12" sm="6" v-for="i in 2" :key="i" class="block-container">
        <component :is="pageBlock(block.__typename)" :block="column(i)" :blockItem="block" class="block-component"></component>
      </v-col>
    </v-row>
    <v-row v-if="layout === 'three_column'">
      <v-col cols="12" sm="4" v-for="i in 3" :key="i" class="block-container">
        <component :is="pageBlock(block.__typename)" :block="column(i)" :blockItem="block" class="block-component"></component>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { editorBlockMixin, pageBlockMixin } from '@/mixins'
export default {
  mixins: [editorBlockMixin, pageBlockMixin],
  name: 'LayoutBlock',
  data() {
    return {}
  },
  props: {
    layout: String,
    block: Object
  },
  mounted() {},
  methods: {
    column(num) {
      let n
      let blocksArr = ['tab_blocks']

      switch (num) {
        case 1:
          n = blocksArr.includes(this.block.__typename) ? this.block : this.block.column_one.blocks
          break
        case 2:
          n = blocksArr.includes(this.block.__typename) ? this.block : this.block.column_two.blocks
          break
        case 3:
          n = blocksArr.includes(this.block.__typename) ? this.block : this.block.column_three.blocks
          break
        default:
          n = undefined
          break
      }
      return n
    },
  }
}
</script>

<style lang="scss" scoped>
.block-container {
  display: flex;
  flex-wrap: wrap;
}
</style>