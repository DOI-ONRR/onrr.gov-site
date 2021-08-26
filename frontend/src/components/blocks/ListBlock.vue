<template>
  <v-list
    :tag="listTag">
    <v-list-item
    v-for="(item, i) in content"
    :key="i"
    tag="li">
    {{ item }}
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: 'ListBlock',
  data() {
    return {}
  },
  props: {
    block: {
      type: [Object]
    },
  },
  computed: {
    listTag() {
      const tag = this.block.style === 'ordered' ? 'ol' : 'ul'
      return tag
    },
    content() {
      return this.block.data.items
    }
  }
}
</script>