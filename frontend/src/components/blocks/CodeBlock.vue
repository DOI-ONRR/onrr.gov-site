<template>
  <div v-html="html"></div>
</template>

<script>
export default {
  name: 'CodeBlock',
  data() {
    return {
      template: ''
    }
  },
  props: {
    block: {
      type: Object
    }
  },
  computed: {
    html() {
      return this.block.data.code
    }
  }
}
</script>