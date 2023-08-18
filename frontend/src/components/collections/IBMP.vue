<template>
   <div class="pt-4">
        <v-card>
            <v-data-table
                :headers="headers"
                :items="collectionItems"
                item-key="title"
                items-per-page="12"
                :footer-props="footerProps"
                class="collection-data-table">
                <template v-slot:top>
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6">
                                <SelectField :fields="designatedAreaInputField"></SelectField>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <MultipleSelectField :fields="ibmpYearsInputField"></MultipleSelectField>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
                <template v-slot:[`item.designatedArea`]="{ item }">
                    {{ item.designatedArea }}
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
import { dataTableFooterPropsMixin } from '@/mixins'
const SelectField = () => import(/* webpackChunkName: "SelectField" */ '@/components/inputs/SelectField')
const MultipleSelectField = () => import(/* webpackChunkName: "MultipleSelectField" */ '@/components/inputs/MultipleSelectField')

export default {
  name: 'IBMPCollection',
  mixins: [dataTableFooterPropsMixin],
  data: () => ({
    designatedAreaInputField: {
      items: [],
      label: 'All Areas',
      ref: 'designatedAreaSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'designated_area',
      clearable: true
    },
    ibmpYearsInputField: {
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

        this.designatedAreaInputField.items = [...designatedAreaArr.sort()]
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

        this.ibmpYearsInputField.items = [...yearsArr.sort()].reverse()
    },
    designatedAreaFilter(value) {
      console.log('designatedFilter: ', value)
       if (!this.designatedAreaInputField.selected || this.designatedAreaInputField.selected === null || this.designatedAreaInputField.selected.length === 0) {
          return true
       }

      return value.toLowerCase() === this.designatedAreaInputField.selected.toLowerCase()
    },
    yearFilter(value) {
      // console.log('YearFilter: ', value)
       if (!this.ibmpYearsInputField.selected || this.ibmpYearsInputField.selected === null || this.ibmpYearsInputField.selected.length === 0) {
          return true
       }

       return this.ibmpYearsInputField.selected.indexOf(value) >= 0
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
              text: 'Condensate (02)',
              align: 'end',
              sortable: false,
              value: 'condensate02',
          },
          {
              text: 'Sweet (61)',
              align: 'end',
              sortable: false,
              value: 'sweet61',
          },
          {
              text: 'Sour (62)',
              align: 'end',
              sortable: false,
              value: 'sour62',
          },
          {
              text: 'Asphaltic (63)',
              align: 'end',
              sortable: false,
              value: 'asphaltic63',
          },
          {
              text: 'Black Wax (64)',
              align: 'end',
              sortable: false,
              value: 'blackWax64',
          },
          {
              text: 'Yellow Wax (65)',
              align: 'end',
              sortable: false,
              value: 'yellowWax65',
          }
      ]
    },
    collectionItems() {
      let items = []
      this.collection && this.collection.map(item => {
        item.ibmp_line_items.forEach(row => {
          let nObj = {}
          nObj.year = this.formatYear(item.date)
          nObj.month = item.date
          nObj.designatedArea = row.designatedArea
          nObj.condensate02 =  isNaN(row.condensate02) ? row.condensate02 : formatToDollarInt(row.condensate02)
          nObj.sweet61 =  isNaN(row.sweet61) ? row.sweet61 : this.formatToDollarInt(row.sweet61)
          nObj.sour62 = isNaN(row.sour62) ? row.sour62 : this.formatToDollarInt(row.sour62)
          nObj.asphaltic63 =  isNaN(row.asphaltic63) ? row.asphaltic63 : this.formatToDollarInt(row.asphaltic63)
          nObj.blackWax64 = isNaN(row.blackWax64) ? row.blackWax64 : this.formatToDollarInt(row.blackWax64)
          nObj.yellowWax65 =  isNaN(row.yellowWax65) ? row.yellowWax65 : this.formatToDollarInt(row.yellowWax65)
          items.push(nObj)
        })
      })

      return items
    }
  },
  mounted() {
    const designated_area = this.$route.query.designated_area
    const years = this.$route.query.years && this.$route.query.years.split(',')
    this.designatedAreaInputField.selected = designated_area || null
    this.ibmpYearsInputField.selected = years || null
  },
  watch: {
    apolloLoading: function (newVal, oldVal) {
      if (newVal === 0 && oldVal === 1) {
        this.designatedAreaList();
        this.yearList();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>