<template>
  <div>
  <CollectionDropdown
    title="Simple Filter"
    . text="Click to filter"
    :items="[
      {text: 'Item 1'},
      {text: 'Item 2'}
    ]">
    </CollectionDropdown>
</templated>


<script>

export default {
  name: 'CollectionDropdown',
  data() {
    return {
      items: [2021, 2020, 2019, 2018], 
    }
  },
  props: {
    collection: {
      type: [Object, Array]
    },
    showToolbar: {
      type: Boolean,
    }
  },
  components: {
  //CustomInput
  },
  methods: {
     onUpdateStore(key, value) {
        mutations.updateCollections(key, value)
     }
  },
  computed: {
    year() {
      return store.collections.year
    },
    getYear() {
      return this.year || this.items[0]
    },
    getItems() {
      return this.collection(item => item.date)
    }
  }
}
</script>