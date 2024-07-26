<template>
  <nested-list :items="block.data.items" :listType="block.data.style" />
</template>

<script>
import NestedList from './NestedList.vue';

export default {
  name: 'ListBlock',
  components: {
    NestedList
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