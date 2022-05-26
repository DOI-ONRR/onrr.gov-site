<template>
  <div class="pt-4">
      <v-card>
          <v-data-table
              :headers="headers"
              :items="collectionItems"
              item-key="title">
              <template v-slot:[`item.period`]="{ item }">
                  {{ item.period }}
              </template>
              <template v-slot:[`item.fedieral_and_indian_underpayment`]="{ item }">
                  {{ item.indian_underpayment }}
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
  name: 'InterestSolids',
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
              text: 'Federal and Late and Underpayments',
              align: 'start',
              sortable: false,
              value: 'Federal_and_Indian_Late_and_Underpayments',
          },
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