<template>
  <v-card>
    <v-data-table
        :headers="headers"
        :items="collection"
        item-key="title">
        <template v-slot:top>
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6">
                        <MultipleSelectField :fields="topicsInputField"></MultipleSelectField>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <TextField :fields="titleInputField"></TextField>
                    </v-col>
                </v-row>
            </v-container>
        </template>
        <template v-slot:header.title="{ header }">
            <div class="text-h6 text-capitalize">{{ header.text}}</div>
        </template>
        <template v-slot:header.date="{ header }">
            <div class="text-h6 text-capitalize">{{ header.text }}</div>
        </template>
        <template v-slot:header.topics="{ header }">
            <div class="text-h6 text-capitalize">{{ header.text }}</div>
        </template>
        <template v-slot:item.title="{ item }">
            <a :href="fileLink(item)" target="_blank">{{ item.title }}</a><v-icon right color="secondary">mdi-file-pdf-box</v-icon>
            <div v-if="item.accessible_file"><a :href="fileLink(item)" target="_blank">{{ item.title }}</a>&nbsp;(Accessible.docx)</div>
        </template>
        <template v-slot:item.date="{ item }">
            {{ formatNiceDate(item.date) }}
        </template>
        <template v-slot:item.topics="{ item }">
            {{ getTopics(item.topics) }}
        </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { formatToSlug } from '@/js/utils'
const MultipleSelectField = () => import(/* webpackChunkName: "MultipleSelectField" */ '@/components/inputs/MultipleSelectField')
const TextField = () => import(/* webpackChunkName: "TextField" */ '@/components/inputs/TextField')
// const DataTable = () => import(/* webpackChunkName: "DataTable" */ '@/components/tables/DataTable')

import {
  getFullDate,
  getYear,
  getDay,
  getMonth
} from '@/js/utils'
export default {
  data: () => ({
    API: process.env.VUE_APP_API_URL,
    titleInputField: {
      label: 'Search',
      text: '',
      ref: 'searchInput',
      color: 'secondary',
      icon: 'mdi-magnify',
    },
    topicsInputField: {
      items: [],
      label: 'All Topics',
      ref: 'topicSelectInput',
      selected: null,
      color: 'secondary',
      icon: 'mdi-chevron-down',
      params: 'topic'
    }
  }),
  props: {
    collection: [Array, Object]
  },
  components: {
    MultipleSelectField,
    TextField,
    // DataTable
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
      // console.log('fileLink item ----------> ', item)
      let link
      if (item.file) {
        link = `${ this.API }/assets/${ item.file.id }`
      } else if (item.accessible) {
        link = `${ this.API }/assets/${ item.accessible_file.id }`
      } else if (item.link ) {
        link = item.link
      }
      // console.log('fileLink ----------> ', link)
      return link
    },
    getTopics(topicsArr) {
      let topics
      if(topicsArr.length > 1) {
        topics = topicsArr.join(', ')
      } else {
        topics = topicsArr[0]
      }
      return topics
    },
    topicList() {
      let topicArr = []
      this.collection.map(item => {
        if (item.topics && item.topics.length > 0) {
          item.topics.map(topic => {
            if (!topicArr.includes(topic)) {
              topicArr.push(topic)
            }
          })
        } else if (!topicArr.includes(item)) {
            topicArr.push(item)
        }
        
      })

      this.topicsInputField.items = [...topicArr.sort()]
    },
    titleFilter(value) {
      if (!this.titleInputField.text) {
        return true
      }

      return value.toLowerCase().includes(this.titleInputField.text.toLowerCase())
    },
    topicsFilter(value) {
        console.log('topcis filter value --------> ', value)
        if (!this.topicsInputField.selected || this.topicsInputField.selected === null || this.topicsInputField.selected.length === 0) {
            return true
        }

        return value.some(item => this.topicsInputField.selected.indexOf(item) >= 0)
    },
    addParamsToLocation(params) {
      const query = { path: this.$route.fullPath, ...this.$route.query, query: params }
      this.$router.push(query).catch(() => {})
    },
    formattedLabel(label) {
      return formatToSlug(label)
    },
    topicQueryParams() {
      return  this.$route.query.topic
    }
  },
  computed: {
    headers()  {
      return [
        {
          text: 'Reporter Letters',
          align: 'start',
          sortable: false,
          value: 'title',
          filter: this.titleFilter,
        },
        {
          text: 'Date',
          align: 'start',
          sortable: true,
          value: 'date'
        },
        {
          text: 'Topics',
          align: 'start',
          sortable: false,
          value: 'topics',
          filter: this.topicsFilter,
        }
      ]
    }
  },
  created() {
    setTimeout(function () { this.topicList() }.bind(this), 500)
  },
  mounted() {
    const topics = this.$route.query.topic.split(',')
    this.topicsInputField.selected = topics || null
  }
}
</script>

<style lang="scss" scoped>
.v-card__title {
  align-items: flex-start;
}
</style>