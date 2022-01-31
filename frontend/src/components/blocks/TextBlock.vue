<template>
  <div
    :class="[textClass, 'black--text']"
    v-html="content">
  </div>
</template>

<script>
export default {
  name: 'TextBlock',
  data () {
    return {}
  },
  props: {
    block: {
      type: Object
    }
  },
  computed: {
    textClass() {
      let textClass = ''
      switch (this.block.type) {
        case 'header':
          textClass = `text-h${ this.block.data.level } mt-4 mb-6`
          break
        case 'paragraph':
          textClass = `text-body1`
          break
        default:
          textClass = 'text-body1'
          break
      }

      return textClass
    },
    content() {
      return this.block.data.text
    }
  }
}
</script>

<style lang="scss" scoped>

.text-block {
  margin-bottom: 24px;
}

.text-h1 {
  color: 'pink';
}
</style>