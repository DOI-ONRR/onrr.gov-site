<template>
  <v-form>
    <v-container class="pa-0">
      <v-row>
        <v-col
          cols="12"
          sm="4"
        >
          <TextField 
            :fields="searchInputField" 
            @update="onUpdateStore('searchQuery', $event); $emit('searchUpdateEvent', searchInputField.text);"></TextField>
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <SelectField 
            :fields="yearSelectField" 
            @update="onUpdateStore('year', $event);  $emit('yearUpdateEvent', year);"></SelectField>
        </v-col>
        <v-col
          cols="12"
          sm="4"
          class="mt-1"
        >
          <v-chip>{{ (searchResults && searchResults.length > 1) ? `${ searchResults && searchResults.length } items` : `${ searchResults && searchResults.length } item` }}</v-chip>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import { store, mutations } from '@/store'
import { getYear } from '@/js/utils'

const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')
const SelectField = () => import(/* webpackChunkName: "SelectField" */ '@/components/inputs/SelectField')

export default {
  name: 'CollectionFilterToolbar',
  data() {
    return {
      year: store.collections.year, 
      search: store.collections.searchQuery,
      items: [],
      searchInputField: {
        label: 'Search',
        text:  store.collections.searchQuery,
        ref: 'searchInput',
        color: 'secondary',
        icon: 'mdi-magnify',
        update: this.onUpdateStore('searchQuery')
      },
      yearSelectField: {
        items: [],
        label: 'Year',
        ref: 'yearSelectInput',
        selected: null,
        color: 'secondary',
        icon: 'mdi-chevron-down',
        clearable: false
      }
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
    TextField,
    SelectField
  },
  methods: {
     onUpdateStore(key, value) {
        mutations.updateCollections(key, value)
     },
     getYears() {
      const years = this.yearSelectField.selected !== 'All Years' && this.collection.map(item => this.getYear(item.date)).sort((a, b) => b - a)
      this.yearSelectField.items = ['All Years', ... new Set(years)]
      this.yearSelectField.selected = this.yearSelectField.items[0]
      this.onUpdateStore('year', this.yearSelectField.items[0])
     },
     getYear: getYear,
  },
  watch: {
    '$route.query.tab'() {
      this.onUpdateStore('year', this.$refs.yearSelectInput.value || this.yearSelectField.items[0])
    }
  },
  created() {
    setTimeout(function () { this.getYears() }.bind(this), 500)
  },
}
</script>