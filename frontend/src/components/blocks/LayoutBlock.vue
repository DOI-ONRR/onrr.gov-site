<template>
  <v-row>
    <v-col v-for="block in layoutBlocks" :key="block.id" sm="12" :md="block.item.block_v_col"  :class="['block-container', block.item.__typename]">
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
  }
}
</script>

<style lang="scss" scoped>
.home__wrap .block-container {
  display: flex;
  flex-wrap: wrap;
}

.block-container.card_blocks {
  // display: flex;
  // flex-wrap: wrap;
}
</style>