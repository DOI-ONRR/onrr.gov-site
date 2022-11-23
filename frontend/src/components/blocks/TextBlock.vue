<template>
  <div
    :role="textRole"
    :aria-level="textLevel"
    :aria-label="textLabel"
    :class="[textClass, 'black--text']"
    :variant="textVariant"
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
    textRole() {
      let role = ''

      switch (this.block.type) {
        case 'header':
          role = `heading`
          break
        case 'paragraph':
          role=''    
          break
        default:
          role=''
        break
      }

      return role
    },
    
    textLevel() {
      let level = ''

      switch (this.block.type) {
        case 'header':
          level = this.block.data.level
          break
        case 'paragraph':
          level=''    
          break
        default:
          level=''
        break
      }

      return level
    },
    
    textVariant() {
      let variant = ''

      switch (this.block.type) {
        case 'header':
          variant = `h${this.block.data.level}`
          break
        case 'paragraph':
         variant = `body1`
          break
        default:
          variant = `body1`
          break
      }

      return variant
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