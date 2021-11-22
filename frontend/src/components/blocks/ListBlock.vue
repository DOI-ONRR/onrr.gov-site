<template>
  <component :is="blockStyle === 'unordered' ? 'ul' : 'ol'">
    <li
    v-for="(item, i) in content"
    :key="i">
      <span v-html="item"></span>
    </li>
  </component>
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
    blockStyle() {
      return this.block.data.style
    },
    content() {
      return this.block.data.items
    }
  }
}
</script>