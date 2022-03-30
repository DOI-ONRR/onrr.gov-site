<template>
<div>
<v-select
          :items="years"
          :value="maxYear"
          label="Year"
          outlined
          @change="onUpdateStore('year', $event)" 
        ></v-select>
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
          v-for="item in filteredCollection"
          :key="item.id"
        >
          <td>{{ getMonth(item.date, 'long') }}</td>
          <td>${{ item.average.toFixed(2) }}</td>
          <td>${{ item.roll.toFixed(2) }}</td>
          <td><div><a :href="fileLink(item.Spreadsheet.id)">Download</a><v-icon color="secondary">mdi-file-xlsx-box</v-icon></div></td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
  </div>
</template>

<script>
import { store, mutations } from '@/store'
import {
  getDay,
  getMonth,
  getFullDate,
  getYear
} from '@/js/utils'

export default {
  name: 'NYMEXCollection',
  data() {
    return {
      items: [],         
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
 //            CollectionDropdown
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
    year() {
        console.debug('----------------------STORE COLLECTION--------------------------------------------------------->',store.collections.year)
      if(store.collections.year > this.maxYear ||  ! store.collections.year ) {
      return this.maxYear
      } else {
       return	store.collections.year
       }      
    },
     onUpdateStore(key, value) {
      console.log("NYMEX onUpdateStore: ", key, value,  store)
        mutations.updateCollections(key, value)
     },

},
  computed: {
    search() {
      return store.collections.searchQuery
    },
    maxYear() {
    if(this.collection) {
      const max = [...new Set(this.collection.map(item => this.getYear(item.date)))].sort((a,b)=>a-b).pop();
      console.log("=====NYMEX max: ", max)
      return max
    } else {
      return 2022
    }
      
    },   
    years() {
    if(this.collection) {
      const years = [...new Set(this.collection.map(item => this.getYear(item.date)))].sort((a,b)=>b-a);
      return years;			       
    } else {
      return ['2022', '2021']
    }
    },   
    filteredCollection() {
      if(this.collection) {
      const year=this.year() 
      console.debug('------------------------------------------------------', this.collection, '------------------------->', year)
      const filtered= this.collection && this.collection.filter( item => this.getYear(item.date) === year).sort( (a, b) =>{
        return new Date(a.date) - new Date(b.date)
      });

        console.debug('------------------------------------------------------------------------------->', filtered)	

        return filtered
      } else {
        return []
      }
    },  
    searchResults() {
            // search input results

            const results=this.collection.filter(item => parseInt(this.getYear(item.date)) === this.year).sort( (a, b) => b.date - a.date);
            return results

    },
  }
}
</script>
