<template>
  <v-data-table
    :headers="headers"
    :items="collection">
    <template v-slot:item.date="{ item }">
      <v-chip>{{ getYear(item.date, 'numeric') }}</v-chip>
    </template>
  </v-data-table>
</template>

<script>
import {
  getFullDate,
  getYear,
  getDay,
  getMonth
} from '@/js/utils'
export default {
  data: () => ({
    search: '',
    headers: [
      {
        text: 'Reporter Letters',
        align: 'start',
        sortable: true,
        value: 'title'
      },
      {
        text: 'Date',
        align: 'start',
        sortable: true,
      }
    ]
  }),
  props: {
    collection: [Array, Object]
  },
  methods: {
    getFullDate: getFullDate,
    getYear: getYear,
    getMonth: getMonth,
    getDay: getDay
  },
  computed: {
  }
}
</script>