<template>
  <div>
    <ul v-if="blockStyle === 'unordered'">
      <li
      v-for="(item, i) in content"
      :key="i">
      {{ item }}
      </li>
    </ul>
     <ol else>
      <li
      v-for="(item, i) in content"
      :key="i">
      {{ item }}
      </li>
    </ol>
  </div>
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
      return this.block.style
    },
    content() {
      return this.block.data.items
    }
  }
}
</script>