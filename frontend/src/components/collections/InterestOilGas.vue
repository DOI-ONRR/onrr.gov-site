<template>
  <div class="pt-4">
      <v-card>
          <v-data-table
              :headers="headers"
              :items="collectionItems"
              item-key="title"
              class="onrr-data-table">
              <template v-slot:[`item.period`]="{ item }">
                <th>{{ item.period }}</th>
              </template>
              <template v-slot:[`item.indian_underpayment`]="{ item }">
                  {{ item.indian_underpayment }}
              </template>
              <template v-slot:[`item.federal_underpayment`]="{ item }">
                  {{ item.federal_underpayement }}
              </template>
              <template v-slot:[`item.federal_overpayment`]="{ item }">
                  {{ item.federal_overpayement }}
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

export default {
  name: 'InterestOilGasCollection',
  props: {
    collection: [Array, Object]
  },
  data: () => ({
  }),
  components: {
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
    }
  },
  computed: {
    headers() {
      return [
          {
              text: 'Period',
              align: 'start',
              sortable: true,
              value: 'Period',
          },
          {
              text: 'Indian Late and Underpayments',
              align: 'start',
              sortable: true,
              value: 'Indian_Late_and_Underpayments',
          },
          {
              text: 'Federal Late and Underpayments',
              align: 'start',
              sortable: false,
              value: 'Federal_Late_and_Underpayments',
          },
          {
              text: 'Federal Overpayments',
              align: 'end',
              sortable: true,
              value: 'Federal_Overpayments',
          }
      ]
    },
    collectionItems() {
      return this.collection
    }
  },
  created() {
    setTimeout(() => {
      this.designatedAreaList()
      this.yearList()
    }, 300);
  },
  mounted() {
  }
}
</script>