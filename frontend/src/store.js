import Vue from "vue"

export const store = Vue.observable({
  collections: {
    searchQuery: '',
    year: new Date().getFullYear()
  }
})

export const mutations = {
  updateCollections(key, value) {
    console.log('updateCollectionsSearchQuery --------> ', value)
    store.collections[key] = value
  },
}