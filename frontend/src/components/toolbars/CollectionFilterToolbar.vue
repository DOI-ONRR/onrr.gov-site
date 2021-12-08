<template>
  <v-form>
    <v-container class="pa-0">
      <!-- {{search}} -- {{ color }} -- {{ email }} -->
      <!-- <CustomInput v-model="color" label="Select color" type="color" inputType="text" />
      <CustomInput v-model="email" label="Email" type="email" inputType="text" /> -->
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
            label="Year"
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
          <v-chip>{{ (collection.length > 1) ? `${ searchResults.length } items` : `${ searchResults.length } item` }}</v-chip>
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
      search: store.collections.searchQuery,
      color: '',
      email: '',
      items: [], 
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
      type: String
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
       const years = this.collection.map(item => this.getYear(item.date))
       this.items = [... new Set(years)]
     },
     getYear: getYear,
  },
  created() {
    this.getYears()
  },
  computed: {
    year() {
      return store.collections.year
    },
    getItems() {
      return this.collection(item => item.date)
    }
  }
}
</script>