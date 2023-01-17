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
                                <SelectField :fields="indexZonesInputField"></SelectField>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <MultipleSelectField :fields="indexZonesYearsInputField"></MultipleSelectField>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
                <template v-slot:[`item.index_zone`]="{ item }">
                    {{ item.index_zone }} ({{ item.abbreviation }})
                </template>
                <template v-slot:[`item.year`]="{ item }">
                    {{ item.year }}
                </template>
                <template v-slot:[`item.month`]="{ item }">
                    {{ formatMonth(item.month) }}
                </template>
                <template v-slot:[`item.price`]="{ item }">
                    {{ formatToDollarInt(item.price) }}
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
  name: 'IndexZonesCollection',
  data: () => ({
    indexZonesInputField: {
      items: [],
      label: 'Index Zone',
      ref: 'indexZoneSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'index_zone',
      clearable: true
    },
    indexZonesYearsInputField: {
      items: [],
      label: 'All Years',
      ref: 'indexZoneSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'years'
    }
  }),
  props: {
    collection: [Array, Object],
    apolloLoading: Number
  },
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
    indexZonesList() {
        let indexZonesArr = []
        this.collectionItems && this.collectionItems.map(item => {
          // console.log('this.collectionItems item: ', item)
          if (item.index_zone) {
            if (!indexZonesArr.includes(item.index_zone)) {
              indexZonesArr.push(item.index_zone)
            }
          }            
        })

        this.indexZonesInputField.items = [...indexZonesArr.sort()]
    },
    indexZonesYearList() {
        let yearsArr = []
        this.collectionItems && this.collectionItems.map(item => {
          // console.log('this.collectionItems item: ', item)
          if (item.year) {
            if (!yearsArr.includes(item.year)) {
              yearsArr.push(item.year)
            }
          }            
        })

        this.indexZonesYearsInputField.items = [...yearsArr.sort().reverse()]
    },
    indexZonesFilter(value) {
      // console.log('indexZonesFilter: ', value)
       if (!this.indexZonesInputField.selected || this.indexZonesInputField.selected === null || this.indexZonesInputField.selected.length === 0) {
          return true
       }

      return value.toLowerCase() === this.indexZonesInputField.selected.toLowerCase()
    },
    indexZonesYearFilter(value) {
      // console.log('indexZonesYearFilter: ', value)
       if (!this.indexZonesYearsInputField.selected || this.indexZonesYearsInputField.selected === null || this.indexZonesYearsInputField.selected.length === 0) {
          return true
       }

       return this.indexZonesYearsInputField.selected.indexOf(value) >= 0
    }
  },
  computed: {
    headers() {
      return [
          {
              text: 'Index Zone',
              align: 'start',
              sortable: true,
              value: 'index_zone',
              filter: this.indexZonesFilter,
          },
          {
              text: 'Year',
              align: 'start',
              sortable: true,
              value: 'year',
              filter: this.indexZonesYearFilter,
          },
          {
              text: 'Month',
              align: 'start',
              sortable: false,
              value: 'month',
          },
          {
              text: 'Price',
              align: 'end',
              sortable: false,
              value: 'price',
          }
      ]
    },
    collectionItems() {
      let items = []
      this.collection && this.collection.map(item => {
        item.index_zones.forEach(zone => {
          let nObj = {}
          nObj.index_zone = zone.index_zone
          nObj.year = this.formatYear(item.date)
          nObj.month = item.date
          nObj.price = zone.price
          nObj.abbreviation = zone.abbreviation
          items.push(nObj)
        })
      })

      return items
    }
  },
  mounted() {
    const index_zone = this.$route.query.index_zone;
    const years = this.$route.query.years && this.$route.query.years.split(',');
    this.indexZonesInputField.selected = index_zone || null;
    this.indexZonesYearsInputField.selected = years || null;
  },
  watch: {
    apolloLoading: function (newVal, oldVal) {
      if (newVal === 0 && oldVal === 1) {
        this.indexZonesList();
        this.indexZonesYearList();
      }
    }
  }
}
</script>