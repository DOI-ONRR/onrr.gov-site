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
    store.collections[key] = value
  },
  updateQueryParams(key, value) {
    store.queryParams[key] = value
  },
}