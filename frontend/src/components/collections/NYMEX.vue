<template>
 <div>

  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            Month
          </th>
          <th class="text-left">
            Calendar Month Avg.
          </th>
          <th class="text-left">
            NYMEX Roll
          </th>
          <th class="text-left">
            Excel File
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in collection"
          :key="item.id"
        >
          <td>{{ item.month }}</td>
          <td>{{ item.average }}</td>
          <td>{{ item.roll }}</td>
          <div><a :href="fileLink(item.Spreadsheet.id)">Download</a><v-icon color="secondary">mdi-file-xlsx-box</v-icon></div>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
  </div>
</template>

<script>
import { store } from '@/store'
import {
  getDay,
  getMonth,
  getFullDate,
  getYear
} from '@/js/utils'

export default {
  name: 'NYMEXBlock',
  data() {
    return {
      API: process.env.VUE_APP_API_URL
    }
  },
  props: {
    collection: [Object, Array],
    collectionName: String,
    collectionLayout: String,
    showToolbar: Boolean,
  },
  components: {
 //	       CollectionDropdown
   // reference componets
  },
  methods: {
    fileLink(id) {
      let  link = `${ this.API }/assets/${ id }`  
      return link
    },
    getDay: getDay,
    getMonth: getMonth,
    getFullDate: getFullDate,
    getYear: getYear,
  },
  computed: {
    search() {
      return store.collections.searchQuery
    },
    year() {
      return store.collections.year
    },
    searchResults() {
      // search input results
      if(this.search) {
        return this.collection.filter((item) => {
          // this.collection.filter(item => parseInt(this.getYear(item.date)) === this.year)
          const results = this.search.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
          return results
        })    
      } else {
        return this.collection
      }
    },
  }
}
</script>