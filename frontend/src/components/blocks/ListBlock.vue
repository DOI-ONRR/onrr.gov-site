<template>
  <component :is="block.data.style === 'unordered' ? 'ul' : 'ol'">
    <list-item v-for="(item, i) in block.data.items"
      :content="item.content" :items="item.items" :listStyle="block.data.style" :key="i"/>
  </component>
</template>

<script>
import ListItem from './ListItem.vue';
export default {
  name: 'ListBlock',
  components: {
    ListItem
  },
  data() {
    return {}
  },
  props: {
    block: {
      type: [Object]
    },
  }
}
</script>