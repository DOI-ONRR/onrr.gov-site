import Vue from "vue"

export const store = Vue.observable({
  collections: {
    searchQuery: null,
    year: null,
  }
})

export const mutations = {
  updateCollections(key, value) {
    console.log('updateCollectionsSearchQuery --------> ', value)
    store.collections[key] = value
  },
}