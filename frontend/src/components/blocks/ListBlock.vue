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
    content: {
      type: [Array]
    },
    listStyle: {
      type: String
    }
  },
  computed: {
    listTag() {
      const tag = this.listStyle === 'ordered' ? 'ol' : 'ul'
      return tag
    }
  }
}
</script>