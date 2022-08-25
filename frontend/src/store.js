import Vue from "vue"

export const store = Vue.observable({
  collections: {
    searchQuery: '',
    year: new Date().getFullYear(),
    queryParams: {}
  },
  queryParams: {
    tabs: [],
    panel: ''
  }
})

export const mutations = {
  updateCollections(key, value) {
    console.log('updateCollectionsSearchQuery --------> ', value)
    store.collections[key] = value
  },
  updateQueryParams(key, value) {
    console.log('updateQueryParams --------> ', value)
    store.queryParams[key] = value
  },
}