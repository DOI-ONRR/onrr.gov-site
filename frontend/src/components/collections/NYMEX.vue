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
          <td>{{ item.average }}</td>
          <td>{{ item.roll }}</td>
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
      items: ['2021', '2020', 'Fizz', 'Buzz'],         
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
      if(store.collections.year > this.maxYear ) {
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
       const max = [...new Set(this.collection.map(item => this.getYear(item.date)))].sort((a,b)=>a-b).pop();
       console.log("=====NYMEX max: ", max)
       return max
    },   
    years() {
    if(this.collection) {
      const years = [...new Set(this.collection.map(item => this.getYear(item.date)))].sort((a,b)=>b-a);
      return years;			       
      } else {
       return [2021,2020,2019]
    }
    },   
    filteredCollection() {
    
    const year=this.year() 

    const filtered= this.collection && this.collection.filter( item => this.getYear(item.date) === year).sort( (a, b) =>{
    return new Date(a.date) - new Date(b.date)
    })	;
    return filtered

    },  
    searchResults() {
            // search input results

            const results=this.collection.filter(item => parseInt(this.getYear(item.date)) === this.year).sort( (a, b) => b.date - a.date);
            return results

    },
  }
}
</script>