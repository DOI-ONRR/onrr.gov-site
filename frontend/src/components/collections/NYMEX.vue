<template>  
  <v-card>
    <v-data-table
      :headers="headers"
      :items="filteredCollection"
      item-key="month"
      items-per-page="12"
      hide-default-footer>
      <template v-slot:top>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                :items="years"
                :value="maxYear"
                label="Year"
                outlined
                dense
                color="secondary"
                @change="onUpdateStore('year', $event)" 
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:[`item.date`]="{ item }">
        {{ getMonth(item.date, 'long') }}
      </template>
      <template v-slot:[`item.average`]="{ item }">
        ${{ roundHalfUp(item.average, 2) }}
      </template>
      <template v-slot:[`item.roll`]="{ item }">
        ${{ roundHalfUp(item.roll, 2) }}
      </template>
      <template v-slot:[`item.Spreadsheet`]="{ item }">
        <a :href="fileLink(item.Spreadsheet.filename_download)">Download</a>
        <v-icon color="secondary ml-2">mdi-file-excel-box</v-icon>
      </template>
    </v-data-table>
  </v-card>
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
  components: {},
  methods: {
    fileLink(filename) {
      let  link = `${ this.API }/document/${ filename }`  
      return link
    },
    getDay: getDay,
    getMonth: getMonth,
    getFullDate: getFullDate,
    getYear: getYear,
    year() {
      if(store.collections.year > this.maxYear ||  ! store.collections.year ) {
      return this.maxYear
      } else {
       return   store.collections.year
       }      
    },
    onUpdateStore(key, value) {
      mutations.updateCollections(key, value)
    },
    roundHalfUp(value, decimals) {
      return Number(Math.round(value+'e'+decimals)+'e-'+decimals).toFixed(decimals);
    },
},
  computed: {
    search() {
      return store.collections.searchQuery
    },
    maxYear() {
    if(this.collection) {
      const max = [...new Set(this.collection.map(item => this.getYear(item.date)))].sort((a,b)=>a-b).pop();
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
      return []
    }
    },   
    filteredCollection() {
      if(this.collection) {
      const year=this.year() 

        const filtered= this.collection && this.collection.filter( item => this.getYear(item.date) === year.toString() ).sort( (a, b) =>{
          return new Date(a.date) - new Date(b.date)
        });
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
    headers() {
      return [
        { 
          text: 'Month',
          value: 'date' 
        },
        { 
          text: 'Calendar Month Avg.',
          value: 'average',
          align: 'end',
        },
        { 
          text: 'NYMEX Roll',
          value: 'roll' ,
          align: 'end',
        },
        { 
          text: 'Excel File',
          value: 'Spreadsheet'
        },
      ]
    }
  }
}
</script>
