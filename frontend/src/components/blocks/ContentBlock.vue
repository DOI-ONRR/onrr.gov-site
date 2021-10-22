<template>
  <div>
    <div v-for="blockItem in block" :key="blockItem.id">
      <EditorBlock :blockContent="blockItem"></EditorBlock>
    </div>
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