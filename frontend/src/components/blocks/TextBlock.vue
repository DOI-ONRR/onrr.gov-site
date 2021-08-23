<template>
  <div
    :class="[textClass, 'text-block']"
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
    content: {
      type: String
    },
    contentLevel: {
      type: String
    },
    contentType: {
      type: String
    }
  },
  computed: {
    textClass() {
      let textClass = ''
      switch (this.contentType) {
        case 'header':
          textClass = `text-h${ this.contentLevel }`
          break
        case 'paragraph':
          textClass = `text-body1`
          break
        default:
          textClass = 'text-body1'
          break
      }

      return textClass
    }
  }
}
</script>

<style lang="scss" scoped>
.text-block {
  margin-bottom: 24px;
}
</style>