<template>
  <div>
    <keep-alive>
      <component :is="pageBlock(blockContent.type)" :block="blockContent" class="block-component"></component>
    </keep-alive>
  </div>
</template>

<script>
import { pageBlockMixin } from '@/mixins/pageBlockMixin.js'

export default {
  mixins: [pageBlockMixin],
  name: 'EditorBlock'
}
</script>

<style lang="scss" scoped>
.block-component {
  margin: 0 0 16px 0;
}
</style>