<template>
  <div class="pt-4">
      <v-card>
          <v-data-table
              :headers="headers"
              :items="collectionItems"
              item-key="title">
              <template v-slot:top>
                  <v-container>
                      <v-row>
                          <v-col cols="12" sm="6">
                              <SelectField :fields="designatedAreaInputField"></SelectField>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <MultipleSelectField :fields="yearInputField"></MultipleSelectField>
                          </v-col>
                      </v-row>
                  </v-container>
              </template>
              <template v-slot:item.designatedArea="{ item }">
                  {{ item.designatedArea }}
              </template>
              <template v-slot:item.year="{ item }">
                  {{ item.year }}
              </template>
              <template v-slot:item.month="{ item }">
                  {{ formatMonth(item.month) }}
              </template>
              <template v-slot:item.price="{ item }">
                  {{ formatToDollarInt(item.price) }}
              </template>
              <template v-slot:item.dueDate="{ item }">
                  {{ item.dueDate }}
              </template>
          </v-data-table>
      </v-card>
  </div>
</template>

<script>
import {
  getYear,
  getMonth,
  formatToDollarInt
} from '@/js/utils'
const SelectField = () => import(/* webpackChunkName: "SelectField" */ '@/components/inputs/SelectField')
const MultipleSelectField = () => import(/* webpackChunkName: "MultipleSelectField" */ '@/components/inputs/MultipleSelectField')

export default {
  name: 'IndianGasMajorPortionCollection',
  props: {
    collection: [Array, Object]
  },
  data: () => ({
    designatedAreaInputField: {
      items: [],
      label: 'All Areas',
      ref: 'designatedAreaSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'index_zone'
    },
    yearInputField: {
      items: [],
      label: 'All Years',
      ref: 'yearSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'index_zone'
    }
  }),
  components: {
    SelectField,
    MultipleSelectField
  },
  methods: {
    getMonth: getMonth,
    getYear: getYear,
    formatToDollarInt: formatToDollarInt,
    formatMonth(date) {
      return getMonth(date, 'long')
    },
    formatYear(date) {
      return getYear(date)
    },
    formatPrice(price) {
      return formatToDollarInt(price)
    },
    designatedAreaList() {
        let designatedAreaArr = []
        this.collectionItems && this.collectionItems.map(item => {
          // console.log('this.collectionItems item: ', item)
          if (item.designatedArea) {
            if (!designatedAreaArr.includes(item.designatedArea)) {
              designatedAreaArr.push(item.designatedArea)
            }
          }            
        })

        this.designatedAreaInputField.items = ['All Areas', ...designatedAreaArr.sort()]
    },
    yearList() {
        let yearsArr = []
        this.collectionItems && this.collectionItems.map(item => {
          // console.log('this.collectionItems item: ', item)
          if (item.year) {
            if (!yearsArr.includes(item.year)) {
              yearsArr.push(item.year)
            }
          }            
        })

        this.yearInputField.items = [...yearsArr.sort()].reverse()
    },
    designatedAreaFilter(value) {
      // console.log('indexZonesFilter: ', value)
       if (!this.designatedAreaInputField.selected || this.designatedAreaInputField.selected === null || this.designatedAreaInputField.selected.length === 0 || this.designatedAreaInputField.selected === 'All Areas') {
          return true
       }

      return value.toLowerCase() === this.designatedAreaInputField.selected.toLowerCase()
    },
    yearFilter(value) {
      // console.log('indexZonesYearFilter: ', value)
       if (!this.yearInputField.selected || this.yearInputField.selected === null || this.yearInputField.selected.length === 0) {
          return true
       }

       return this.yearInputField.selected.indexOf(value) >= 0
    }
  },
  computed: {
    headers() {
      return [
          {
              text: 'Designated Area',
              align: 'start',
              sortable: true,
              value: 'designatedArea',
              filter: this.designatedAreaFilter,
          },
          {
              text: 'Year',
              align: 'start',
              sortable: true,
              value: 'year',
              filter: this.yearFilter,
          },
          {
              text: 'Month',
              align: 'start',
              sortable: false,
              value: 'month',
          },
          {
              text: 'Price',
              align: 'start',
              sortable: false,
              value: 'price',
          },
          {
              text: 'Due Date',
              align: 'start',
              sortable: false,
              value: 'dueDate'
          }
      ]
    },
    collectionItems() {
      let items = []
      
      this.collection && this.collection.map(item => {
        item.index_zones.forEach(zone => {
          let nObj = {}
          let [year, month, day] = zone.dueDate.split('-')
          let formattedDueDate = [month, day, year].join('/')
          nObj.designatedArea = zone.designatedArea
          nObj.year = this.formatYear(item.date)
          nObj.month = item.date
          nObj.price = zone.price
          
          
          nObj.dueDate = formattedDueDate
          items.push(nObj)
        })
      })

      return items
    }
  },
  created() {
    setTimeout(() => {
      this.designatedAreaList()
      this.yearList()
    }, 500);
    
  }
}
</script>