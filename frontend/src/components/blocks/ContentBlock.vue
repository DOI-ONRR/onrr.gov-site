<template>
  <div>
    <div v-for="block in (block.item.block_content && block.item.block_content.blocks) || []" :key="block.id">
      <EditorBlock :blockContent="block"></EditorBlock>
    </div>
  </div>
</template>

<script>
import { editorBlockMixin, pageBlockMixin } from '@/mixins'
export default {
  mixins: [editorBlockMixin, pageBlockMixin],
  name: 'ContentBlock',
  data () {
    return {}
  },
  props: {
    block: [Array, Object]
  }
}
</script>

<style lang="scss" scoped>
.content-block {
  h2 {
    font-size: 1.5rem !important;
  }
}
.text-h4 {
  margin-bottom: 24px;
}
</style>