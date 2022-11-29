<template>
  <div>
    <div v-if="collectionLayout === 'basic'">
      <v-list dense>
        <v-list-item-group
            color="secondary"
          >
            <v-list-item
              v-for="(item, i) in slicedCollection"
              :key="i"
              :href="fileLink(`${ API }/press-releases/`, item)"
              class="pa-0"
              target="_blank"
            >
              <v-list-item-icon class="mr-1">
                <v-icon color="secondary">mdi-file-pdf-box</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.title" class="secondary--text text-body-1 text-wrap text-decoration-underline"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
        </v-list-item-group>
      </v-list>
      <div class="text-center">
        <v-btn
          color="secondary"
          href="/about/public-affairs"
          class="mx-auto">View All</v-btn>
      </div>
    </div>
    <div v-if="collectionLayout === 'full'">
      <CollectionFilterToolbar
        :collection="collection"
        :searchResults="filterCollection"
        ref="collectionFilterToolbar"></CollectionFilterToolbar>

      <template>
        <v-card
          elevation="1"
          v-for="(item, i) in filterCollection"
          :key="i"
          class="ml-1 mr-1 mt-1 mb-4"
          transition="fade-transition">

            <v-list-item
              three-line
              class="pa-2">
              <v-list-item-avatar
                tile
                size="80"
                class="d-flex flex-column justify-start mr-2"
              >
                <div class="secondary--text font-weight-bold text-h1">{{ getDay(item.date, 'numeric') }}</div>
                <div class="font-weight-bold text-uppercase">{{ getMonth(item.date, 'short') }}</div>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1 text-wrap">
                  {{ item.title }} <v-chip v-if="item.status === 'archived'" small color="orange" outlined>{{ item.status }}</v-chip>
                </v-list-item-title>
                <v-list-item-subtitle class="mb-2 black--text">
                  <v-icon>mdi-calendar-month</v-icon> {{ getFullDate(item.date) }}
                </v-list-item-subtitle>
                <div class="mb-2 text-body-1" v-if="item.excerpt" v-html="item.excerpt"></div>
                <div v-if="fileLink(`${ API }/press-releases/`, item)"><a :href="fileLink(`${ API }/press-releases/`, item)" target="_blank">View press release document </a><v-icon color="secondary">mdi-file-pdf-box</v-icon></div>
              </v-list-item-content>
            </v-list-item>
        </v-card>
      </template>
    </div>
  </div>
</template>

<script>
import { store } from '@/store'
import {
  fileCollectionMixin,
  dateMixin
} from '@/mixins'
const CollectionFilterToolbar = () => import(/* webpackChunkName: "CollectionFilterToolbar" */ '@/components/toolbars/CollectionFilterToolbar')
export default {
  name: 'PressReleasesCollection',
  mixins: [fileCollectionMixin, dateMixin],
  data() {
    return {
       API: process.env.VUE_APP_API_URL,
    }
  },
  props: {
    showToolbar: Boolean,
  },
  components: {
    CollectionFilterToolbar
  },
  computed: {
    filterCollection() {     
      const sortedCollection = this.collection && [...this.collection].sort((a,b) => (a.date < b.date) ? 1 : -1)
      const filteredCollection = Number(store.collections.year)
      ? this.filterCollectionByYear(this.filterCollectionBySearch(sortedCollection))
      : this.filterCollectionBySearch(sortedCollection)
      return (!filteredCollection || filteredCollection.length === 0) ? sortedCollection : filteredCollection
    }
  },
  methods: {
    filterCollectionBySearch(collection) {
      const search = store.collections.searchQuery || ''
      const filteredSearch = (search !== '') ? collection.filter(item => search.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))) : collection
      return filteredSearch
    },
    filterCollectionByYear(collection) {
      const year = store.collections.year
      const filteredYear = collection && collection.filter(item => this.getYear(item.date) === year)
      return filteredYear
    },
  }
}
</script>

<style lang="scss" scoped>
.v-list-item--active::before {
  opacity: 0;
}
</style>
