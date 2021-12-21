<template>
  <v-data-table
    :headers="headers"
    :items="collection">
    <template v-slot:item.title="{ item }">
      <a href="#">{{ item.title }}</a><v-icon right color="secondary">mdi-file-pdf-box</v-icon>
      <div v-if="item.accessible_version"><a href="#">{{ item.title }}</a>&nbsp;(Accessible.docx)</div>
    </template>
    <template v-slot:item.date="{ item }">
      {{ formatNiceDate(item.date) }}
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
        value: 'date'
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
    getDay: getDay,
    formatNiceDate(d) {
      return `${ getMonth(d, 'numeric') }/${ getDay(d, 'numeric') }/${ getYear(d) }`
    }
  },
  computed: {
  }
}
</script>