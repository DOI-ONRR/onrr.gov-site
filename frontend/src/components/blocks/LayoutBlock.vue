<template>
  <v-row>
    <v-col v-for="block in layoutBlocks" :key="block.id" sm="12" :md="block.item.block_v_col">
      <component :is="pageBlock(block.item.__typename)" :block="block" class="block-component"></component>
    </v-col>
  </v-row>
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
    layoutBlocks: Array
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
</style>