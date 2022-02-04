<template>
  <v-card>
    <v-card-title>
      <CustomInput
        v-model="topicFilterValue"
        label="All Topics"
        type="text"
        :items="topicItems"
        inputType="select"
        ref="topicSelectInput"
        @change="addParamsToLocation({ topic: topicFilterValue  })" />
      <v-spacer></v-spacer>
      <v-text-field
        v-model="titleFilterValue"
        append-icon="mdi-magnify"
        label="Search"
        outlined
        dense
        color="secondary"
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="collection"
      item-key="title">
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
const CustomInput = () => import(/* webpackChunkName: "CustomInput" */ '@/components/inputs/CustomInput')
import {
  getFullDate,
  getYear,
  getDay,
  getMonth
} from '@/js/utils'
export default {
  data: () => ({
    API: process.env.VUE_APP_API_URL,
    topicFilterValue: null,
    titleFilterValue: '',
    topicItems: [],
  }),
  props: {
    collection: [Array, Object]
  },
  components: {
    CustomInput
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

      this.topicItems = ["All", ...topicArr.sort()]
    },
    titleFilter(value) {
      if (!this.titleFilterValue) {
        return true
      }

      return value.toLowerCase().includes(this.titleFilterValue.toLowerCase())
    },
    topicsFilter(value) {
      if (!this.topicFilterValue || this.topicFilterValue === 'All') {
        return true
      }

      return value.includes(this.topicFilterValue)
    },
    addParamsToLocation(params) {
      this.$router.replace({ path: this.$route.path, query: params })
      this.forceRerender()
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
          sortable: false,
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
    this.topicFilterValue = this.$route.query.topic || null
  }
}
</script>

<style lang="scss" scoped>
.v-card__title {
  align-items: flex-start;
}
</style>