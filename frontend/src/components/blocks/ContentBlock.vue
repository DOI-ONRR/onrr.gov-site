<template>
  <div
    :class="[`text-${ contentType } content-block`]"
    v-html="content">
  </div>
</template>

<script>
export default {
  name: 'ContentBlock',
  data () {
    return {}
  },
  props: {
    content: {
      type: String
    },
    contentType: {
      type: String
    }
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