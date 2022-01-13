<template>
  <v-card>
    <v-card-title>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        outlined
        dense
        hide-details
        color="secondary"
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="collection"
      :search="search">
      <template v-slot:header.title="{ header }">
        <div class="text-h6 text-capitalize">{{ header.text}}</div>
      </template>
      <template v-slot:header.date="{ header }">
        <div class="text-h6 text-capitalize">{{ header.text }}</div>
      </template>
      <template v-slot:item.title="{ item }">
        <a :href="fileLink(item)" target="_blank">{{ item.title }}</a><v-icon right color="secondary">mdi-file-pdf-box</v-icon>
        <div v-if="item.accessible_file"><a :href="fileLink(item)" target="_blank">{{ item.title }}</a>&nbsp;(Accessible.docx)</div>
      </template>
      <template v-slot:item.date="{ item }">
        {{ formatNiceDate(item.date) }}
      </template>
    </v-data-table>
  </v-card>
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
    API: process.env.VUE_APP_API_URL,
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
    },
    fileLink(item) {
      console.log('fileLink item ----------> ', item)
      let link
      if (item.file) {
        link = `${ this.API }/assets/${ item.file.id }`
      } else if (item.accessible) {
        link = `${ this.API }/assets/${ item.accessible_file.id }`
      } else if (item.link ) {
        link = item.link
      }
      console.log('fileLink ----------> ', link)
      return link
    },
  },
  computed: {
  }
}
</script>