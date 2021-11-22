<template>
  <div>
    <keep-alive>
      <component :is="pageBlock(blockContent.type)" :block="blockContent" :key="blockContent.id" class="block-component"></component>
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
  margin: 24px 0;
}
</style>