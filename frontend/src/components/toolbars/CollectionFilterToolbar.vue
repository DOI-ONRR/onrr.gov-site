<template>
  <v-form>
    <v-container class="pa-0">
      <v-row>
        <v-col
          cols="12"
          sm="4"
        >
          <CustomInput 
            v-model="search"
            label="Search"
            type="search"
            inputType="text"
            icon="mdi-magnify"
            @update="onUpdateStore('searchQuery', $event)" />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <CustomInput 
            v-model="year"
            :item-value="year"
            label="All Years"
            type="text"
            :items="items"
            inputType="select"
            @update="onUpdateStore('year', $event)" />
        </v-col>
        <v-col
          cols="12"
          sm="4"
          class="mt-1"
        >
          <v-chip>{{ (items.length > 1) ? `${ searchResults.length } items` : `${ searchResults.length } item` }}</v-chip>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import { store, mutations } from '@/store'
import { getYear } from '@/js/utils'
const CustomInput = () => import(/* webpackChunkName: "CustomInput" */ '@/components/inputs/CustomInput')
export default {
  name: 'CollectionFilterToolbar',
  data() {
    return {
      year: '', 
      items: [],
      search: store.collections.searchQuery
    }
  },
  props: {
    collection: {
      type: [Object, Array]
    },
    showToolbar: {
      type: Boolean,
    },
    searchResults: {
      type: Array
    }
  },
  components: {
    CustomInput
  },
  methods: {
     onUpdateStore(key, value) {
        mutations.updateCollections(key, value)
     },
     getYears() {
       const years = this.collection && this.collection.map(item => this.getYear(item.date))
       this.items = [... new Set(years)]
       this.year = this.items[0]
       this.onUpdateStore('year', this.items[0])
     },
     getYear: getYear,
  },
  created() {
    this.getYears()
    this.onUpdateStore('year', this.items[0])
  },
}
</script>