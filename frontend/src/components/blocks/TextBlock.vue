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
      let alignmentClass = `text-${ this.block?.tunes?.alignmentTune?.alignment }` || 'text-left'

      switch (this.block.type) {
        case 'header':
          textClass = `text-h${ this.block.data.level } ${ alignmentClass } mt-4 mb-6`
          break
        case 'paragraph':
          textClass = `text-body1 ${ alignmentClass }`
          break
        default:
          textClass = `text-body1 ${ alignmentClass }`
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