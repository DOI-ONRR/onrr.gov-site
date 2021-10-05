<template>
  <div>
    Content block yo!
    <EditorBlock :blockContent="block"></EditorBlock>
  </div>
</template>

<script>
import { editorBlockMixin } from '@/mixins'
export default {
  mixins: [editorBlockMixin],
  name: 'ContentBlock',
  data () {
    return {}
  },
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