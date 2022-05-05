<template>
  <div>
    <v-row>
      <v-col 
        v-for="block in layoutItems" 
        :key="block.id" 
        cols="12" 
        sm="12"
        :md="block.item.layoutCol" 
        :class="[
          'layout-block-container',
          block.item.__typename, 
          block.item.equal_col_height ? 'flex' : 'no-flex']">
        <v-row>
          <v-col 
            v-for="nestedBlock in block.nestedBlocks" 
            :key="nestedBlock.id" 
            sm="12"
            :md="nestedBlock.item.block_v_col" 
            :class="[
              'nested-block-container', 
              nestedBlock.item.__typename, 
              nestedBlock.item.equal_col_height ? 'flex' : 'no-flex']">
            <component :is="pageBlock(nestedBlock.item.__typename)" :block="nestedBlock" class="block-component"></component>
          </v-col>
        </v-row>
      </v-col>
      <!-- <v-row>
        <v-col v-for="block in layoutBlocks" :key="block.id" sm="12" :md="block.item.block_v_col"  :class="['block-container', block.item.__typename, block.item.equal_col_height ? 'flex' : 'no-flex']">
          <component :is="pageBlock(block.item.__typename)" :block="block" class="block-component"></component>
        </v-col>
      </v-row> -->
    </v-row>
  </div>
</template>

<script>
import { editorBlockMixin, pageBlockMixin } from '@/mixins'
export default {
  mixins: [editorBlockMixin, pageBlockMixin],
  name: 'LayoutBlock',
  data() {
    return {
      columnLayouBlockPresent: false
    }
  },
  props: {
    layoutBlocks: Array,
    // layoutBlocksRight: Array
  },
  computed: {
    layoutItems() {
      const columnLayouBlockPresent = this.layoutBlocks && this.layoutBlocks.some(obj => obj.item.__typename === 'layout_column_blocks')
      const layoutBlocks = this.layoutBlocks
      const layoutItems = [{item: { block_v_col: "12" }, nestedBlocks: []}]
      
      if (columnLayouBlockPresent) {
        layoutBlocks && layoutBlocks.forEach(obj => {

          if(obj.item !== null) {
            if (obj.item.__typename === 'layout_column_blocks') {
              layoutItems.push({ ...obj, nestedBlocks: [] })
            } else {
              layoutItems[layoutItems.length - 1].nestedBlocks.push(obj)
            }
          }
        })
      } else {
        layoutBlocks && layoutBlocks.forEach(obj => {
          if(obj.item !== null) {
            layoutItems[layoutItems.length - 1].nestedBlocks.push(obj)
          }
        })
      }
      return layoutItems
    }
  }
}
</script>

<style lang="scss" scoped>
.home__wrap .block-container {
  display: flex;
  flex-wrap: wrap;
}

.nested-block-container.card_blocks.flex,
.nested-block-container.content_blocks.flex {
  display: flex;
}

.nested-block-container.card_blocks.no-flex,
.nested-block-container.content_blocks.no-flex {
  display: block;
}

.nested-block-container.content_blocks.flex .block-component {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 0 1;
}
</style>